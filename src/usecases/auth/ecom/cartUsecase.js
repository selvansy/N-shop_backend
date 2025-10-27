// src/usecases/cartUseCase.js
class CartUseCase {
  constructor(cartRepository, customerRepository, productRepository) {
    this.cartRepository = cartRepository;
    this.customerRepository = customerRepository;
    this.productRepository = productRepository;
  }

  async createCart(cartData, userData) {
    try {
      const { productId, collectionId, sizeId } = cartData;
      // Validate required fields
      if (!userData._id) {
        throw new Error("User ID not found");
      }
      const findUser = await this.customerRepository.findInfo(userData._id);
      if (findUser.active === false) {
        throw new Error("User account is inactive. Please contact support.");
      }

      if (findUser.is_deleted) {
        throw new Error("User account has been deleted.");
      }
      const findCart = await this.cartRepository.findByUserId(userData._id);
      let cartId = findCart && findCart._id ? findCart._id : null;
      cartData.userId = userData._id;
      if (!findCart) {
        const cart = {
          ...cartData,
          status: "active",
        };
        const createCart = await this.cartRepository.create(cart);
        cartId = createCart._id;
      }
      const findProduct = await this.productRepository.findById(
        productId,
        userData._id
      );

      if (!findProduct) {
        return { success: false, message: "Product Not found" };
      }

      const {
        id_category,
        id_purity,
        id_metal,
        product_name,
        product_image,
        grossWt,
      } = findProduct;
      const cartItem = {
        cartId: cartId,
        productId: productId,
        collectionId: collectionId,
        categoryId: id_category,
        subCategoryId: findProduct?.subcategoryId || null,
        productName: product_name,
        sku: findProduct?.sku || null,
        image: product_image[0],
        id_metal: id_metal,
        metalWeight: grossWt,
        id_purity: id_purity,
        sizeId: sizeId,
      };
      const createItem = await this.cartRepository.addItemToCart(cartItem);
      if (!createItem) {
        return {
          success: false,
          message: "Unable to add the product to your cart. Please try again.",
        };
      }
      return {
        success: true,
        message: "Product added to cart",
        data: createItem,
      };
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to create cart: ${error.message}`);
    }
  }

  async getCart(userData) {
    try {
      if (!userData._id) {
        throw new Error("User ID not found");
      }

      const findCart = await this.cartRepository.findCartByUserId(userData._id);

      if (!findCart) {
        throw new Error("Cart not found");
      }

      const cartItems = await this.cartRepository.findById(findCart._id);
      if (!cartItems) {
        return {
          success: false,
          message: "Failed to retrieve cart details.",
          data: cartItems,
        };
      }
      return {
        success: true,
        message: "Cart details retrieved successfully.",
        data: cartItems,
      };
    } catch (error) {
      throw new Error(`Failed to get cart: ${error.message}`);
    }
  }

  async findProduct(userData, branchId) {
    try {
      if (!userData._id) {
        throw new Error("User ID not found");
      }

      if (!branchId) {
        throw new Error("Branch ID is Required");
      }
      const findCart = await this.cartRepository.findCartByUserId(userData._id);

      if (!findCart) {
        throw new Error("Cart not found");
      }

      const findProduct = await this.cartRepository.findProductByBranch(
        findCart._id,
        branchId
      );
      if (!findProduct) {
        return {
          success: false,
          message: "Failed to retrieve cart details.",
        };
      }

      let message;
      let success
      if (findProduct && findProduct.length >= 1) {
        message = `${findProduct.length} product(s) are not available in this branch`;
        success=false
      } else {
        message = "All products are available in this branch";
        success=true
      }
      return {
        success: true,
        message: "Cart details retrieved successfully.",
        data: {
          products: findProduct,
          message: message,
          success
        },
      };
    } catch (error) {
      throw new Error(`Failed to get cart: ${error.message}`);
    }
  }
  async removeItemFromCart(itemId, userData) {
    try {
      if (!userData._id) {
        throw new Error("User ID not found");
      }
      const deleteItem = await this.cartRepository.removeItem(
        itemId,
        userData._id
      );

      if (!deleteItem) {
        return {
          success: false,
          message:
            "Unable to remove the item from your cart. Please try again.",
        };
      }
      return {
        success: true,
        message: "Item has been successfully removed from your cart.",
        data: deleteItem,
      };
    } catch (error) {
      throw new Error(`Failed to remove item from cart: ${error.message}`);
    }
  }

  // async addItemToCart(identifier, itemData) {
  //   try {
  //     let cart = await this.getCart(identifier);

  //     // Check if item already exists
  //     const existingItemIndex = cart.items.findIndex(
  //       (item) => item.productId.toString() === itemData.productId.toString()
  //     );

  //     if (existingItemIndex !== -1) {
  //       // Update existing item
  //       cart.items[existingItemIndex] = {
  //         ...cart.items[existingItemIndex].toObject(),
  //         ...itemData,
  //       };

  //       return await this.cartRepository.update(cart._id, {
  //         items: cart.items,
  //       });
  //     } else {
  //       // Add new item
  //       return await this.cartRepository.addItem(cart._id, itemData);
  //     }
  //   } catch (error) {
  //     throw new Error(`Failed to add item to cart: ${error.message}`);
  //   }
  // }

  

  // async updateItemQuantity(identifier, productId, quantity) {
  //   try {
  //     const cart = await this.getCart(identifier);

  //     if (quantity <= 0) {
  //       return await this.cartRepository.removeItem(cart._id, productId);
  //     }

  //     return await this.cartRepository.updateItemQuantity(
  //       cart._id,
  //       productId,
  //       quantity
  //     );
  //   } catch (error) {
  //     throw new Error(`Failed to update item quantity: ${error.message}`);
  //   }
  // }

  // async applyCoupon(identifier, couponCode, couponMeta) {
  //   try {
  //     const cart = await this.getCart(identifier);
  //     return await this.cartRepository.applyCoupon(
  //       cart._id,
  //       couponCode,
  //       couponMeta
  //     );
  //   } catch (error) {
  //     throw new Error(`Failed to apply coupon: ${error.message}`);
  //   }
  // }

  // async removeCoupon(identifier) {
  //   try {
  //     const cart = await this.getCart(identifier);
  //     return await this.cartRepository.removeCoupon(cart._id);
  //   } catch (error) {
  //     throw new Error(`Failed to remove coupon: ${error.message}`);
  //   }
  // }

  // async updateShippingAddress(identifier, addressData) {
  //   try {
  //     const cart = await this.getCart(identifier);
  //     return await this.cartRepository.update(cart._id, {
  //       shippingAddress: addressData,
  //     });
  //   } catch (error) {
  //     throw new Error(`Failed to update shipping address: ${error.message}`);
  //   }
  // }

  // async updateBillingAddress(identifier, addressData) {
  //   try {
  //     const cart = await this.getCart(identifier);
  //     return await this.cartRepository.update(cart._id, {
  //       billingAddress: addressData,
  //     });
  //   } catch (error) {
  //     throw new Error(`Failed to update billing address: ${error.message}`);
  //   }
  // }

  // async updateShippingFee(identifier, shippingFee) {
  //   try {
  //     const cart = await this.getCart(identifier);
  //     return await this.cartRepository.update(cart._id, { shippingFee });
  //   } catch (error) {
  //     throw new Error(`Failed to update shipping fee: ${error.message}`);
  //   }
  // }

  // async mergeCarts(userId, sessionId) {
  //   try {
  //     const userCart = await this.cartRepository.findByUserId(userId);
  //     const sessionCart = await this.cartRepository.findBySessionId(sessionId);

  //     if (!sessionCart) {
  //       return userCart;
  //     }

  //     if (!userCart) {
  //       // Convert session cart to user cart
  //       return await this.cartRepository.update(sessionCart._id, {
  //         userId,
  //         sessionId: null,
  //       });
  //     }

  //     // Merge items from session cart to user cart
  //     const mergedItems = [...userCart.items];

  //     for (const sessionItem of sessionCart.items) {
  //       const existingItemIndex = mergedItems.findIndex(
  //         (item) =>
  //           item.productId.toString() === sessionItem.productId.toString()
  //       );

  //       if (existingItemIndex !== -1) {
  //         // Update quantity if item exists
  //         mergedItems[existingItemIndex].quantity += sessionItem.quantity;
  //       } else {
  //         // Add new item
  //         mergedItems.push(sessionItem);
  //       }
  //     }

  //     // Update user cart with merged items
  //     const updatedCart = await this.cartRepository.update(userCart._id, {
  //       items: mergedItems,
  //     });

  //     // Delete session cart
  //     await this.cartRepository.delete(sessionCart._id);

  //     return updatedCart;
  //   } catch (error) {
  //     throw new Error(`Failed to merge carts: ${error.message}`);
  //   }
  // }

  // async abandonCart(identifier) {
  //   try {
  //     const cart = await this.getCart(identifier);
  //     return await this.cartRepository.updateStatus(cart._id, "abandoned");
  //   } catch (error) {
  //     throw new Error(`Failed to abandon cart: ${error.message}`);
  //   }
  // }

  // async lockCart(identifier) {
  //   try {
  //     const cart = await this.getCart(identifier);
  //     return await this.cartRepository.updateStatus(cart._id, "locked");
  //   } catch (error) {
  //     throw new Error(`Failed to lock cart: ${error.message}`);
  //   }
  // }
}

export default CartUseCase;
