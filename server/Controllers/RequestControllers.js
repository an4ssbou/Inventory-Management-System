const mongoose = require('mongoose');
const Request = require('../Models/Request');
const User = require('../Models/User');
const Material = require('../Models/Material');
const { sendEmail } = require('../sendMail');
const { requestCreateSchema, requestUpdateSchema, searchSchema, validate } = require('../Utils/validation');

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createRequest = async (req, res) => {
  try {
    const data = validate(requestCreateSchema, req.body);
    const material = await Material.findById(data.matériel);

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    const request = await Request.create({
      utilisateur: req.user.id,
      matériel: data.matériel,
      prise: data.prise,
      retour: data.retour || null,
      status: 'En Attente',
    });

    return res.status(201).json({ request });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const deleteAllRequests = async (req, res) => {
  try {
    const requests = await Request.deleteMany({});
    return res.json({ message: `Deleted ${requests.deletedCount} documents.` });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const deleteRequest = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid request id' });
    }

    const request = await Request.findByIdAndDelete(req.params.id).populate('matériel');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status === 'Validée' && request.matériel?.type === 'Non Consommable') {
      await Material.findByIdAndUpdate(request.matériel._id, { status: 'Disponible' });
    }

    return res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const notifyRequestStatus = async (request, status) => {
  const populatedRequest = await Request.findById(request._id)
    .populate('utilisateur', '-password')
    .populate('matériel');

  if (!populatedRequest?.utilisateur?.email || !populatedRequest?.matériel) return;

  const approved = status === 'Validée';
  await sendEmail({
    subject: approved ? 'Validation de votre demande de matériel' : 'Refus de votre demande de matériel',
    text: `Bonjour ${populatedRequest.utilisateur.nom} ${populatedRequest.utilisateur.prénom},

Votre demande de matériel ${populatedRequest.matériel.designation} a été ${approved ? 'validée' : 'refusée'}.

Service Informatique
CHU Oujda`,
    to: populatedRequest.utilisateur.email,
    from: process.env.EMAIL,
  });
};

const editRequest = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid request id' });
    }

    const data = validate(requestUpdateSchema, req.body);
    const request = await Request.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (data.status === 'Validée' && request.matériel) {
      const material = await Material.findById(request.matériel);
      if (material) {
        material.status = material.type === 'Non Consommable' ? 'Emprunté' : 'Consommé';
        await material.save();
      }
    }

    if (data.status === 'Refusée' && request.matériel) {
      const material = await Material.findById(request.matériel);
      if (material && material.status !== 'Disponible') {
        material.status = 'Disponible';
        await material.save();
      }
    }

    if (data.status === 'Validée' || data.status === 'Refusée') {
      await notifyRequestStatus(request, data.status);
    }

    return res.json({ request });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getUserRequests = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const requesterIsOwner = req.user.id === req.params.id;
    const requester = await User.findById(req.user.id).select('Role');
    if (!requesterIsOwner && requester?.Role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const status = req.query.status ? validate(searchSchema, req.query.status) : undefined;
    const query = { utilisateur: req.params.id };
    if (status) query.status = status;

    const requests = await Request.find(query).populate('matériel');
    return res.json({ requests });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getRequests = async (req, res) => {
  try {
    const nom = validate(searchSchema, req.query.nom);
    const status = validate(searchSchema, req.query.status);
    const matériel = validate(searchSchema, req.query.matériel);
    const filter = {};

    if (nom) {
      const users = await User.find({ nom: { $regex: escapeRegex(nom), $options: 'i' } }).select('_id');
      filter.utilisateur = { $in: users.map((user) => user._id) };
    }

    if (status) filter.status = status;

    if (matériel) {
      const mat = await Material.findOne({ designation: { $regex: escapeRegex(matériel), $options: 'i' } }).select('_id');
      if (!mat) return res.json({ requests: [] });
      filter.matériel = mat._id;
    }

    const requests = await Request.find(filter)
      .populate('utilisateur', '-password')
      .populate('matériel');

    return res.json({ requests });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const exportRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('utilisateur', '-password')
      .populate('matériel');

    const data = requests.map((request) => ({
      Utilisateur: request.utilisateur ? `${request.utilisateur.nom} ${request.utilisateur.prénom}` : 'N/A',
      Matériel: request.matériel ? request.matériel.designation : 'N/A',
      Prise: request.prise ? request.prise.toISOString().split('T')[0] : 'N/A',
      Retour: request.retour ? request.retour.toISOString().split('T')[0] : 'N/A',
      Status: request.status,
    }));

    const headers = ['Utilisateur', 'Matériel', 'Prise', 'Retour', 'Status'];
    const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [
      headers.join(','),
      ...data.map((row) => headers.map((header) => escapeCsv(row[header])).join(',')),
    ].join('\n');

    res.setHeader('Content-Disposition', 'attachment; filename="requests.csv"');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    return res.send(`\uFEFF${csv}`);
  } catch (error) {
    console.error('Error exporting requests to CSV:', error);
    return res.status(500).send('Server error');
  }
};

module.exports = {
  createRequest,
  editRequest,
  deleteAllRequests,
  deleteRequest,
  getRequests,
  getUserRequests,
  exportRequests,
};
