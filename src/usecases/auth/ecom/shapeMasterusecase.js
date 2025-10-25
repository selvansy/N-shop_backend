import ShapeMasterRepositary from "../../../infrastructure/repositories/ecom/shapemasterRepositary.js";

export default class ShapeMasterUsecase {
  constructor() {
    this.shapemasterrepo = new ShapeMasterRepositary();
  }

  async createClarityMaster(data) {
        try {
            if (!data.code || !data.name) {
                throw new Error("Code and Name are required");
            }

            return await this.shapemasterrepo.createshapemaster(data);
        } catch (error) {
            throw new Error(`Failed to create clarity master: ${error.message}`);
        }
    }

     async getClarityMasters() {
        try {
            return await this.shapemasterrepo.getshapemaster();
        } catch (error) {
            throw new Error(`Failed to fetch clarity masters: ${error.message}`);
        }
    }

    async findByFields(filter) {
        return await this.shapemasterrepo.findOne(filter);
    }
    
}