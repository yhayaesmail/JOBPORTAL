import { Router } from 'express';
import {
  applyForJob,
  getMyApplications,
  getJobApplications,
  getApplicationsForJob,
  updateApplicationStatus,
  getApplicationById,
} from '../controllers/applicationController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { jobIdForApplySchema } from '../validations/jobValidation.js';
import {
  updateApplicationStatusSchema,
  applicationIdParamSchema,
  jobApplicationsQuerySchema,
} from '../validations/applicationValidation.js';

const router = Router();

router.use(verifyToken);

router.post('/apply/:jobId', requireRole('candidate'), validate({ params: jobIdForApplySchema }), applyForJob);
router.get('/my-applications', requireRole('candidate'), getMyApplications);
router.get('/job-applications', requireRole('employer'), validate({ query: jobApplicationsQuerySchema }), getJobApplications);
router.get('/job-applications/:jobId', requireRole('employer'), validate({ params: jobIdForApplySchema }), getApplicationsForJob);
router.patch(
  '/applications/:id/status',
  requireRole('employer'),
  validate({ params: applicationIdParamSchema, body: updateApplicationStatusSchema }),
  updateApplicationStatus
);
router.get('/applications/:id', validate({ params: applicationIdParamSchema }), getApplicationById);

export default router;
