// src/controllers/cartController.js
class CartController {
  constructor(cartUseCase) {
    this.cartUseCase = cartUseCase;
  }

  async createCart(req, res) {
    try {
      const cartData = req.body;
      const cart = await this.cartUseCase.createCart(cartData, req.user);
      console.log(cart.success);
      if (!cart.success) {
        return res.status(400).json({
          success: false,
          message: cart.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: cart.message,
        data: cart.data,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCart(req, res) {
    try {

      const cart = await this.cartUseCase.getCart(req.user);

      if(!cart.success){
       return res.status(400).json({
        success: false,
        message:cart.message
      });
      }
      res.status(200).json({
        success: true,
        message:cart.message,
         data: cart.data,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }


  async findProduct(req, res) {
    try {
      const {id}=req.params
      const cart = await this.cartUseCase.findProduct(req.user,id);

      if(!cart.success){
       return res.status(400).json({
        success: false,
        message:cart.message
      });
      }
      res.status(200).json({
        success: true,
        message:cart.message,
         data: cart.data,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // async addItem(req, res) {
  //   try {
  //     const identifier = req.body;
  //     const itemData = req.body.item;

  //     const cart = await this.cartUseCase.addItemToCart(identifier, itemData);

  //     res.status(200).json({
  //       success: true,
  //       data: cart,
  //       message: "Item added to cart successfully",
  //     });
  //   } catch (error) {
  //     res.status(400).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }

  async removeItem(req, res) {
    try {
      const { itemId } = req.body;

      const result = await this.cartUseCase.removeItemFromCart(
        itemId,
        req.user
      );

      if (!result.success) {
       return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

     return res.status(200).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // async updateQuantity(req, res) {
  //   try {
  //     const { cartId, userId, sessionId, productId, quantity } = req.body;
  //     const identifier = { cartId, userId, sessionId };

  //     const cart = await this.cartUseCase.updateItemQuantity(
  //       identifier,
  //       productId,
  //       quantity
  //     );

  //     res.status(200).json({
  //       success: true,
  //       data: cart,
  //       message: "Item quantity updated successfully",
  //     });
  //   } catch (error) {
  //     res.status(400).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }

  // async applyCoupon(req, res) {
  //   try {
  //     const { cartId, userId, sessionId, couponCode, couponMeta } = req.body;
  //     const identifier = { cartId, userId, sessionId };

  //     const cart = await this.cartUseCase.applyCoupon(
  //       identifier,
  //       couponCode,
  //       couponMeta
  //     );

  //     res.status(200).json({
  //       success: true,
  //       data: cart,
  //       message: "Coupon applied successfully",
  //     });
  //   } catch (error) {
  //     res.status(400).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }

  // async removeCoupon(req, res) {
  //   try {
  //     const { cartId, userId, sessionId } = req.body;
  //     const identifier = { cartId, userId, sessionId };

  //     const cart = await this.cartUseCase.removeCoupon(identifier);

  //     res.status(200).json({
  //       success: true,
  //       data: cart,
  //       message: "Coupon removed successfully",
  //     });
  //   } catch (error) {
  //     res.status(400).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }

  // async updateAddress(req, res) {
  //   try {
  //     const { cartId, userId, sessionId, type, address } = req.body;
  //     const identifier = { cartId, userId, sessionId };

  //     let cart;
  //     if (type === "shipping") {
  //       cart = await this.cartUseCase.updateShippingAddress(
  //         identifier,
  //         address
  //       );
  //     } else if (type === "billing") {
  //       cart = await this.cartUseCase.updateBillingAddress(identifier, address);
  //     } else {
  //       throw new Error('Address type must be "shipping" or "billing"');
  //     }

  //     res.status(200).json({
  //       success: true,
  //       data: cart,
  //       message: "Address updated successfully",
  //     });
  //   } catch (error) {
  //     res.status(400).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }

  // async mergeCarts(req, res) {
  //   try {
  //     const { userId, sessionId } = req.body;
  //     const cart = await this.cartUseCase.mergeCarts(userId, sessionId);

  //     res.status(200).json({
  //       success: true,
  //       data: cart,
  //       message: "Carts merged successfully",
  //     });
  //   } catch (error) {
  //     res.status(400).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }

  // async abandonCart(req, res) {
  //   try {
  //     const { cartId, userId, sessionId } = req.body;
  //     const identifier = { cartId, userId, sessionId };

  //     const cart = await this.cartUseCase.abandonCart(identifier);

  //     res.status(200).json({
  //       success: true,
  //       data: cart,
  //       message: "Cart abandoned successfully",
  //     });
  //   } catch (error) {
  //     res.status(400).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }
}

export default CartController;
