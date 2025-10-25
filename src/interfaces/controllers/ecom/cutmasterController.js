import ClarityMasterAddressUsecase from "../../../usecases/auth/ecom/clarityMasterusecase.js";

class cutMasterController {
   constructor(cutMasterusecase) {
      this.cutMasterusecase = cutMasterusecase;
    }

 async createCutMaster(req, res) {
    try {
        const data = req.body;
        data.createdBy = req.user.id_employee;

         const existingStone = await this.cutMasterusecase.findByFields({
                name: req.body.name.trim(),
            });

            if (existingStone) {
                return res.status(400).json({
                    success: false,
                    message: "Clarity Master with this name already exists.",
                });
            }
     const newClarity = await this.cutMasterusecase.createCutMaster(data);

        res.status(201).json({
            status: 201,
            message: "Cut Master created successfully",
            data: newClarity,
        });
    } catch (error) {
        res.status(400).json({ status: 400, message: error.message });
    }
};

async getCutMasters(req, res) {
    try {
        const clarityMasters = await this.cutMasterusecase.getcutmasters();

        res.status(200).json({
            status: 200,
            message: "Cut Masters fetched successfully",
            data: clarityMasters,
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

}

export default cutMasterController;
