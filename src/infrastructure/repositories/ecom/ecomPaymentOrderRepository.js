import ecomPaymentOrderModel from "../../models/ecom/ecomPaymentOrderModel.js";

class EcomPaymentOrderRepository {
  async addPaymentOrder(data) {
    try {
      const result = await ecomPaymentOrderModel.create(data);

      return result || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async findOne(query) {
    try {
      const result = await ecomPaymentOrderModel.findOne(query);

      return result || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async find(query) {
    try {
      const result = await ecomPaymentOrderModel.find(query);

      return result.length ? result : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async findAndUpdate(query, update, options = {}) {
    try {
      const { returnDocument, ...restOptions } = options;

      const mongooseOptions = {
        new: returnDocument === "after" || options.new === true,
        ...restOptions,
      };

      const result = await ecomPaymentOrderModel.findOneAndUpdate(
        query,
        update,
        mongooseOptions
      );

      return result || null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default EcomPaymentOrderRepository;
