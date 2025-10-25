import crypto from "crypto";
import config from "../../config/chit/env.js";
import OrderTransactionDetailsRepository from "../../infrastructure/repositories/ecom/orderTransactionDetailsRepository.js";
import CustomerRepository from "../../infrastructure/repositories/chit/CustomerRepository.js";
import OrderPaymentRepository from "../../infrastructure/repositories/ecom/orderPaymentRepository.js";
import OrderTransactionRepository from "../../infrastructure/repositories/ecom/orderTransactionRepository.js";
import EcomPaymentOrderRepository from "../../infrastructure/repositories/ecom/ecomPaymentOrderRepository.js";
import axios from "axios";
import ProductRepository from "../../infrastructure/repositories/chit/productRepository.js";
import OrderUseCase from "../auth/ecom/orderUseCase.js";
import OrderRepository from "../../infrastructure/repositories/ecom/orderRepository.js";

class OrderPaymentUsecase {
  constructor() {
    this.customerRepo = new CustomerRepository();
    this.OrderTransactionDetailsRepository =
      new OrderTransactionDetailsRepository();
    this.paymentRepository = new OrderPaymentRepository();
    this.transactionRepository = new OrderTransactionRepository();
    this.paymentOrderRepo = new EcomPaymentOrderRepository();
    this.productRepo = new ProductRepository();
    this.orderRepo = new OrderRepository();
  }

  async orderPaymentCreation(orderData, token = null, extraData = null) {
    try {
      if (!orderData || !orderData.order) {
        return {
          success: false,
          message: "Order data is required",
        };
      }

      const { order, items } = orderData;

      const userData = await this.customerRepo.findOne({
        mobile: token.mobile,
      });

      if (!userData) {
        return { success: false, message: "No user found" };
      }

      const raw = `${token._id}${Date.now()}`;
      const transactionId = crypto
        .createHash("sha256")
        .update(raw)
        .digest("hex")
        .slice(0, 15);

      let totalAmount = 0;
      let paymentIds = [];

      const transactionDetails = {
        transactionId: transactionId,
        idCustomer: token?._id,
        idBranch: token.id_branch,
        totalProducts: items.length,
        platform: extraData?.platform || 0,
        totalAmount: order.totalDiscount || 0,
        trans_date: new Date(),
        mobile: token.mobile || "",
        paymentStatus: 2,
      };

      const saveTransactionDetails =
        await this.OrderTransactionDetailsRepository.addTransactionDetails(
          transactionDetails
        );

      if (!saveTransactionDetails) {
        return {
          success: false,
          message: "Failed to save transaction details",
        };
      }

      // Generate a payment receipt
      const paymentReceipt = `RECEIPT-${Date.now()}`;

      for (const item of items) {
        const amount = item.price * item.quantity - (item.discountAmount || 0);

        const paymentData = {
          id_transaction: transactionId,
          payment_receipt: paymentReceipt,
          date_add: new Date(),
          date_payment: new Date(),
          payment_status: 2,
          payment_type: 2,
          id_branch: token.id_branch,
          id_customer: token._id,
          id_product: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          payment_amount: amount,
          discount: item.discountAmount || 0,
        };

        const savedPayment = await this.paymentRepository.addPayment(
          paymentData
        );

        if (!savedPayment) {
          return { success: false, message: "Failed to save payment" };
        }

        paymentIds.push(savedPayment._id);

        const subtransaction = {
          transdetailid: saveTransactionDetails._id,
          transactionid: transactionId,
          id_customer: token._id,
          id_branch: token.id_branch,
          payment_date: new Date(),
          id_product: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          payment_amount: amount,
          discount: item.discountPerUnit || 0,
          platform: extraData?.platform || 0,
          payment_status: 2,
        };

        await this.transactionRepository.addTransaction(subtransaction);
        totalAmount += Number(amount);
      }

      const totalData = this.sanitizeAmount(order.totalDiscount);

      const customerOrderData = {
        order_id: transactionId,
        order_amount: totalData,
        order_currency: "INR",
        customer_details: {
          customer_id: token._id,
          customer_name: `${token.firstname} ${token.lastname}`,
          customer_email: order.email || token.email || "customer@example.com",
          customer_phone: order.phone || token.mobile.toString(),
        },
        order_meta: {
          return_url: extraData?.return_url || "https://example.com/return",
        },
      };

      const createdOrder = await this.createOrder(customerOrderData);

      const paymentOrderDetails = {
        orderId: transactionId,
        payment_amount: order.grandTotal || totalAmount,
        total_products: items.length,
        created_by: token?.id_employee,
        date_add: new Date(),
        id_customer: token?._id,
        product_payment_ids: paymentIds,
        cf_order_id: createdOrder?.cf_order_id,
        payment_session_id: createdOrder?.payment_session_id,
        original_order_id: order._id,
        orderObjId: order?._id,
      };

      await this.paymentOrderRepo.addPaymentOrder(paymentOrderDetails);

      return {
        data: {
          session: createdOrder?.payment_session_id,
          orderId: transactionId,
        },
      };
    } catch (error) {
      console.error("Error in e-commerce payment:", error);
      return {
        success: false,
        message: "Something went wrong while processing payment",
        error: error.message,
      };
    }
  }

