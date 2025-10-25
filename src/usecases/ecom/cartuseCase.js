class CartUseCase {
  constructor(cartRepo) {
    this.cartRepo = cartRepo;
  }

  async createCart(cartData) {
    try {
      return await this.cartRepo.createCart(cartData);
    } catch (error) {
      throw new Error(`UseCase Error (createCart): ${error.message}`);
    }
  }

  async getCart(cartId) {
    try {
      return await this.cartRepo.findCartById(cartId);
    } catch (error) {
      throw new Error(`UseCase Error (getCart): ${error.message}`);
    }
  }

  async addItemToCart(cartId, itemData) {
    try {
      return await this.cartRepo.addItemToCart(cartId, itemData);
    } catch (error) {
      throw new Error(`UseCase Error (addItemToCart): ${error.message}`);
    }
  }

  async updateItemQuantity(cartId, itemId, quantity) {
    try {
      return await this.cartRepo.updateItemQuantity(cartId, itemId, quantity);
    } catch (error) {
      throw new Error(`UseCase Error (updateItemQuantity): ${error.message}`);
    }
  }

  async removeItemFromCart(cartId, itemId) {
    try {
      return await this.cartRepo.removeItem(cartId, itemId);
    } catch (error) {
      throw new Error(`UseCase Error (removeItemFromCart): ${error.message}`);
    }
  }

  async clearCart(cartId) {
    try {
      return await this.cartRepo.clearCart(cartId);
    } catch (error) {
      throw new Error(`UseCase Error (clearCart): ${error.message}`);
    }
  }

  async getCartSummary(cartId) {
    try {
      return await this.cartRepo.getCartSummary(cartId);
    } catch (error) {
      throw new Error(`UseCase Error (getCartSummary): ${error.message}`);
    }
  }
}

export default CartUseCase;
