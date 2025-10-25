import Eomusecase from "../../../usecases/auth/ecom/uomusecase.js";

export default class EomController {
  constructor() {
    this.eomUsecase = new Eomusecase();
  }

  async createEom(req, res) {
    try {
      const data = req.body;

      const result = await this.eomUsecase.CreateEom(data);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(201).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("Controller Error (CreateEom):", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

   async getEom(req, res) {
    try {
      const result = await this.eomUsecase.Getuom();

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error("Controller Error (GetEom):", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async editEom(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "EOM ID is required",
        });
      }

      const result = await this.eomUsecase.EditEom(id, data);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Controller Error (EditEom):", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

    async deleteEom(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "EOM ID is required"
        });
      }

      const result = await this.eomUsecase.DeleteEom(id);

      if (!result.success) {
        return res.status(404).json(result);
      }
      return res.status(200).json(result);

    } catch (error) {
      console.error("Controller Error (DeleteEom):", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error"
      });
    }
  }

}
