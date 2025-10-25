// src/routes/cartRoutes.js
import express from 'express';
import CartRepository from '../../../infrastructure/repositories/ecom/cartRepository.js';
import CartUseCase from '../../../usecases/auth/ecom/cartUsecase.js';
import CartController from '../../controllers/ecom/cartController.js';
import CustomerRepository from '../../../infrastructure/repositories/chit/CustomerRepository.js';
import AuthMiddleware from '../../../utils/middleware/authMiddleware.js';
import TokenService from '../../../utils/jwtToken.js';
import ProductRepository from '../../../infrastructure/repositories/chit/productRepository.js';

const router = express.Router();

// Initialize dependencies
const tokenService=new TokenService()
const cartRepository = new CartRepository();
const customerRepository = new CustomerRepository()
const productRepository = new ProductRepository()
const cartUseCase = new CartUseCase(cartRepository,customerRepository,productRepository);
const cartController = new CartController(cartUseCase);
const authMiddleware=new AuthMiddleware(tokenService)
// Cart routes
router.use(authMiddleware.protect);
router.post('/carts', (req, res) => cartController.createCart(req, res));
router.get('/product/branch/:id', (req, res) => cartController.findProduct(req, res));
router.get('/carts', (req, res) => cartController.getCart(req, res));
router.post('/carts/items', (req, res) => cartController.addItem(req, res));
router.delete('/carts/items', (req, res) => cartController.removeItem(req, res));

// router.put('/carts/items/quantity', (req, res) => cartController.updateQuantity(req, res));
// router.post('/carts/coupon', (req, res) => cartController.applyCoupon(req, res));
// router.delete('/carts/coupon', (req, res) => cartController.removeCoupon(req, res));
// router.put('/carts/address', (req, res) => cartController.updateAddress(req, res));
// router.post('/carts/merge', (req, res) => cartController.mergeCarts(req, res));
// router.post('/carts/abandon', (req, res) => cartController.abandonCart(req, res));

export default router;