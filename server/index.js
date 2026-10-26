const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();
const isDemo = process.env.DEMO_MODE === 'true';
if (isDemo) require('./demo/config').validateDemoConfig(process.env);
if (isDemo) { mongoose.set('autoCreate', false); mongoose.set('autoIndex', false); }

const userRoutes = require('./Routes/UserRoutes');
const materialRoutes = require('./Routes/MaterialRoutes');
const requestRoutes = require('./Routes/RequestRoutes');
const authRoutes = require('./Routes/AuthentificationRoutes');

const app = express();
if (isDemo && process.env.RENDER) app.set('trust proxy', 1);
if (isDemo) app.set('query parser', 'simple');
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

if (!isDemo) app.use(
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

app.use(express.json({ limit: isDemo ? '16kb' : (process.env.JSON_BODY_LIMIT || '1mb'), inflate: !isDemo }));
if (isDemo) {
 const {demoLimiter,demoGuard}=require('./demo/middleware');
 app.use(demoLimiter); app.use(demoGuard);
}
if (!isDemo) app.use(
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/login', loginLimiter);
app.use('/api', userRoutes);
app.use('/api', materialRoutes);
app.use('/api', requestRoutes);
app.use('/api', authRoutes);
if (isDemo) {
 app.use('/api', (req,res)=>res.status(404).json({message:'API endpoint not found'}));
 const clientDist=path.resolve(__dirname,'../client/dist');
 app.use(express.static(clientDist));
 app.get('*',(req,res)=>res.sendFile(path.join(clientDist,'index.html')));
}

app.use((err, req, res, next) => {
  if (isDemo && [400, 413, 415].includes(err.status)) {
    return res.status(err.status).json({message:'Corps de requête invalide, trop volumineux ou compressé.'});
  }
  if (err?.name === 'ZodError') {
    return res.status(400).json({ message: 'Validation failed', errors: err.errors });
  }

  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large' });
  }

  if (err?.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Origin not allowed' });
  }

  if (process.env.NODE_ENV !== 'production') console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
});

mongoose
  .connect(MONGO)
  .then(async () => {
    if (isDemo) await require('./demo/seed').seedDemo(mongoose.connection);
    console.log('MongoDB is connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  })
  .catch(() => {
    console.error('Database initialization failed');
    process.exit(1);
  });
