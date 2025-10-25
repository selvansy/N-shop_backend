import ClarityMasterAddressUsecase from "../../../usecases/auth/ecom/clarityMasterusecase.js";

class clarityMasterController {
   constructor(clarityMasterusecase) {
      this.clarityMasterusecase = clarityMasterusecase;
    }

 async createClarityMaster(req, res) {
    try {
        const data = req.body;
        data.createdBy = req.user.id_employee;
        
        const existingStone = await this.clarityMasterusecase.findByFields({
            name: req.body.name.trim(),
        });
        
        if (existingStone) {
            return res.status(400).json({
                success: false,
                message: "Clarity Master with this name already exists.",
            });
        }
        const newClarity = await this.clarityMasterusecase.createClarityMaster(data);
        res.status(201).json({
            status: 201,
            message: "Clarity Master created successfully",
            data: newClarity,
        });
    } catch (error) {
        res.status(400).json({ status: 400, message: error.message });
    }
};

async getClarityMasters(req, res) {
    try {
        const clarityMasters = await this.clarityMasterusecase.getClarityMasters();

        res.status(200).json({
            status: 200,
            message: "Clarity Masters fetched successfully",
            data: clarityMasters,
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

}

export default clarityMasterController;
