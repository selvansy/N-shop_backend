// src/routes/cartRoutes.js
import express from 'express';
import SettingsUsecase from '../../../usecases/auth/ecom/settingsUseCase.js';
import SettingsController from '../../controllers/ecom/ecomSettingsController.js';
import AuthMiddleware from '../../../utils/middleware/authMiddleware.js';
import TokenService from '../../../utils/jwtToken.js';
import EcomSettingsRepository from '../../../infrastructure/repositories/ecom/settingsRepository.js';

const router = express.Router();

// Initialize dependencies
const tokenService=new TokenService()
const settingsRepository = new EcomSettingsRepository()
const settingsUseCase = new SettingsUsecase(settingsRepository);
const settingsController = new SettingsController(settingsUseCase);
const authMiddleware=new AuthMiddleware(tokenService)

// router.use(authMiddleware.protect);
router.post('/active-ecom', (req, res) => settingsController.activeEcom(req, res));




export default router;