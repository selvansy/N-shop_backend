import StonemasterUsecase from "../../../usecases/auth/ecom/stonemasterUsecase.js";

class StonemasterController{
    constructor(){
        this.stonemasterusecase=new StonemasterUsecase();
    }

    async Cretaestonemaster(req, res) {
        try {
            const requiredFields = [
                "stonename",
                "percraterate",
                "stone_cut_id",
                "clarity_id",
                "color_id",
                "shape_id",
            ];

            const missingFields = requiredFields.filter(field => !req.body[field]);

            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required field",
                });
            }

            const existingStone = await this.stonemasterusecase.findByFields({
                stonename: req.body.stonename?.trim(),
                 is_diamond: req.body.is_diamond || false,
            });

            if (existingStone) {
                return res.status(400).json({
                    success: false,
                    message: "Stone Master with this name already exists.",
                });
            }
            req.body.createdBy = req.user?.id_employee;

            const result = await this.stonemasterusecase.createStonemaster(req.body);

            if (!result) {
                return res.status(400).json({
                    success: false,
                    message: "Failed to add Stone master. Please try again later.",
                });
            }

            return res.status(201).json({
                success: true,
                message: "Stone master added successfully",
                data: result,
            });
        } catch (error) {
            console.error("Error while adding Stone master:", error);
            return res.status(500).json({
                success: false,
                message: error.message || "An error occurred while adding Stone master.",
            });
        }
    }



      async editStonemaster(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            data.updatedBy=req.user.id_employee;
            const existingStone = await this.stonemasterusecase.findByFields({
                stonename: req.body.stonename.trim(),
                is_diamond: req.body.is_diamond || false,
                 _id: { $ne: id },
            });

            if (existingStone) {
                return res.status(400).json({
                    success: false,
                    message: "Stone Master with this name already exists.",
                });
            }

            const updatedAddress = await this.stonemasterusecase.editStonemaster(id, data);

            if (!updatedAddress) {
                return res.status(404).json({
                    success: false,
                    message: "Stone data not found",
                });
            }

            res.status(200).json({
                success: true,
                message: "Stone datas updated successfully",
                data: updatedAddress,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    
    async deletestone(req, res) {
    try {
        const { id } = req.params;

        const deletedAddress = await this.stonemasterusecase.deleteStonmaster(id);

        res.status(200).json({
            success: true,
            message: "stone deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

async getstone(req,res){
    try{
        const stone= await this.stonemasterusecase.Getstonemaster();

         res.status(200).json({
            success: true,
            message: "stone Fethched successfully",
            data: stone,
        });
    }
     catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

 async getstonebyid(req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: "stone ID is required" });
        }

        const addresses = await this.stonemasterusecase.Getstonemasterbyid(id);

        res.status(200).json({
            success: true,
            message: "stone fetched successfully",
            data: addresses,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

 async getstonemastertable(req, res) {
    try {
      const result = await this.stonemasterusecase.getStonemastertable(req.body);
      if (result.success) {
        return res.status(200).json({
          message: result.message,
          data: result.data.subcategories,
          totalDocuments: result.data.totalcategory,
          totalPages: result.data.totalPages,
          currentPage: result.data.currentPage,
        });
      }
      return res.status(400).json({ message: result.message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

   async getDiamond(req, res) {
    try {
      const result = await this.stonemasterusecase.getDiamond();
      if (result.success) {
        return res.status(200).json({
          message: result.message,
          data: result.data
        });
      }
      return res.status(400).json({ message: result.message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

   async getStone(req, res) {
    try {
      const result = await this.stonemasterusecase.getStone();
      if (result.success) {
        return res.status(200).json({
          message: result.message,
          data: result.data
        });
      }
      return res.status(400).json({ message: result.message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  async changeStatus(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "StoneMaster ID is required" });
      }

      const result = await this.stonemasterusecase.changeStatus(id);
      if (result.success) {
        return res.status(200).json({ message: result.message });
      }

      return res.status(400).json({ message: result.message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

}

export default StonemasterController;