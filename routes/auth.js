import express from 'express';
import { registerBusiness, register, login, loginBusiness } from '../controllers/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/register/business', registerBusiness);
router.post('/login', login);
router.post('/login/business', loginBusiness);

export default router;