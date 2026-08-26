# Job Portal Backend API

This project was built as the third internship task — a **Job Portal Backend API** where candidates can search and apply for jobs, and employers can post, edit and manage job listings and track applications.

It is built with **Node.js, Express, MongoDB (Mongoose) and JWT authentication** — same stack and structure as my previous internship projects (Banking System API + SaaS Subscription API).

## Features

- **Authentication & Roles**
  - Signup / Login with JWT authentication
  - Secure password hashing with bcrypt
  - Role selection during signup: `candidate` | `employer`
  - Role-based access control (Candidate / Employer)

- **Employer Features**
  - Create job postings
  - Edit job postings (owner only)
  - Delete job postings (owner only)
  - View all posted jobs (`GET /jobs/employer/me`)

- **Candidate Features**
  - View all jobs (public, with pagination)
  - Search jobs by keyword, location, job type, company
  - Apply for jobs (one application per job)
  - View applied jobs with status tracking

- **Job Management**
  - Fields: title, company, location, salary, description, requirements, jobType, employer, timestamps
  - Job types: `Full-time`, `Part-time`, `Internship`
  - Text search index + filters + sorting

- **Application System (Bonus Included)**
  - Apply for jobs
  - Track application status: `Applied` / `Shortlisted` / `Rejected`
  - Employer can update status (`PATCH /applications/:id/status`)
  - Prevent duplicate applications
  - Candidate: `GET /my-applications`
  - Employer: `GET /job-applications` (filter by jobId or status)

## Security

- Passwords hashed with bcrypt
- JWT protected routes + role-based middleware
- All inputs validated with Joi
- Employer ownership checks (only owner can edit/delete job or update application status)
- Duplicate application prevention via unique compound index

## Tech Stack

Node.js, Express, MongoDB (Mongoose), Joi, JWT, bcryptjs, Docker

## Getting Started

### With Docker (recommended)

```bash
cp .env.example .env
docker compose up --build
```

The API runs at `http://localhost:5002`.
MongoDB runs on port `27019` (host) -> `27017` (container) with replica set `rs0`.

### Without Docker

Requires a running MongoDB instance.

```bash
cp .env.example .env
npm install
npm run dev
# or
npm start
```

API runs at `http://localhost:5002`.

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

All routes are prefixed with `/api`. Protected routes need header:
`Authorization: Bearer <token>`

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/signup` | Public | Register with `name, email, password, role` (`candidate`/`employer`) |
| POST | `/api/login` | Public | Login, returns JWT |

### Jobs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/jobs` | Employer | Create job posting |
| GET | `/api/jobs` | Public | View all jobs (query: `search`, `location`, `jobType`, `company`, `page`, `limit`, `sort`) |
| GET | `/api/jobs/:id` | Public | View single job |
| PUT | `/api/jobs/:id` | Employer (owner) | Edit job posting |
| DELETE | `/api/jobs/:id` | Employer (owner) | Delete job posting |
| GET | `/api/jobs/employer/me` | Employer | View all my posted jobs |

**Search Example:**
```
GET /api/jobs?search=Backend&location=Remote&jobType=Full-time&page=1&limit=10&sort=newest
```

**Job Types:** `Full-time`, `Part-time`, `Internship`

### Applications

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/apply/:jobId` | Candidate | Apply for a job |
| GET | `/api/my-applications` | Candidate | View my applications (`?status=Applied&?page=1&limit=10`) |
| GET | `/api/job-applications` | Employer | View applications for my jobs (`?jobId=xxx&?status=Shortlisted`) |
| GET | `/api/job-applications/:jobId` | Employer | View applications for specific job |
| PATCH | `/api/applications/:id/status` | Employer | Update application status (`Applied`/`Shortlisted`/`Rejected`) — **Bonus** |
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
```

## Database Design

**Users:**
- id, name, email, password, role (`candidate`/`employer`), timestamps

**Jobs:**
- id, title, company, location, salary, description, requirements, jobType (`Full-time`/`Part-time`/`Internship`), employer_id, timestamps

**Applications:**
- id, job_id, candidate_id, status (`Applied`/`Shortlisted`/`Rejected`), timestamps
- Unique index on `(job, candidate)` to prevent duplicate applies

## Access Control

- Only **employers** can manage jobs (`POST /jobs`, `PUT /jobs/:id`, `DELETE /jobs/:id`)
- Only **candidates** can apply (`POST /apply/:jobId`, `GET /my-applications`)
- Employer can only update/delete **own** jobs
- Employer can only view/update applications for **own** posted jobs
- Candidate can only view **own** applications
- Middleware: `verifyToken` + `requireRole('candidate'|'employer')`

## Testing the API

A ready-made Postman collection is included:

```
postman/postman_collection.json
postman_collection.json (root copy)
```

**How to use:**
1. Import `postman_collection.json` into Postman
2. Set `baseUrl` variable (default `http://localhost:5002`)
3. Run `Auth -> Signup - Candidate` and `Signup - Employer` — tokens auto-save
4. `Jobs -> Create Job` (employer) auto-saves `jobId`
5. `Applications -> Apply for Job` (candidate) auto-saves `applicationId`
6. Try status update, search, filters, etc.

Collection includes auto-saving of tokens/IDs via Postman Test scripts and negative tests (candidate creating job, employer applying, etc.).

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Run with `node --watch` (auto-reload) |
| `npm start` | Run production (`node src/server.js`) |
