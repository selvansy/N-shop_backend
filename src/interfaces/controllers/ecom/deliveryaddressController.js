class DeliveryAddressController {
  constructor(deliveryAddressUsecase) {
    this.deliveryAddressUsecase = deliveryAddressUsecase;
  }

  async createAddress(req, res) {
    try {
      const result = await this.deliveryAddressUsecase.createAddress(req.body);

      if (!result) {
        return res.status(400).json({
          success: false,
          message: "Failed to add delivery address. Please try again later.",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Delivery address added successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error while adding delivery address:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "An error occurred while adding delivery address.",
      });
    }
  }

//    async getAllAddresses(req, res) {
//         try {
//             const addresses = await this.deliveryAddressUsecase.getaddress();
//             res.status(200).json({
//                 success: true,
//                 message: "Addresses fetched successfully",
//                 data: addresses,
//             });
//         } catch (error) {
//             res.status(500).json({ success: false, message: error.message });
//         }
//     }

    async getAddressesByCustomer(req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: "Customer ID is required" });
        }

        const addresses = await this.deliveryAddressUsecase.getaddress(id);

        res.status(200).json({
            success: true,
            message: "Addresses fetched successfully",
            data: addresses,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

    async editAddress(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;

            const updatedAddress = await this.deliveryAddressUsecase.editaddress(id, data);

            if (!updatedAddress) {
                return res.status(404).json({
                    success: false,
                    message: "Delivery address not found",
                });
            }

            res.status(200).json({
                success: true,
                message: "Delivery address updated successfully",
                data: updatedAddress,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    async deleteAddress(req, res) {
    try {
        const { id } = req.params;

        const deletedAddress = await this.deliveryAddressUsecase.deleteaddress(id);

        res.status(200).json({
            success: true,
            message: "Delivery Address deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

}

export default DeliveryAddressController;
