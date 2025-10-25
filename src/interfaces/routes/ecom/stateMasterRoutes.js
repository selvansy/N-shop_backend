import express from "express";
import StateMasterRepository from "../../../infrastructure/repositories/ecom/stateMasterRepository.js";
import StateMasterUseCase from "../../../usecases/ecom/stateMasterUsecase.js";
import StateMasterController from "../../controllers/ecom/stateMasterController.js";

const router = express.Router();

const repo = new StateMasterRepository();
const usecases = new StateMasterUseCase(repo);
const controller = new StateMasterController(usecases);

router.post("/", (req, res) => controller.createState(req, res));
router.post("/table", (req, res) => controller.getAllStates(req, res));
router.get("/:id", (req, res) => controller.getStateById(req, res));
router.put("/:id", (req, res) => controller.updateState(req, res));
router.patch("/:id", (req, res) => controller.activateState(req, res));
router.delete("/:id", (req, res) => controller.deleteState(req, res));

export default router;