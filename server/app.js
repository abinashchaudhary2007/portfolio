import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import serverless from 'serverless-http';

import { connectDB } from './config/db.js';
import { seedAdmin } from './controllers/authController.js';

import contactRoutes from './routes/contactRoutes.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet());

// CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests without origin (Postman, curl, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = [
      /^http:\/\/localhost:\d+$/,
      /^https:\/\/.*\.vercel\.app$/,
      "https://chaudharyabinash.com.np",
      "https://www.chaudharyabinash.com.np"
    ];

    const isAllowed = allowedOrigins.some((item) => {
      if (item instanceof RegExp) {
        return item.test(origin);
      }
      return item === origin;
    });

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 10000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Error Handler
app.use(errorHandler);

// Database
connectDB()
  .then(() => seedAdmin())
  .catch((err) => {
    console.error('Database connection failed:', err);
  });

// Local Development
if (!process.env.NETLIFY && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Vercel / Netlify
export const handler = serverless(app);
export default app;