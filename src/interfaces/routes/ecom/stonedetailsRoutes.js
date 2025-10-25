import express from "express";
import StonedeatilsUsecase from "../../../usecases/auth/ecom/stonedetailsUsecase.js";
import stonedetailsController from "../../controllers/ecom/stonedetailsController.js";

const router = express.Router();

const usecase = new StonedeatilsUsecase();
const controller = new stonedetailsController(usecase);

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/:id", (req, res) => controller.getById(req, res));

router.post("/", (req, res) => controller.getManyByIds(req, res));

export default router;
