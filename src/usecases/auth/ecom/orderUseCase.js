import OrderPaymentUsecase from "../../ecom/orderPaymentUsecase.js";
import crypto from "crypto";
import config from "../../../config/chit/env.js";
import EcomPaymentOrderRepository from "../../../infrastructure/repositories/ecom/ecomPaymentOrderRepository.js";
import axios from "axios";
import SchemeAccountRepository from "../../../infrastructure/repositories/chit/schemeAccountRepository.js";
import moment from "moment-timezone";
import smsService from "../../../config/chit/smsService.js";
import SaveNotificationRepo from "../../../infrastructure/repositories/chit/saveNotificationRepo.js";
import SaveNotificationUsecase from "../chit/client/saveNotificationUsecase.js";

class OrderUseCase {
  constructor(
    cartRepository,
    productRepository,
    orderRepository,
    shipRocketUseCase,
    pincodeUseCase,
    deliveryAddressRepository
  ) {
    this.cartRepository = cartRepository;
    this.productRepository = productRepository;
    this.orderRepository = orderRepository;
    this.shipRocketUseCase = shipRocketUseCase;
    this.pincodeUseCase = pincodeUseCase;
    this.deliveryAddressRepository = deliveryAddressRepository;

    this.baseUrl = config.CASH_FREE_URL || "https://sandbox.cashfree.com";
    this.url = `${this.baseUrl}/pg/orders`;
    (this.mail = "test@gmail.com"), (this.password = "12345");
    this.orderpaymentUsecase = new OrderPaymentUsecase();
    this.ecomPaymentReopo = new EcomPaymentOrderRepository();
    this.schemeAccountRepo = new SchemeAccountRepository();
    this.saveNotificationRepo = new SaveNotificationRepo();
    this.saveNotificationUsecase = new SaveNotificationUsecase(
      this.saveNotificationRepo
    );
  }

  async getDateRange(fromDate, toDate) {
    let startDate, endDate;

    if (fromDate && toDate) {
      startDate = new Date(fromDate);
      startDate.setHours(0, 0, 0, 0); // 12:00 AM IST

      endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999); // 11:59 PM IST
    } else {
      // Default: today
      const today = new Date();
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  }

  async sendNotification(customerId, title, message) {
    const inputMsg = {
      recipients: [customerId],
      title: title,
      message: message,
      channel: "push",
    };
    await smsService.sendNotification(inputMsg);
    await this.saveNotificationUsecase.saveNotification(
      {
        title: inputMsg.title,
        message: inputMsg.message,
        type: "alert",
        category: "Order",
      },
     customerId
    );

    // if (
    //   notificationData.whatsapp.enabled &&
    //   notificationData.whatsapp.topupCount > 0
    // ) {
    //   const whatsappInfo = await this.smsRepo.findOne({ active: true });
    //   if (whatsappInfo) {
    //     const whatsappData = {
    //       numbers: [data.mobile],
    //       message: whatsappInfo.whatsappPayment,
    //       templateParams: { paymentAmount: data.payment_amount },
    //       channel: "whatsapp",
    //       customUrl: whatsappInfo.payment_url,
    //     };

    //     const whatsappOutput = await smsService.sendNotification(
    //       whatsappData
    //     );
    //     if (whatsappOutput) {
    //       await this.topupRepo.decrementField({}, "WhatsApp", 1);
    //     }
    //   }
    // }

    // if (notificationData.sms.enabled && notificationData.sms.topupCount > 0) {
    //   const smsInfo = await this.smsRepo.findOne({ active: true });
    //   if (smsInfo) {
    //     const smsData = {
    //       numbers: [data.mobile],
    //       message: smsInfo.payment_content,
    //       templateParams: { paymentAmount: data.payment_amount },
    //       sms_type: "",
    //       channel: "sms",
    //       delayBetweenSMS: 1000,
    //       customUrl: smsInfo.payment_url,
    //     };

    //     const smsSendStatus = await smsService.sendNotification(smsData);
    //     if (smsSendStatus) {
    //       await this.topupRepo.decrementField({}, "SMS", 1);
    //       message = "Payment added successfully, SMS delivered to customer";
    //     }
    //   }
    // }
  }

