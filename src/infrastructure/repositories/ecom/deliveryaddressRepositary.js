import deliveryaddressModel from "../../../infrastructure/models/ecom/deliveryaddressModel.js";


export default class DeliveryAddressRepositary {
    async createaddress(data) {
        try {
            const address = new deliveryaddressModel(data);
            return await address.save();
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getaddressbycustomerid(customerId) {
       
        try {
            const customer= await deliveryaddressModel
                .find({ id_customer: customerId, is_deleted: false })
                .populate(["id_country","id_state","id_city"])
                .sort({ createdAt: -1 })

            return customer;
        } catch (error) {
            throw new Error(`Error fetching addresses: ${error.message}`);
        }
    }


     async editaddress(id, data) {
        try {
            const updatedAddress = await deliveryaddressModel.findByIdAndUpdate(
                id,
                { $set: data },
                { new: true, runValidators: true }
            );

            if (!updatedAddress) {
                throw new Error("Address not found");
            }

             if (data.isPrimary === true) {
            await deliveryaddressModel.updateMany(
                {
                    id_customer: updatedAddress.id_customer,
                    _id: { $ne: id }
                },
                {
                    $set: { isPrimary: false }
                }
            );
        }

            return updatedAddress;
        } catch (error) {
            throw new Error(`Error updating address: ${error.message}`);
        }
    }
    
    async deleteaddress(id) {
        try {
            const deletedAddress = await deliveryaddressModel.findByIdAndDelete(id);
    
            if (!deletedAddress) {
                throw new Error("Address not found");
            }
    
            return deletedAddress;
        } catch (error) {
            throw new Error(`Error deleting address: ${error.message}`);
        }
    }

     async findById(id) {
        try {
            return await deliveryaddressModel.findById(id)
        } catch (error) {
            throw new Error(error.message);
        }
    }


}