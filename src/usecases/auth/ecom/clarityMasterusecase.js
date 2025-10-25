import ClarityMasterRepositary from "../../../infrastructure/repositories/ecom/claritymasterRepositary.js";



export default class ClarityMasterUsecase {
  constructor() {
    this.claritymasterrepo = new ClarityMasterRepositary();
  }

  async createClarityMaster(data) {
        try {
            if (!data.code || !data.name) {
                throw new Error("Code and Name are required");
            }

            return await this.claritymasterrepo.createclaritymaster(data);
        } catch (error) {
            throw new Error(`Failed to create clarity master: ${error.message}`);
        }
    }

     async getClarityMasters() {
        try {
            return await this.claritymasterrepo.getclaritymaster();
        } catch (error) {
            throw new Error(`Failed to fetch clarity masters: ${error.message}`);
        }
    }

     async findByFields(filter) {
    return await this.claritymasterrepo.findOne(filter);
}
    
}