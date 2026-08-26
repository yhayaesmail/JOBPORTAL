import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import { env } from './config/env.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(express.json({ limit: '10kb' }));

if (env.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Job Portal Backend API',
    version: '1.0.0',
    documentation: 'See README.md or import postman/postman_collection.json into Postman',
    endpoints: {
      auth: ['POST /api/signup', 'POST /api/login'],
      jobs: [
        'POST /api/jobs (employer)',
        'GET /api/jobs',
        'GET /api/jobs/:id',
        'PUT /api/jobs/:id (employer owner)',
        'DELETE /api/jobs/:id (employer owner)',
        'GET /api/jobs/employer/me (employer)',
      ],
      applications: [
        'POST /api/apply/:jobId (candidate)',
        'GET /api/my-applications (candidate)',
        'GET /api/job-applications (employer)',
        'GET /api/job-applications/:jobId (employer)',
        'PATCH /api/applications/:id/status (employer - bonus)',
        'GET /api/applications/:id (candidate/employer)',
      ],
      health: '/health',
    },
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, status: 'ok', uptime: process.uptime() });
});

app.use('/api', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api', applicationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
