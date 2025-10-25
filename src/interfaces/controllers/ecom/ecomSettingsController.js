// src/controllers/EcomSettingsController.js
class EcomSettingsController {
  constructor(EcomSettingsUseCase) {
    this.ecomSettingsUseCase = EcomSettingsUseCase;
  }

  async activeEcom(req, res) {
    try {
        const {isEnable}=req.body
      const result = await this.ecomSettingsUseCase.activeEcom(isEnable);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default EcomSettingsController;