  async getOrder(userData) {
    try {
      if (!userData._id) {
        throw new Error("User ID not found");
      }

      const findCart = await this.cartRepository.findCartByUserId(userData._id);
      if (!findCart) {
        return {
          success: false,
          message: "Cart not found",
        };
      }
      const cartItems = await this.cartRepository.findById(findCart._id);
      if (!cartItems) {
        return {
          success: false,
          message: "Failed to retrieve order details.",
          data: cartItems,
        };
      }
      return {
        success: true,
        message: "order details retrieved successfully.",
        data: cartItems,
      };
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to retrieve order: ${error.message}`);
    }
  }

  

 async placeOrder(userData, addressId, token, redeemedSchemeAccounts) {
    try {
      if (!userData._id) {
        throw new Error("User ID not found");
      }
      if (!addressId) {
        throw new Error("Address Id is required");
      }
      const findAddress = await this.deliveryAddressRepository.findById(
        addressId
      );

      if (!findAddress) {
        return {
          success: false,
          message: "Invalid Address Id",
        };
      }
      const findCart = await this.cartRepository.findCartByUserId(userData._id);
      if (!findCart) {
        return {
          success: false,
          message: "Cart not found",
        };
      }
      const cartItems = await this.cartRepository.findById(findCart._id);
      if (!cartItems) {
        return {
          success: false,
          message: "Failed to retrieve order details.",
          data: cartItems,
        };
      }
      const findPincodeData = await this.pincodeUseCase.getPincodesByFilters({
        pincode: findAddress.pincode,
      });
      const pincodeData = findPincodeData[0];
      if (!pincodeData || !pincodeData.isDeliveryAvailable) {
        return {
          success: false,
          message: "Delivery is not available for this pincode",
        };
      }
      const estimatedDeliveryDays = pincodeData?.estimatedDeliveryDays;
      const isPaid = true;
      if (!isPaid) {
        return {
          success: false,
          message: "Payment Failed",
        };
      }
      const shppingCharge = 0;
      const raw = `${userData._id}${Date.now()}`;
      const transactionId = crypto
        .createHash("sha256")
        .update(raw)
        .digest("hex")
        .slice(0, 15);
      const orderData = {
        orderId: `ORD-${transactionId}`,
        userId: userData._id,
        phone: userData?.mobile,
        cartId: findCart._id,
        shipping_is_billing: true,
        itemsCount: cartItems.items.length,
        subtotal: cartItems.overAllAmount.totalDiscount,
        totalDiscount: cartItems.overAllAmount.totalDiscount,
        shippingFee: shppingCharge,
        totalAmount: cartItems.overAllAmount.totalDiscount + shppingCharge,
        // couponCode: "NEWUSER100",
        // payment: "68899df2c34cf80f45b7ed1c",
        savedAmount:
          cartItems.overAllAmount.totalPrice -
          cartItems.overAllAmount.totalDiscount,
        status: "Placed",
        deliveryAddress: addressId,
        estimatedDeliveryDays,
        active: false,
      };
      const orderItems = cartItems.items.map((item) => ({
        productId: item.productId, // from API
        sizeId: item.sizeId, // mapping `itemId` → `sizeId`
        productName: item.productName,
        sku: item.sku, // not in response
        image: item.image,
        grossWeight: item.grossWt,
        price: item.price,
        quantity: item.qty,
        discountAmount: item.discount,
        categoryId: item.categoryId, // not in response (set later if needed)
        subCategoryId: item.subCategoryId, // not in response
        collectionId: item.collectionId, // not in response
        status: "pending", // default
        trackingNumber: null,
        shippedAt: new Date(),
        estimatedDeliveryDays,
        returnStatus: "none",
        refundAmount: 0,
      }));
      
      const paymentData = await this.orderpaymentUsecase.orderPaymentCreation(
        {
          order: orderData,
          items: orderItems,
        },
        token
      );
      
      if (!paymentData) {
        return {
          success: false,
          message: "Failed to create order",
        };
      }
      const createOrder = await this.orderRepository.createOrder(
        orderData,
        orderItems
      );
      
      await this.schemeAccountRepo.closeSchemeAccount(
        redeemedSchemeAccounts,
        token?._id
      );

      return {
        success: true,
        message: "Your order has been placed successfully",
        data: paymentData?.data,
      };
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to place order: ${error.message}`);
    }
  }
   
  async getMyOrder(userData) {
    try {
      if (!userData._id) {
        throw new Error("User ID not found");
      }

      const findOrders = await this.orderRepository.findOrders(userData._id);

      if (!findOrders) {
        return {
          success: false,
          message: "Failed to get orders",
        };
      }

      return {
        success: true,
        message: "order retrieved successfully.",
        data: findOrders,
      };
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to get orders: ${error.message}`);
    }
  }

  async getOrderItems(userData, orderId) {
    try {
      if (!userData._id) {
        throw new Error("User ID not found");
      }
      if (!orderId) {
        throw new Error("Order id required");
      }

      const findOrder = await this.orderRepository.findById(orderId);
      if (!findOrder) {
        return {
          success: false,
          message: "Order not found",
        };
      }
      const findOrderItems = await this.orderRepository.findOrderItems(
        findOrder._id
      );
      if (!findOrderItems) {
        return {
          success: false,
          message: "Failed to get orders",
        };
      }
      return {
        success: true,
        message: "order retrieved successfully.",
        data: findOrderItems,
      };
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to get orders: ${error.message}`);
    }
  }

  async getAllOrders({ page, limit, search, fromDate, toDate }) {
    page = page || 1;
    limit = limit || 10;
    let filter = {};

    try {
      if (fromDate && toDate) {
        if (new Date(toDate) < new Date(fromDate)) {
          throw new Error("End date cannot be before start date");
        }

        const startDate = moment
          .tz(fromDate, "Asia/Kolkata")
          .startOf("day")
          .toDate();
        const endDate = moment.tz(toDate, "Asia/Kolkata").endOf("day").toDate();

        filter.createdAt = {
          $gte: startDate,
          $lte: endDate,
        };
      }

      if (search && search.trim() !== "") {
        const searchRegex = new RegExp(search.trim(), "i");

        filter.$or = [
          { status: { $regex: searchRegex } },
          { orderId: { $regex: searchRegex } },
          { phone: { $regex: searchRegex } },
        ];
      }

      const orders = await this.orderRepository.getAllOrders(
        page,
        limit,
        filter
      );

      if (!orders) {
        return {
          success: false,
          message: "Failed to get orders",
        };
      }
      return {
        success: true,
        message: "Orders retrived successuly",
        data: orders,
      };
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to get orders: ${error.message}`);
    }
  }

  async webhook(data) {
    try {
      const secretKey = config.CASHFREE_SECRET;

      if (!secretKey) {
        console.error("SECRET_KEY is missing in environment variables.");
        return { status: false, message: "Secret key is not configured" };
      }

      const signature = data.headers["x-webhook-signature"];
      const payload = data.rawBody;
      const body = data.headers["x-webhook-timestamp"] + payload;

      if (!payload) {
        console.error("Raw payload is undefined");
        return { message: "Invalid payload" };
      }

      const generatedSignature = crypto
        .createHmac("sha256", secretKey)
        .update(body)
        .digest("base64");

      if (signature !== generatedSignature) {
        console.error("Invalid Signature: Possible spoofing attempt.");
        return { status: false, message: "Payment verification failed" };
      }

      await this.orderpaymentUsecase.completePayment(data.body);

      return { status: true, message: "Webhook received successfully" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while getting payment" };
    }
  }

  async verifyPaymentStatus(req) {
    try {
      const { orderid } = req.query;
      const orderData = await this.ecomPaymentReopo.findOne({
        orderId: orderid,
      });

      if (!orderData) {
        return { success: false, message: "No order records found" };
      }

      const paymetStatus = await this.getOrderStatus(orderid);

      let status = false;
      if (paymetStatus?.order_status === "PAID") {
        status = true;
      }

      if (paymetStatus)
        return {
          success: true,
          message: "Payment data fetched successfully",
          data: status,
        };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while getting payment" };
    }
  }

  async getOrderStatus(orderid) {
    try {
      const url = `${this.url}/${orderid}`;
      const headers = {
        "Content-Type": "application/json",
        "x-client-id": config.CASHFREE_CLIENT_ID,
        "x-client-secret": config.CASHFREE_SECRET,
        "x-api-version": config.API_VERSION,
      };

      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while getting status" };
    }
  }

  async getOrderItemReport(orderId) {
    try {
      const findOrder = await this.orderRepository.findById(orderId);
      if (!findOrder) {
        return {
          success: false,
          message: "Order not found",
        };
      }
      const result = await this.orderRepository.findOrderDetailReport(orderId);
      if (!result) {
        return {
          success: false,
          message: "Failed to get order item report",
        };
      }
      return {
        success: true,
        message: "Successfully retrieved order report",
        data: result,
      };
    } catch (error) {
      return { success: false, message: "Error while getting item report" };
    }
  }

  async getTopSellingProduct(fromDate, toDate) {
    try {
      const { startDate, endDate } = await this.getDateRange(fromDate, toDate);
      const filter = {
        active: true,
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };

      const result = await this.orderRepository.getTopSellingProduct(filter);
      if (!result) {
        return {
          success: false,
          message: "Failed to get order product wise report",
        };
      }
      return {
        success: true,
        message: "Successfully retrieved order product wise report",
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: "Error while getting order product wise report",
      };
    }
  }

  async getTopSellingCategory(fromDate, toDate) {
    try {
      const { startDate, endDate } = await this.getDateRange(fromDate, toDate);
      const filter = {
        active: true,
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };

      const result = await this.orderRepository.getTopSellingCategory(filter);
      if (!result) {
        return {
          success: false,
          message: "Failed to get order product wise report",
        };
      }
      return {
        success: true,
        message: "Successfully retrieved order product wise report",
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: "Error while getting order product wise report",
      };
    }
  }

  async getOverAllReport(fromDate, toDate) {
    try {
      // usage
      const { startDate, endDate } = await this.getDateRange(fromDate, toDate);

      const result = await this.orderRepository.getOverAllReport(
        startDate,
        endDate
      );
      if (!result) {
        return {
          success: false,
          message: "Failed to get order product wise report",
        };
      }
      return {
        success: true,
        message: "Successfully retrieved order product wise report",
        data: result[0],
      };
    } catch (error) {
      return {
        success: false,
        message: "Error while getting order product wise report",
      };
    }
  }

  async getOrderStatusList() {
    try {
      const result = await this.orderRepository.findOrderStatus();
      if (result) {
        return {
          success: true,
          data: result,
        };
      }
      return {
        success: false,
        message: "Failed to get order status",
      };
    } catch (error) {
      return { success: false, message: "Error while getting order Status" };
    }
  }

  // async changeOrderStatus(statusId, orderId) {
  //   try {
  //     const orderData = await this.orderRepository.findById({_id:orderId})
  //     const stautsData = await this.orderRepository.findStatusById(statusId)
  //     // if(stautsData?.statusNo == "2"){

  //     // }
  //     return console.log(orderData)
  //     const result = await this.orderRepository.changeOrderStatus(
  //       statusId,
  //       orderId
  //     );
  //     if (result) {
  //       return {
  //         success: true,
  //         data: result,
  //       };
  //     }
  //     return {
  //       success: false,
  //       message: "Failed to Update order status",
  //     };
  //   } catch (error) {
  //     return { success: false, message: "Error while getting order Status" };
  //   }
  // }
  async changeOrderStatus(statusId, orderId, remarks) {
    try {
      const orderData = await this.orderRepository.findById({ _id: orderId });
      const statusData = await this.orderRepository.findStatusById(statusId);

      if (statusData?.statusNo == "2") {
        if (!orderData?.cartId) {
          return {
            success: false,
            message: "Cart ID not found in order data",
          };
        }

        const orderItems = await this.orderRepository.findOrderItemsByCartId(
          orderId
        );

        if (!orderItems || orderItems.length === 0) {
          return {
            success: false,
            message: "No cart items found",
          };
        }

        for (const item of orderItems) {
          if (item.productId && item.sizeId) {
            const reductionResult =
              await this.productRepository.reduceProductQuantity(
                item.productId,
                item.sizeId,
                item.quantity || 1
              );

            if (!reductionResult.success) {
              console.error(
                `Failed to reduce quantity for product ${item.productId}, size ${item.sizeId}:`,
                reductionResult.message
              );
            }
          }
        }
      }

      const result = await this.orderRepository.changeOrderStatus(
        statusId,
        orderId
      );

      if (result) {
        let title = "Order Status";
        let message = "";

        if (statusData?.statusNo == "2") {
          message = `Your order has been placed successfully! Order ID: ${remarks}`;
        } else if (statusData?.statusNo == "3") {
          message = `Your order has been delivered successfully. Order ID: ${remarks}`;
        } else if (statusData?.statusNo == "4") {
          message = `Your order has been cancelled. Order ID: ${remarks}`;
        }

        await this.sendNotification(orderData?.userId,title,message)
        return {
          success: true,
          data: result,
        };
      }

      return {
        success: false,
        message: "Failed to update order status",
      };
    } catch (error) {
      console.error("Error while updating order status:", error);
      return {
        success: false,
        message: "Error while updating order status",
      };
    }
  }

  async getPaymentReport(page, limit, search, from_date, to_date, paymentMode) {
    page = page || 1;
    limit = limit || 10;
    let filter = {};

    try {
      if (from_date && to_date) {
        if (new Date(to_date) < new Date(from_date)) {
          throw new Error("End date cannot be before start date");
        }

        const startDate = moment
          .tz(from_date, "Asia/Kolkata")
          .startOf("day")
          .toDate();
        const endDate = moment
          .tz(to_date, "Asia/Kolkata")
          .endOf("day")
          .toDate();

        filter.createdAt = {
          $gte: startDate,
          $lte: endDate,
        };
      }

      const result = await this.orderRepository.getPaymentReport(
        page,
        limit,
        filter,
        search
      );
      if (result) {
        return {
          success: true,
          data: result,
        };
      }
      return {
        success: false,
        message: "Failed to Update order status",
      };
    } catch (error) {
      return { success: false, message: "Error while getting order Status" };
    }
  }

  async getTopSellingProducttable(fromDate, toDate, page, limit, search) {
    try {
      const { startDate, endDate } = await this.getDateRange(fromDate, toDate);
      const filter = {
        active: true,
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };

      const result = await this.orderRepository.getTopSellingProducttable(
        page,
        limit,
        filter,
        search
      );
      if (!result) {
        return {
          success: false,
          message: "Failed to get order product wise report",
        };
      }
      return {
        success: true,
        message: "Successfully retrieved order product wise report",
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: "Error while getting order product wise report",
      };
    }
  }
}

export default OrderUseCase;
