// src/routes/order.js
import express from 'express';
import CartRepository from '../../../infrastructure/repositories/ecom/cartRepository.js';
import AuthMiddleware from '../../../utils/middleware/authMiddleware.js';
import TokenService from '../../../utils/jwtToken.js';
import ProductRepository from '../../../infrastructure/repositories/chit/productRepository.js';
import OrderUseCase from '../../../usecases/auth/ecom/orderUseCase.js';
import OrderController from '../../controllers/ecom/orderController.js';
import OrderRepository from '../../../infrastructure/repositories/ecom/orderRepository.js';
import ShipRocketUseCase from '../../../usecases/auth/ecom/shipRocketUseCase.js';
import PincodeMasterUseCase from '../../../usecases/ecom/pincodeMasterUsecase.js';
import DeliveryAddressRepositary from '../../../infrastructure/repositories/ecom/deliveryaddressRepositary.js';

const router = express.Router();

// Initialize dependencies
const tokenService=new TokenService()
const cartRepository = new CartRepository();
const productRepository = new ProductRepository()
const orderRepository = new OrderRepository()
const shipRocketUseCase = new ShipRocketUseCase()
const pincodeUseCase = new PincodeMasterUseCase()
const deliveryAddressRepository = new DeliveryAddressRepositary()

const orderUseCase = new OrderUseCase(cartRepository,productRepository,orderRepository,shipRocketUseCase,pincodeUseCase,deliveryAddressRepository);
const orderController = new OrderController(orderUseCase);
const authMiddleware=new AuthMiddleware(tokenService)
// order routes

router.post('/webhook',(req,res)=>orderController.webhook(req,res))

router.use(authMiddleware.protect);
router.get('/status',(req,res)=>orderController.verifyPaymentStatus(req,res))
router.get('/items', (req, res) => orderController.getOrder(req, res));
router.post('/order', (req, res) => orderController.placeOrder(req, res))
router.get('/order', (req, res) => orderController.getMyOrder(req, res))
router.get('/status/all', (req, res) => orderController.getOrderStatus(req, res))
router.get('/order/items/:id', (req, res) => orderController.getOrderItems(req, res))
router.get('/order/all', (req, res) => orderController.getAllOrders(req, res))
router.get('/report/:id', (req, res) => orderController.getOrderItemReport(req, res))
router.post('/report/product', (req, res) => orderController.getTopSellingProduct(req, res))
router.post('/report/category', (req, res) => orderController.getTopSellingCategory(req, res))
router.post('/report/overall', (req, res) => orderController.getOverAllReport(req, res))
router.post('/status', (req, res) => orderController.changeOrderStatus(req, res))
router.get('/payment', (req, res) => orderController.getPaymentReport(req, res))

router.post('/report/producttable', (req, res) => orderController.getTopSellingProductTable(req, res))




export default router;