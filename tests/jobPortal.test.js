import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';

let mongoServer;
let candidateToken;
let employerToken;
let jobId;
let applicationId;

describe('Job Portal Backend API - 10 Core Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it('1 - should register candidate Salma El Fassi', async () => {
    const res = await request(app).post('/api/signup').send({
      name: 'Salma El Fassi',
      email: 'salma.elfassi@gmail.com',
      password: 'Password123',
      role: 'candidate',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('candidate');
    expect(res.body.data.token).toBeDefined();
    candidateToken = res.body.data.token;
  });

  it('2 - should register employer Karim Bensouda', async () => {
    const res = await request(app).post('/api/signup').send({
      name: 'Karim Bensouda',
      email: 'karim.bensouda@atlasdigital.ma',
      password: 'Password123',
      role: 'employer',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('employer');
    expect(res.body.data.token).toBeDefined();
    employerToken = res.body.data.token;
  });

  it('3 - should login candidate and return JWT', async () => {
    const res = await request(app).post('/api/login').send({
      email: 'salma.elfassi@gmail.com',
      password: 'Password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('4 - should allow employer to create a job', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        title: 'Senior Full Stack Developer',
        company: 'Atlas Digital',
        location: 'Casablanca',
        salary: 32000,
        description: 'Atlas Digital is looking for a Senior Full Stack Developer to build scalable web platforms for enterprise clients using MERN stack.',
        requirements: '5+ years Node.js, React, MongoDB, Express, Docker, Git',
        jobType: 'Full-time',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.job.title).toBe('Senior Full Stack Developer');
    expect(res.body.data.job.company).toBe('Atlas Digital');
    jobId = res.body.data.job._id;
    expect(jobId).toBeDefined();
  });

  it('5 - should get all jobs with search and pagination', async () => {
    const res = await request(app).get('/api/jobs?search=Developer&location=Casablanca&page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.jobs)).toBe(true);
    expect(res.body.data.total).toBeGreaterThanOrEqual(1);
    expect(res.body.data.jobs.length).toBeGreaterThanOrEqual(1);
  });

  it('6 - should get single job by id', async () => {
    const res = await request(app).get(`/api/jobs/${jobId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.job._id).toBe(jobId);
    expect(res.body.data.job.employer.name).toBe('Karim Bensouda');
  });

  it('7 - should allow candidate to apply for job', async () => {
    const res = await request(app)
      .post(`/api/apply/${jobId}`)
      .set('Authorization', `Bearer ${candidateToken}`);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.application.status).toBe('Applied');
    applicationId = res.body.data.application._id;
    expect(applicationId).toBeDefined();
  });

  it('8 - should prevent duplicate application', async () => {
    const res = await request(app)
      .post(`/api/apply/${jobId}`)
      .set('Authorization', `Bearer ${candidateToken}`);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('9 - should allow candidate to view my-applications', async () => {
    const res = await request(app)
      .get('/api/my-applications')
      .set('Authorization', `Bearer ${candidateToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.count).toBe(1);
    expect(res.body.data.applications[0]._id).toBe(applicationId);
  });

  it('10 - should allow employer to update application status to Shortlisted', async () => {
    const updateRes = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set('Authorization', `Bearer ${employerToken}`)
      .send({ status: 'Shortlisted' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.application.status).toBe('Shortlisted');

    const listRes = await request(app)
      .get('/api/job-applications')
      .set('Authorization', `Bearer ${employerToken}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data.applications.length).toBeGreaterThanOrEqual(1);
    const found = listRes.body.data.applications.find((a) => a._id === applicationId);
    expect(found).toBeDefined();
    expect(found.status).toBe('Shortlisted');
  });
});
