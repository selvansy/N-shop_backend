import express from "express";
import AuthMiddleware from "../../../../utils/middleware/authMiddleware.js";
import TokenService from "../../../../utils/jwtToken.js";
import ShapeMasterRepositary from "../../../../infrastructure/repositories/ecom/shapemasterRepositary.js";
import shapeMasterController from "../../../controllers/ecom/shapemasterController.js";
import ShapeMasterUsecase from "../../../../usecases/auth/ecom/shapeMasterusecase.js";

const router = express.Router();

const shapemasterrepo = new ShapeMasterRepositary();
const shapeMasterusecase = new ShapeMasterUsecase(shapemasterrepo);
const shapemastercontroller = new shapeMasterController(shapeMasterusecase);
const tokenService = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService);


router.use(authMiddleware.protect);

router.post("/add", (req, res) => shapemastercontroller.createshapeMaster(req, res));
router.get("/all", (req, res) => shapemastercontroller.getshapeMasters(req, res));

export default router;
