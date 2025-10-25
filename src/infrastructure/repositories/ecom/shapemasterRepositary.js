import shapemasterModel from "../../models/ecom/shapemasterModel.js";

export default class ShapeMasterRepositary {
    async createshapemaster(data) {
        try {
            const Cutmaster = new shapemasterModel(data);
            return await Cutmaster.save();
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getshapemaster() {
        try {
            return await shapemasterModel.find({ active: true }).sort({ createdAt: -1 });
        } catch (error) {
            throw new Error(`Error fetching addresses: ${error.message}`);
        }
    }
    
    async findOne(filter) {
        return await shapemasterModel.findOne(filter);
    }
}