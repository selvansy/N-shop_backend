import UomRepositary from "../../../infrastructure/repositories/ecom/uomRepositary.js";

export default class Eomusecase {
  constructor() {
    this.uomrepo = new UomRepositary();
  }

  async CreateEom(data){
    try{
        if(!data){
            return{success:false,message:"Eom fields are required"}
        }

        const newEom = await this.uomrepo.CreateEom(data);
        
        return {
            success: true,
            message: "EOM created successfully",
            data: newEom
        };
    }
    catch(error){
         console.error("Error creating Eom:", error);
        return {
          success: false,
          message: error.message
        };
    }
  }

  async Getuom() {
    try {
      const eoms = await this.uomrepo.GetEom();

      return {
        success: true,
        message: "EOM list fetched successfully",
        data: eoms,
      };
    }
    catch (error) {
      console.error("Error Get Eom:", error);
      return {
        success: false,
        message: error.message
      };
    }
  }

   async EditEom(id, data) {
    try {
      if (!id) {
        return { success: false, message: "EOM ID is required" };
      }

      const updatedEom = await this.uomrepo.EditEom(id, data);

      if (!updatedEom) {
        return { success: false, message: "EOM not found" };
      }

      return {
        success: true,
        message: "EOM updated successfully",
        data: updatedEom,
      };
    } catch (error) {
      console.error("Error updating EOM:", error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async DeleteEom(id){
    try{
      const eoms=await this.uomrepo.DeleteEom(id);

      return{
        success:true,
        message:"Eom Deleted Successfully"
      };
    }
     catch (error) {
      console.error("Error delete Eom:", error);
      return {
        success: false,
        message: error.message
      };
    }
  }

}