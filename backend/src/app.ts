import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import routes from './routes';
import { apiRateLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/error';

const app = express();

// Security and CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: '*', // Allow all origins for simplicity in development/docker
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter to all API endpoints
app.use('/api', apiRateLimiter);

// Serve static uploads
const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
app.use('/uploads', express.static(uploadDir));

// Main API routes
app.use('/api', routes);

// Base route check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Centralized error handler
app.use(errorHandler as any);

export default app;
