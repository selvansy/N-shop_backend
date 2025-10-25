import DeliveryAddressRepositary from "../../../infrastructure/repositories/ecom/deliveryaddressRepositary.js";

export default class CreateDeliveryAddressUsecase {
  constructor() {
    this.deliveryAddressRepo = new DeliveryAddressRepositary();
  }

  async createAddress(data) {
    try {

      const requiredFields = ["name", "mobileNo", "address", "addressType"];
      for (const field of requiredFields) {
        if (!data[field]) {
          throw new Error("Fill required Fields");
        }
      }
      const newAddress = await this.deliveryAddressRepo.createaddress(data);
      return newAddress;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getaddress(customerId) {
    return await this.deliveryAddressRepo.getaddressbycustomerid(customerId);
}

  async editaddress(id, data) {
    try {
      const updatedAddress = await this.deliveryAddressRepo.editaddress(id, data);

      if (!updatedAddress) {
        throw new Error("Delivery address not found");
      }

      return updatedAddress;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteaddress(id) {
    try {
      const deletedAddress = await this.deliveryAddressRepo.deleteaddress(id);

      if(deletedAddress.isPrimary){
        throw new Error("Primary address cannot be delelted")
      }
      if (!deletedAddress) {
        throw new Error("Delivery address not found");
      }

      return deletedAddress;
    } catch (error) {
      throw new Error(error.message);
    }
  }

}
