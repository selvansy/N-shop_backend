class SubCategoryController {
  constructor(subCategoryUsecase, validator) {
    this.subCategoryUsecase = subCategoryUsecase;
    this.validator = validator;
  }

  async addSubCategory(req, res) {
    try {
      const { categoryId, name, description } = req.body;

      const files = req.files;
      const data = req.body;

      const validate = { categoryId, name };

      // if (!files?.bannerImage) {
      //   return res.status(400).json({ message: "Banner image is required" });
      // }

      const { error } = this.validator.subCategoryValidations.validate(validate);
      if (error) {
        return res.status(400).json(error.details[0].message);
      }

      req.body.created_by = req.user.id_employee;

      const result = await this.subCategoryUsecase.addSubCategory(
        data,
        files,
        req.user
      );

      if (result.success) {
        return res.status(201).json({ message: result.message });
      }
      return res.status(400).json({ message: result.message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async editSubCategory(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "SubCategory id is required" });
      }

      const { categoryId, name } = req.body;
      const validate = { categoryId, name };
      const data = req.body;
      const files = req.files;

      const { error } = this.validator.subCategoryValidations.validate(validate);
      if (error) {
        return res.status(400).json(error.details[0].message);
      }

      const result = await this.subCategoryUsecase.editSubCategory(
        data,
        id,
        files
      );
      if (result.success) {
        return res.status(200).json({ message: result.message });
      }
      return res.status(400).json({ message: result.message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteSubCategory(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res
          .status(400)
          .json({ message: "SubCategory id is required" });
      }

      const result = await this.subCategoryUsecase.deleteSubCategory(id);
      if (result.success) {
        return res.status(200).json({ message: result.message });
      }
      return res.status(400).json({ message: result.message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }


  async changeStatus(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json({ message: "SubCategory id is required" });
      }

      const result = await this.subCategoryUsecase.changeStatus(id);
      if (result.success) {
        return res.status(200).json({ message: result.message });
      }
      return res.status(400).json({ message: result.message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }


  async getById(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res
          .status(400)
          .json({ message: "SubCategory id is required" });
      }
      const result = await this.subCategoryUsecase.findById(id);

      if (result.success) {
        return res
          .status(200)
          .json({ message: result.message, data: result.data });
      }
      return res.status(400).json({ message: result.message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getByCategoryId(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res
          .status(400)
          .json({ message: "Category id is required" });
      }

      const result = await this.subCategoryUsecase.findByCategoryId(id);
      if (result.success) {
        return res
          .status(200)
          .json({ message: result.message, data: result.data,pathUrl:result?.pathUrl});
      }
      return res.status(204).json({ message: result.message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getSubCategory(req, res) {
    console.log(req.body)
    try {
      const result = await this.subCategoryUsecase.getSubCategory(req.body);
      if (result.success) {
        return res.status(200).json({
          message: result.message,
          data: result.data.subcategories,
          totalDocuments: result.data.totalcategory,
          totalPages: result.data.totalPages,
          currentPage: result.data.currentPage,
        });
      }
      return res.status(400).json({ message: result.message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default SubCategoryController;
