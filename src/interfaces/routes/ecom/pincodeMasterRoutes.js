import express from 'express';
import pincodeMasterRepository from '../../../infrastructure/repositories/ecom/pincodeMasterRepository.js';
import PincodeMasterUseCase from '../../../usecases/ecom/pincodeMasterUsecase.js';
import pincodeController from '../../controllers/ecom/pincodeMasterController.js';

const router = express.Router();

const repo = new pincodeMasterRepository()
const usecases = new PincodeMasterUseCase(repo)
const controller = new pincodeController(usecases)

router.post('/',(req,res)=>controller.createPincode(req,res));
router.get('/', (req,res)=>controller.getAllPincodes(req,res));
router.get('/check-delivery', (req,res)=>controller.checkDeliveryAvailabilitybypincode(req,res));
router.get('/:id', (req,res)=>controller.getPincodeById(req,res));
router.patch('/:id', (req,res)=>controller.updatePincode(req,res));
router.delete('/:id', (req,res)=>controller.deletePincode(req,res));
router.get('/check-delivery/:pincode', (req,res)=>controller.checkDeliveryAvailability(req,res));
router.post('/table',(req,res)=>controller.getpincodetable(req,res));
router.patch("/:id/active", (req, res) => controller.changeStatus(req, res));

export default router;