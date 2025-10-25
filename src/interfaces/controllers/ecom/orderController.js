// src/controllers/OrderController.js
class OrderController {
  constructor(orderUseCase) {
    this.orderUseCase = orderUseCase;
  }

  async getOrder(req, res) {
    try {
      const result = await this.orderUseCase.getOrder(req.user);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async placeOrder(req, res) {
    try {
      const { addressId,redeemedSchemeAccounts} = req.body;
      const result = await this.orderUseCase.placeOrder(
        req.user,
        addressId,
        req.user,
        redeemedSchemeAccounts
      );
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getMyOrder(req, res) {
    try {
      const result = await this.orderUseCase.getMyOrder(req.user);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
  async getOrderItems(req, res) {
    try {
      const { id } = req.params;
      const result = await this.orderUseCase.getOrderItems(req.user, id);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllOrders(req, res) {
     const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search=req.query.search;
    const fromDate=req.query.from_date;
    const toDate=req.query.to_date;

    try {
      const result = await this.orderUseCase.getAllOrders({ page, limit,search,fromDate,toDate });
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
  async webhook(req, res) {
    try {
      const result = await this.orderUseCase.webhook(req);
      
      if (!result) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  async verifyPaymentStatus(req, res) {
    try {
      const result = await this.orderUseCase.verifyPaymentStatus(req);

      if (!result) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json({
        success: true,
        message: result.message,
        data: { success: result.data },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

    async getOrderItemReport(req, res) {
    try {
      const {id}=req.params
      const result = await this.orderUseCase.getOrderItemReport(id);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

    async getTopSellingProduct(req, res) {
    try {
      const {fromDate,toDate}=req.body
  
      const result = await this.orderUseCase.getTopSellingProduct(fromDate,toDate);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }


    async getTopSellingCategory(req, res) {
    try {
      const {fromDate,toDate}=req.body
      
      const result = await this.orderUseCase.getTopSellingCategory(fromDate,toDate);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
    async getTopSellingCategory(req, res) {
    try {
      const {fromDate,toDate}=req.body
     
      
      const result = await this.orderUseCase.getTopSellingCategory(fromDate,toDate);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

    async getOverAllReport(req, res) {
    try {
      const {fromDate,toDate}=req.body
     
      const result = await this.orderUseCase.getOverAllReport(fromDate,toDate);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

    async getOrderStatus(req, res) {
    try {
     
      const result = await this.orderUseCase.getOrderStatusList();
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

    async changeOrderStatus(req, res) {
    try {
      const {statusId,orderId,remarks}=req.body
      
      const result = await this.orderUseCase.changeOrderStatus(statusId,orderId,remarks);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }


    async getPaymentReport(req, res) {
    const {page,limit,search,from_date,to_date}=req.query;
    
    try {
      const result = await this.orderUseCase.getPaymentReport(page,limit,search,from_date,to_date);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }


    async getTopSellingProductTable(req, res) {
    try {
      const {fromDate,toDate,search,page,limit}=req.body

  
      const result = await this.orderUseCase.getTopSellingProducttable(fromDate,toDate,page,limit,search);
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default OrderController;
