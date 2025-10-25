import uomModel from "../../models/ecom/uomModel.js";

export default class UomRepositary{
    async CreateEom(data){
        try{
            const Eom=new uomModel(data);
            return await Eom.save();
        }
        catch(err){
            throw new Error(err.message);
        }
    }

    async EditEom(id, data) {
    try {
        if (!id) {
            return { success: false, message: "EOM ID is required" };
        }
        const updatedEom = await uomModel.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
        );

        if (!updatedEom) {
            return { success: false, message: "EOM not found" };
        }

        return {
            success: true,
            message: "EOM updated successfully",
            data: updatedEom
        };
    } catch (err) {
        console.error("Error updating EOM:", err);
        return {
            success: false,
            message: err.message
        };
    }
}

    async DeleteEom(id) {
        try {
            if (!id) {
                return { success: false, message: "EOM ID is required" };
            }
            const deletedEom = await uomModel.findByIdAndUpdate(
                id,
                { $set: { isDeleted: true } },
                { new: true }
            );

            if (!deletedEom) {
                return { success: false, message: "EOM not found" };
            }

            return {
                success: true,
                message: "EOM deleted successfully",
                data: deletedEom
            };
        }
        catch (err) {
            console.error("Error updating EOM:", err);
            return {
                success: false,
                message: err.message
            };
        }
    }

    async GetEom() {
        try {
            return await uomModel.find({isDeleted:false});
        } catch (error) {
            throw new Error(error.message);
        }
    }

}