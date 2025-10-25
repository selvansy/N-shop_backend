import colourMasterModel from "../../models/ecom/colourMasterModel.js";

export default class ColorMasterRepositary {

     async createcolormaster(data) {
            try {
                const Cutmaster = new colourMasterModel(data);
                return await Cutmaster.save();
            } catch (error) {
                throw new Error(error.message);
            }
        }

         async getcolormaster() {
                try {
                    return await colourMasterModel.find({ active: true }).sort({ createdAt: -1 });
                } catch (error) {
                    throw new Error(`Error fetching addresses: ${error.message}`);
                }
            }

            async findOne(filter) {
                    return await colourMasterModel.findOne(filter);
                }
}