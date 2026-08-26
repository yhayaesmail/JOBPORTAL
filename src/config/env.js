import dotenv from 'dotenv';

dotenv.config();

const required = (key, fallback) => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  port: parseInt(required('PORT', '5002'), 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: required('MONGO_URI', 'mongodb://localhost:27017/job_portal'),
  jwtSecret: required('JWT_SECRET', 'dev_super_secret_key_change_in_production_job_portal_9f8e7d6c5b4a'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
};
