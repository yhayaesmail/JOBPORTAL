import { Router } from 'express';
import { signup, login } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { signupSchema, loginSchema } from '../validations/authValidation.js';

const router = Router();

router.post('/signup', validate({ body: signupSchema }), signup);
router.post('/login', validate({ body: loginSchema }), login);

export default router;
