import { env } from '../config/env.js';

export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier format';
  }

  if (err.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyPattern || {}).join(', ');
    message = fields ? `Duplicate value for field: ${fields}` : 'Duplicate value';
    if (fields.includes('job') && fields.includes('candidate')) {
      message = 'You have already applied for this job';
    }
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(', ');
  }

  if (env.nodeEnv !== 'production' && statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(statusCode === 500 && env.nodeEnv !== 'production' ? { stack: err.stack } : {}),
  });
};
