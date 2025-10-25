import cutmasterModel from "../../models/ecom/cutmasterModel.js";



export default class CutMasterRepositary {

     async createcutmaster(data) {
            try {
                const Cutmaster = new cutmasterModel(data);
                return await Cutmaster.save();
            } catch (error) {
                throw new Error(error.message);
            }
        }

         async getcutmaster() {
                try {
                    return await cutmasterModel.find({ active: true }).sort({ createdAt: -1 });
                } catch (error) {
                    throw new Error(`Error fetching addresses: ${error.message}`);
                }
            }

        async findOne(filter) {
        return await cutmasterModel.findOne(filter);
    }
}