  sanitizeAmount(value) {
    if (typeof value !== "number") {
      value = Number(value);
    }
    return +value.toFixed(2);
  }

  async updatePaymentReceipt(
    generalSettings,
    schemeData,
    existingReceipt,
    productId
  ) {
    return existingReceipt || `RECEIPT-${Date.now()}`;
  }

  async createOrder(data) {
    try {
      const url = "https://sandbox.cashfree.com/pg/orders";
      const headers = {
        "Content-Type": "application/json",
        "x-client-id": config.CASHFREE_CLIENT_ID,
        "x-client-secret": config.CASHFREE_SECRET,
        "x-api-version": config.API_VERSION,
      };
      const response = await axios.post(url, data, { headers });

      return response.data;
    } catch (error) {
      console.error(error);
    }
  }


  // async reduceProductCount(data) {
  //   try {
  //     // const { orderObjectId } = data;
  //     const orderObjectId ="68c3a579d31d4c51ed2591bb"

  //     if (!orderObjectId) {
  //       throw new Error("orderObjectId is required");
  //     }

  //     const result = await this.orderRepo.getProductCountsByOrder(orderObjectId);

  //     return result;
  //   } catch (error) {
  //     console.error("Usecase Error in ReduceProductCount:", error);
  //     throw error;
  //   }
  // }

  // Replace the reduceProductCount method with this IIFE
  // (async () => {
//   try {
//     const orderObjectId = "68c3a579d31d4c51ed2591bb";

//     if (!orderObjectId) {
//       throw new Error("orderObjectId is required");
//     }

//     // You'll need to create an instance or access repositories differently
//     const orderRepo = new OrderRepository(); // Make sure to import if needed
//     const result = await orderRepo.getProductCountsByOrder(orderObjectId);

//     console.log("reduceProductCount executed via IIFE:", result);
//     return result;
//   } catch (error) {
//     console.error("Error in reduceProductCount IIFE:", error);
//     throw error;
//   }
// })();
  

  async completePayment(data) {
    try {
      const orderId = data?.data?.order?.order_id;
      const cfPaymentId = data?.data?.payment?.cf_payment_id;
      const customerId = data?.data?.customer_details?.customer_id;

      if (data?.data?.payment?.payment_status !== "SUCCESS") {
        return;
      }

      const updatedPaymentOrder = await this.paymentOrderRepo.findAndUpdate(
        { orderId, status: { $ne: 1 } },
        { cf_payment_id: cfPaymentId, status: 1 },
        { returnDocument: "after" }
      );

      if (!updatedPaymentOrder) {
        return;
      }

      // const data = await this.reduceProductCount(updatedPaymentOrder)

      const orderObjId = updatedPaymentOrder?.orderObjId;
      await this.orderRepo.updatePaymentCount(orderObjId);
    } catch (error) {
      console.error("Error in completePayment:", error);
      throw error;
    }
  }
}

export default OrderPaymentUsecase;
