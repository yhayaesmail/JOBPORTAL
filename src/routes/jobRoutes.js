import { Router } from 'express';
import { createJob, getAllJobs, getJobById, updateJob, deleteJob, getMyPostedJobs } from '../controllers/jobController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validate } from '../middleware/validate.js';
import { createJobSchema, updateJobSchema, jobQuerySchema, jobIdParamSchema } from '../validations/jobValidation.js';

const router = Router();

router.get('/', validate({ query: jobQuerySchema }), getAllJobs);
router.get('/employer/me', verifyToken, requireRole('employer'), getMyPostedJobs);
router.get('/:id', validate({ params: jobIdParamSchema }), getJobById);
router.post('/', verifyToken, requireRole('employer'), validate({ body: createJobSchema }), createJob);
router.put('/:id', verifyToken, requireRole('employer'), validate({ params: jobIdParamSchema, body: updateJobSchema }), updateJob);
router.delete('/:id', verifyToken, requireRole('employer'), validate({ params: jobIdParamSchema }), deleteJob);

export default router;
