import clarityMasteModel from "../../models/ecom/clarityMasteModel.js";
import cutmasterModel from "../../models/ecom/cutmasterModel.js";



export default class ClarityMasterRepositary {

     async createclaritymaster(data) {
            try {
                const Cutmaster = new clarityMasteModel(data);
                return await Cutmaster.save();
            } catch (error) {
                throw new Error(error.message);
            }
        }

         async getclaritymaster() {
                try {
                    return await clarityMasteModel.find({ active: true }).sort({ createdAt: -1 });
                } catch (error) {
                    throw new Error(`Error fetching addresses: ${error.message}`);
                }
            }

    async findOne(filter) {
        return await clarityMasteModel.findOne(filter);
    }
}