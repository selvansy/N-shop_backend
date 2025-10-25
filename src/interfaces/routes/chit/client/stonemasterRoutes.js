import express from "express";
import AuthMiddleware from "../../../../utils/middleware/authMiddleware.js";
import TokenService from "../../../../utils/jwtToken.js";
import StonemasterRepositary from "../../../../infrastructure/repositories/ecom/stonemasterRepositary.js";
import StonemasterUsecase from "../../../../usecases/auth/ecom/stonemasterUsecase.js";
import StonemasterController from "../../../controllers/ecom/stonemasterController.js";


const router = express.Router();

const stonemasterRepositary = new StonemasterRepositary();
const stonemasterUsecase = new StonemasterUsecase(stonemasterRepositary);
const stonemasterController = new StonemasterController(stonemasterUsecase);
const tokenService = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService);


router.use(authMiddleware.protect);

router.get("/get/diamond", (req, res) =>stonemasterController.getDiamond(req, res));
router.get("/get/stone", (req, res) =>stonemasterController.getStone(req, res));
router.post("/add", (req, res) => stonemasterController.Cretaestonemaster(req, res));
router.get("/all", (req, res) => stonemasterController.getstone(req, res));
router.patch("/:id", (req, res) => stonemasterController.editStonemaster(req, res));
router.delete("/delete/:id", (req, res) => stonemasterController.deletestone(req, res));
router.get("/get/:id", (req, res) =>stonemasterController.getstonebyid(req, res));
router.post("/table", (req, res) => stonemasterController.getstonemastertable(req, res));
router.patch("/:id/active", (req, res) => stonemasterController.changeStatus(req, res));

export default router;
