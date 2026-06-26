const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const userRoutes = require('./Routes/UserRoutes');
const materialRoutes = require('./Routes/MaterialRoutes');
const requestRoutes = require('./Routes/RequestRoutes');
const authRoutes = require('./Routes/AuthentificationRoutes');

const app = express();
const PORT = process.env.PORT || 4000;
const { MONGO, CLIENT_ORIGIN } = process.env;

if (!MONGO) {
  throw new Error('MONGO environment variable is required');
}

const defaultClientOrigins = 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174';

const allowedOrigins = (CLIENT_ORIGIN || defaultClientOrigins)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.disable('x-powered-by');

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    fallthrough: false,
    maxAge: '7d',
    setHeaders(res) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  })
);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.LOGIN_RATE_LIMIT || 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again later.' },
});

app.use('/api/login', loginLimiter);
app.use('/api', userRoutes);
app.use('/api', materialRoutes);
app.use('/api', requestRoutes);
app.use('/api', authRoutes);

app.use((err, req, res, next) => {
  if (err?.name === 'ZodError') {
    return res.status(400).json({ message: 'Validation failed', errors: err.errors });
  }

  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large' });
  }

  if (err?.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Origin not allowed' });
  }

  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
});

mongoose
  .connect(MONGO)
  .then(() => {
    console.log('MongoDB is connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
