import CutMasterRepositary from "../../../infrastructure/repositories/ecom/cutmasterRepositary.js";


export default class CutMasterUsecase {
  constructor() {
    this.cutmasterrepo = new CutMasterRepositary();
  }

  async createCutMaster(data) {
        try {
            if (!data.code || !data.name) {
                throw new Error("Code and Name are required");
            }

            return await this.cutmasterrepo.createcutmaster(data);
        } catch (error) {
            throw new Error(`Failed to create clarity master: ${error.message}`);
        }
    }

     async getcutmasters() {
        try {
            return await this.cutmasterrepo.getcutmaster();
        } catch (error) {
            throw new Error(`Failed to fetch clarity masters: ${error.message}`);
        }
    }

      async findByFields(filter) {
    return await this.cutmasterrepo.findOne(filter);
}
    
}