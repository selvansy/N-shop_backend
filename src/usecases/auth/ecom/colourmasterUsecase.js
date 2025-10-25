import ColorMasterRepositary from "../../../infrastructure/repositories/ecom/colourmasterRepositary.js";

export default class ColorMasterUsecase {
  constructor() {
    this.colourmasterrepo = new ColorMasterRepositary();
  }

  async createColourMaster(data) {
        try {
            if (!data.code || !data.name) {
                throw new Error("Code and Name are required");
            }

            return await this.colourmasterrepo.createcolormaster(data);
        } catch (error) {
            throw new Error(`Failed to create clarity master: ${error.message}`);
        }
    }

     async getcolourmasters() {
        try {
            return await this.colourmasterrepo.getcolormaster();
        } catch (error) {
            throw new Error(`Failed to fetch clarity masters: ${error.message}`);
        }
    }

      async findByFields(filter) {
    return await this.colourmasterrepo.findOne(filter);
}
    
}