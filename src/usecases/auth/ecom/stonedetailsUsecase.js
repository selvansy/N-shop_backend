import StoneDetailsRepository from "../../../infrastructure/repositories/ecom/stoneDetailsRepository.js";

export default class StonedeatilsUsecase {
  constructor() {
    this.StoneDetail = new StoneDetailsRepository()
  }

   async getById(id) {
    try {
      const stonemaster = await this.StoneDetail.getById(id);
      return stonemaster;
    } catch (error) {
     console.error(error);
      return { success: false, message: "Error while fetching the stone data" };
    }

  }

  async getManyByIds(ids,type) {
  return await this.StoneDetail.getManyByIds(ids,type);
}


}