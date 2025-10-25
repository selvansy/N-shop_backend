import express from "express";
import AuthMiddleware from "../../../../utils/middleware/authMiddleware.js";
import TokenService from "../../../../utils/jwtToken.js";
import UomRepositary from "../../../../infrastructure/repositories/ecom/uomRepositary.js";
import Eomusecase from "../../../../usecases/auth/ecom/uomusecase.js";
import EomController from "../../../controllers/ecom/uomController.js";


const router = express.Router();

const uomRepositary = new UomRepositary();
const uomusecase = new Eomusecase(uomRepositary);
const eomController = new EomController(uomusecase);
const tokenService = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService);


router.use(authMiddleware.protect);

router.post("/create", (req, res) => eomController.createEom(req, res));
router.get("/",(req,res)=>eomController.getEom(req,res));
router.delete("/:id",(req,res)=>eomController.deleteEom(req,res));
router.patch("/:id",(req,res)=>eomController.editEom(req,res));

export default router;