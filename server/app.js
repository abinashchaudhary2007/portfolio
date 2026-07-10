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

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    const allowed = [
      /^http:\/\/localhost:\d+$/,       // any localhost port (dev)
      /\.vercel\.app$/,                  // any *.vercel.app domain
    ];
    if (allowed.some((pattern) => pattern.test(origin))) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 10000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

app.use(errorHandler);

connectDB().then(() => seedAdmin());

// Only start a local server when NOT running on Netlify or Vercel
if (!process.env.NETLIFY && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export const handler = serverless(app);
export default app;
