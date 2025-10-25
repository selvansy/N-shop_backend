class SizemasterController {
  constructor(usecase) {
    this.usecase = usecase;
  }

  async create(req, res) {
    try {
      const data = await this.usecase.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const data = await this.usecase.getAll();
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const data = await this.usecase.getById(req.params.id);
      if (!data) return res.status(404).json({ success: false, message: "Not found" });
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const data = await this.usecase.update(req.params.id, req.body);
      if (!data) return res.status(404).json({ success: false, message: "Not found" });
      // res.status(200).json({ success: true, data });
      res.status(200).json({
        success: true,
        message: "Size Master updated successfully",
        data,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    console.log("retyui",req.body)
    try {
      const data = await this.usecase.delete(req.params.id);
      if (!data) return res.status(404).json({ success: false, message: "Not found" });
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
  
 async getsizemastertable(req, res) {
    try {
      const result = await this.usecase.getsizemastertable(req.body);
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

   async changeStatus(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Size Master id is required" });
      }

      const result = await this.usecase.changeStatus(id);

      if (result.success) {
        return res.status(200).json({ message: result.message });
      }

      return res.status(400).json({ message: result.message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}


export default SizemasterController;