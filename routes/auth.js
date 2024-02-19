import express from 'express';
import { registerBusiness, register, login } from '../controllers/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/register/business', registerBusiness);
router.post('/login', login);

export default router;