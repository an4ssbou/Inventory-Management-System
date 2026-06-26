const bcrypt = require('bcrypt');
const User = require('../Models/User');
const { generateToken } = require('../Utils/jwtUtils');
const { loginSchema, signupSchema, validate } = require('../Utils/validation');

const publicSignupEnabled = process.env.ALLOW_PUBLIC_SIGNUP === 'true';

const SignUp = async (req, res) => {
  try {
    if (!publicSignupEnabled && !req.user) {
      return res.status(404).json({ message: 'Not found' });
    }

    const data = validate(signupSchema, req.body);
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      nom: data.nom,
      prénom: data.prénom,
      email: data.email,
      password: hashedPassword,
      Phone: data.Phone,
      Role: req.user ? data.Role || 'Equipe Système' : 'Equipe Système',
    });

    const safeUser = await User.findById(user._id).select('-password');
    return res.status(201).json({ user: safeUser });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const LogIn = async (req, res) => {
  try {
    const { email, password } = validate(loginSchema, req.body);
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({ message: 'Email ou mot de passe invalide' });
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Email ou mot de passe invalide' });
    }

    const token = generateToken(existingUser);
    return res.json({ token });
  } catch {
    return res.status(400).json({ message: 'Email ou mot de passe invalide' });
  }
};

module.exports = { SignUp, LogIn };
