import express from "express";
import AuthMiddleware from "../../../../utils/middleware/authMiddleware.js";
import TokenService from "../../../../utils/jwtToken.js";
import ClarityMasterRepositary from "../../../../infrastructure/repositories/ecom/claritymasterRepositary.js";
import clarityMasterController from "../../../controllers/ecom/claritymasterController.js";
import ClarityMasterUsecase from "../../../../usecases/auth/ecom/clarityMasterusecase.js";

const router = express.Router();

const claritymasterrepo = new ClarityMasterRepositary();
const clarityMasterusecase = new ClarityMasterUsecase(claritymasterrepo);
const claritymastercontroller = new clarityMasterController(clarityMasterusecase);
const tokenService = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService);


router.use(authMiddleware.protect);

router.post("/add", (req, res) => claritymastercontroller.createClarityMaster(req, res));
router.get("/all", (req, res) => claritymastercontroller.getClarityMasters(req, res));

export default router;
