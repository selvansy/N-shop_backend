import express from "express";
import AuthMiddleware from "../../../../utils/middleware/authMiddleware.js";
import TokenService from "../../../../utils/jwtToken.js";
import ColorMasterRepositary from "../../../../infrastructure/repositories/ecom/colourmasterRepositary.js";
import ColorMasterUsecase from "../../../../usecases/auth/ecom/colourmasterUsecase.js";
import colorMasterController from "../../../controllers/ecom/colourmasterContoller.js";


const router = express.Router();

const colormasterrepo = new ColorMasterRepositary();
const colorMasterusecase = new ColorMasterUsecase(colormasterrepo);
const colormastercontroller = new colorMasterController(colorMasterusecase);
const tokenService = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService);


router.use(authMiddleware.protect);

router.post("/add", (req, res) => colormastercontroller.Createcolormaster(req, res));
router.get("/all", (req, res) => colormastercontroller.Getcolormaster(req, res));

export default router;
