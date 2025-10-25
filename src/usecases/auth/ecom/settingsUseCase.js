// src/UseCase/EcomSettingsUseCase.js
class EcomSettingsUseCase {
  constructor(EcomSettingsRepo) {
    this.ecomSettingsRepo = EcomSettingsRepo;
  }

  async activeEcom (isEnable){
    try{
        const result = await this.ecomSettingsRepo.activeEcom(isEnable)
        if(!result){
            return {
          success: false,
          message: "Failed to Update Ecom",
        };
        }
     return {
        success: true,
        message: "Successfully Upate Ecom",
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: "Error while Update Ecom",
      };
  }
}


}
export default EcomSettingsUseCase;
