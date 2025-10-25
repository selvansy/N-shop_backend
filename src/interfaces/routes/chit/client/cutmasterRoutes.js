import express from "express";
import AuthMiddleware from "../../../../utils/middleware/authMiddleware.js";
import TokenService from "../../../../utils/jwtToken.js";
import CutMasterUsecase from "../../../../usecases/auth/ecom/cutMasterusecase.js";
import cutMasterController from "../../../controllers/ecom/cutmasterController.js";
import CutMasterRepositary from "../../../../infrastructure/repositories/ecom/cutmasterRepositary.js";


const router = express.Router();

const cutmasterrepo = new CutMasterRepositary();
const cutMasterusecase = new CutMasterUsecase(cutmasterrepo);
const cutmastercontroller = new cutMasterController(cutMasterusecase);
const tokenService = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService);


router.use(authMiddleware.protect);

router.post("/add", (req, res) => cutmastercontroller.createCutMaster(req, res));
router.get("/all", (req, res) => cutmastercontroller.getCutMasters(req, res));

export default router;
