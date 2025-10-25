import express from "express";
import AuthMiddleware from "../../../../utils/middleware/authMiddleware.js";
import TokenService from "../../../../utils/jwtToken.js";
import DeliveryAddressRepositary from "../../../../infrastructure/repositories/ecom/deliveryaddressRepositary.js";
import CreateDeliveryAddressUsecase from "../../../../usecases/auth/ecom/deliveryaddressusecase.js";
import DeliveryAddressController from "../../../controllers/ecom/deliveryaddressController.js";

const router = express.Router();

const deliveryAddressRepo = new DeliveryAddressRepositary();
const deliveryAddressUseCase = new CreateDeliveryAddressUsecase(deliveryAddressRepo);
const deliveryAddressController = new DeliveryAddressController(deliveryAddressUseCase);
const tokenService = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService);


router.use(authMiddleware.protect);

router.post("/add", (req, res) => deliveryAddressController.createAddress(req, res));
// router.get("/all", (req, res) => deliveryAddressController.getAllAddresses(req, res));
router.patch("/:id", (req, res) => deliveryAddressController.editAddress(req, res));
router.delete("/delete/:id", (req, res) => deliveryAddressController.deleteAddress(req, res));
router.get("/get/:id", (req, res) =>
    deliveryAddressController.getAddressesByCustomer(req, res)
);

export default router;
