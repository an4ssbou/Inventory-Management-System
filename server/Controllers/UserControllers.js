const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../Models/User');
const Request = require('../Models/Request');
const { searchSchema, userCreateSchema, userUpdateSchema, validate } = require('../Utils/validation');

const isAdminUser = async (userId) => {
  const user = await User.findById(userId).select('Role');
  return user?.Role === 'Admin';
};

const CreateUser = async (req, res) => {
  try {
    const data = validate(userCreateSchema, req.body);
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await User.create({ ...data, password: hashedPassword });
    const safeUser = await User.findById(user._id).select('-password');
    return res.status(201).json({ user: safeUser });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const EditUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const data = validate(userUpdateSchema, req.body);
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }

    const user = await User.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const DeleteUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Request.deleteMany({ utilisateur: req.params.id });
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const GetUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const isSelf = req.user?.id === req.params.id;
    const isAdmin = await isAdminUser(req.user?.id);
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const GetUsers = async (req, res) => {
  try {
    const nom = validate(searchSchema, req.query.nom);
    const filter = {};

    if (nom) {
      filter.nom = { $regex: nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    const users = await User.find(filter).select('-password');
    return res.json({ users });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = { CreateUser, DeleteUser, EditUser, GetUsers, GetUser };
