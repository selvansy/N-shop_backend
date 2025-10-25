import express from "express";
import SizemasterController from "../../controllers/ecom/sizemasterController.js";
import SizemasterUsecase from "../../../usecases/ecom/sizemasterUsecase.js";
import SizemasterRepository from "../../../infrastructure/repositories/ecom/sizmasterRepository.js";

const router = express.Router();
const repo = new SizemasterRepository();
const usecase = new SizemasterUsecase(repo);
const controller = new SizemasterController(usecase);

router.post("/", (req, res) => controller.create(req, res));
router.get("/", (req, res) => controller.getAll(req, res));
router.get("/:id", (req, res) => controller.getById(req, res));
router.put("/:id", (req, res) => controller.update(req, res));
router.delete("/:id", (req, res) => controller.delete(req, res));
router.post("/table",(req,res) => controller.getsizemastertable(req,res));
router.patch("/:id/active", (req, res) => controller.changeStatus(req, res));
export default router;