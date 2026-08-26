<div align="center">

# Job Portal Backend API

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Joi](https://img.shields.io/badge/Validation-Joi-8A2BE2)
![Jest](https://img.shields.io/badge/Tests-Jest-C21325?logo=jest&logoColor=white)
![Supertest](https://img.shields.io/badge/Tests-Supertest-07B055)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://jobportal-yhaayuu.vercel.app/)
[![API](https://img.shields.io/badge/API-Job%20Portal-0A66C2?style=for-the-badge)](#)

**[Live Demo → https://jobportal-yhaayuu.vercel.app/](https://jobportal-yhaayuu.vercel.app/)**

</div>

---

A **production-ready Job Portal Backend API** built as the third internship task. Candidates can search and apply for jobs, employers can post and manage listings, and track applications with status updates — all secured with JWT and role-based access.

Built with **Node.js, Express, MongoDB (Mongoose) and JWT authentication** — same clean architecture as my previous internship projects (Banking System API + SaaS Subscription API).

## Live Demo

**API is deployed and running here:**

### **[https://jobportal-yhaayuu.vercel.app/](https://jobportal-yhaayuu.vercel.app/)**

| Endpoint | Live URL |
|---|---|
| Health Check | [https://jobportal-yhaayuu.vercel.app/health](https://jobportal-yhaayuu.vercel.app/health) |
| Welcome | [https://jobportal-yhaayuu.vercel.app/](https://jobportal-yhaayuu.vercel.app/) |
| API Base | `https://jobportal-yhaayuu.vercel.app/api` |

> Use the live URL as `baseUrl` in Postman to test without local setup.

## Features

- **Authentication & Roles**
  - Signup / Login with JWT authentication
  - Secure password hashing with bcrypt
  - Role selection during signup: `candidate` | `employer`
  - Role-based access control

- **Employer Features**
  - Create, edit, delete job postings (owner only)
  - View all posted jobs — `GET /jobs/employer/me`
  - Track applications for own jobs
  - Update application status (bonus) — `Applied` → `Shortlisted` / `Rejected`

- **Candidate Features**
  - View all jobs with pagination
  - Search by keyword, location, job type, company
  - Apply for jobs (one application per job enforced)
  - View applied jobs with status tracking

- **Job Management**
  - Fields: title, company, location, salary, description, requirements, jobType, employer, timestamps
  - Job types: `Full-time`, `Part-time`, `Internship`
  - Full-text search index + filters + sorting (`newest`, `oldest`, `salary_asc`, `salary_desc`)

- **Application System (Bonus Included)**
  - Prevent duplicate applications via unique compound index
  - Candidate: `GET /my-applications`
  - Employer: `GET /job-applications` (filter by `jobId` or `status`)

## Security

- Passwords hashed with bcrypt
- JWT protected routes + role-based middleware
- All inputs validated with Joi
- Employer ownership checks (only owner can edit/delete job or update status)
- Duplicate application prevention via MongoDB unique index

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| Database | MongoDB + Mongoose 8 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | Joi 17 |
| Security | Helmet, Morgan |
| Tests | Jest 29 + Supertest + mongodb-memory-server |
| DevOps | Docker & Docker Compose, Vercel |

## Getting Started

### With Docker (recommended)

```bash
cp .env.example .env
docker compose up --build
```

- API → `http://localhost:5002`
- MongoDB → `27019:27017` (host:container) with replica set `rs0`

### Without Docker

Requires a running MongoDB instance.

```bash
cp .env.example .env
npm install
npm run dev
# or
npm start
```

API → `http://localhost:5002`

### Test Live Demo Directly

No setup needed — set Postman `baseUrl` to:

```
https://jobportal-yhaayuu.vercel.app
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5002` |
| `NODE_ENV` | development / production | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/job_portal?replicaSet=rs0` |
| `JWT_SECRET` | Secret used to sign tokens | — |
| `JWT_EXPIRES_IN` | Token lifetime | `1d` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `10` |

## API Overview

All routes prefixed with `/api`. Protected routes need `Authorization: Bearer <token>`

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/signup` | Public | Register `name, email, password, role` (`candidate`/`employer`) |
| POST | `/api/login` | Public | Login, returns JWT |

### Jobs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/jobs` | Employer | Create job posting |
| GET | `/api/jobs` | Public | View all jobs (`search`, `location`, `jobType`, `company`, `page`, `limit`, `sort`) |
| GET | `/api/jobs/:id` | Public | View single job |
| PUT | `/api/jobs/:id` | Employer (owner) | Edit job posting |
| DELETE | `/api/jobs/:id` | Employer (owner) | Delete job posting |
| GET | `/api/jobs/employer/me` | Employer | View all my posted jobs |

**Search Example:**
```
GET /api/jobs?search=Developer&location=Casablanca&jobType=Full-time&page=1&limit=10&sort=newest
GET https://jobportal-yhaayuu.vercel.app/api/jobs?search=Developer&location=Casablanca
```

**Job Types:** `Full-time`, `Part-time`, `Internship`

### Applications

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/apply/:jobId` | Candidate | Apply for a job |
| GET | `/api/my-applications` | Candidate | View my applications (`?status=Applied`) |
| GET | `/api/job-applications` | Employer | View applications for my jobs (`?jobId=xxx&?status=Shortlisted`) |
| GET | `/api/job-applications/:jobId` | Employer | View applications for specific job |
| PATCH | `/api/applications/:id/status` | Employer | Update status (`Applied`/`Shortlisted`/`Rejected`) — **Bonus** |
| GET | `/api/applications/:id` | Candidate/Employer | View single application if authorized |

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Welcome + endpoint list |
| GET | `/health` | Health check |

## Project Structure

```
src/
├── config/          # Database & environment config
├── models/          # User, Job, Application
├── middleware/      # Auth, roles, validation, error handling
├── validations/     # Joi schemas
├── controllers/     # Request handlers
├── routes/          # API routes
├── app.js           # Express app
└── server.js        # Entry point
tests/
└── jobPortal.test.js # Jest + Supertest (10 tests)
postman/
└── postman_collection.json
```

## Database Design

**Users:** id, name, email, password, role (`candidate`/`employer`), timestamps

**Jobs:** id, title, company, location, salary, description, requirements, jobType (`Full-time`/`Part-time`/`Internship`), employer_id, timestamps

**Applications:** id, job_id, candidate_id, status (`Applied`/`Shortlisted`/`Rejected`), timestamps — Unique index on `(job, candidate)`

## Access Control

- Only **employers** can manage jobs
- Only **candidates** can apply
- Employer can only update/delete **own** jobs
- Employer can only view/update applications for **own** posted jobs
- Candidate can only view **own** applications
- Middleware: `verifyToken` + `requireRole('candidate'|'employer')`

## Testing

### Postman

Ready-made collection with realistic data (Salma El Fassi, Karim Bensouda, Atlas Digital):

```
postman/postman_collection.json
postman_collection.json (root copy)
```

1. Import into Postman
2. Set `baseUrl` = `http://localhost:5002` or `https://jobportal-yhaayuu.vercel.app`
3. Run `Auth → Signup - Candidate` + `Signup - Employer` — tokens auto-save
4. `Jobs → Create Job` auto-saves `jobId`
5. `Applications → Apply for Job` auto-saves `applicationId`

### Jest (10 tests)

```bash
npm test
```

Covers: signup candidate/employer, login, create job, search jobs, get job by id, apply, prevent duplicate, my-applications, update status + job-applications

**Result:** 10 passed

```
PASS tests/jobPortal.test.js
  10 passed
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Run with `node --watch` (auto-reload) |
| `npm start` | Run production (`node src/server.js`) |
| `npm test` | Run Jest tests (`node --experimental-vm-modules`) |

## Deployment

Deployed on **Vercel** — Live at **[https://jobportal-yhaayuu.vercel.app/](https://jobportal-yhaayuu.vercel.app/)**

Local Docker build also supported via `docker compose up --build`.

---

<div align="center">

Built for internship — clean, documented, and production-ready.

**Live Demo:** [jobportal-yhaayuu.vercel.app](https://jobportal-yhaayuu.vercel.app/) • **Health:** [/health](https://jobportal-yhaayuu.vercel.app/health)

</div>
