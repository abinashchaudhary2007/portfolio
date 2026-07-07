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
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
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
