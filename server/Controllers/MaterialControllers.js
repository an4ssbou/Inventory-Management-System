const mongoose = require('mongoose');
const Material = require('../Models/Material');
const Request = require('../Models/Request');
const { materialCreateSchema, materialUpdateSchema, searchSchema, validate } = require('../Utils/validation');

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const CreateMaterial = async (req, res) => {
  try {
    const data = validate(materialCreateSchema, req.body);
    const imageUrl = req.file ? `uploads/${req.file.filename}` : null;
    const mat = await Material.create({ ...data, imageUrl });
    return res.status(201).json({ mat });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const DeleteMaterial = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid material id' });
    }

    const mat = await Material.findByIdAndDelete(req.params.id);
    if (!mat) {
      return res.status(404).json({ message: 'Material not found' });
    }

    await Request.deleteMany({ matériel: req.params.id });
    return res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const EditMaterial = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid material id' });
    }

    const data = validate(materialUpdateSchema, req.body);
    if (req.file) data.imageUrl = `uploads/${req.file.filename}`;

    const mat = await Material.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!mat) {
      return res.status(404).json({ message: 'Material not found' });
    }

    return res.json({ mat });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const GetMaterials = async (req, res) => {
  try {
    const designation = validate(searchSchema, req.query.designation);
    const type = validate(searchSchema, req.query.type);
    const status = validate(searchSchema, req.query.status);
    const query = {};

    if (designation) query.designation = { $regex: escapeRegex(designation), $options: 'i' };
    if (status) query.status = status;
    if (type) query.type = type;

    const mats = await Material.find(query);
    return res.json({ mats });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = { CreateMaterial, DeleteMaterial, EditMaterial, GetMaterials };
