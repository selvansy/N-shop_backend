import express from "express";
import AuthMiddleware from "../../../../utils/middleware/authMiddleware.js";
import TokenService from "../../../../utils/jwtToken.js";
import BranchRepository from "../../../../infrastructure/repositories/chit/brachRepository.js";
import { upload } from "../../../../utils/multer.js";
import S3Service from "../../../../utils/s3Bucket.js";
import S3BucketRepository from "../../../../infrastructure/repositories/chit/super/s3BucketSettingRepository.js";
import SubCategoryRepository from "../../../../infrastructure/repositories/ecom/subcategoryRepositary.js";
import SubCategoryUseCase from "../../../../usecases/auth/ecom/subcategoryUsecase.js";
import SubCategoryController from "../../../controllers/ecom/subcategoryController.js";
import SubCategoryValidator from "../../../../utils/validations/subcategoryValidation.js";

// Instantiate dependencies
const branchRepository = new BranchRepository();
const repository = new SubCategoryRepository();
const s3Repo = new S3BucketRepository();
const s3Service = new S3Service();
const useCase = new SubCategoryUseCase(repository, branchRepository, s3Repo, s3Service);
const validator = new SubCategoryValidator();
const tokenService = new TokenService();
const authMiddleware = new AuthMiddleware(tokenService);

// Create controller instance
const controller = new SubCategoryController(useCase, validator);

const router = express.Router();

router.use(authMiddleware.protect);
router.post("/table", (req, res) => controller.getSubCategory(req, res));
router.get("/:id", (req, res) => controller.getById(req, res));
router.get("/category/:id", (req, res) => controller.getByCategoryId(req, res));
router.post(
  "/",
  upload.handleUpload([{ name: "image", maxCount: 1 }]),
  (req, res) => controller.addSubCategory(req, res)
);
router.patch(
  "/:id",
  upload.handleUpload([{ name: "image", maxCount: 1 }]),
  (req, res) => controller.editSubCategory(req, res)
);
router.patch("/:id/active", (req, res) => controller.changeStatus(req, res));
router.delete("/:id", (req, res) => controller.deleteSubCategory(req, res));

export default router;
