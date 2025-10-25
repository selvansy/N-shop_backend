class shapeMasterController {
   constructor(shapeMasterusecase) {
      this.shapemasterusecase = shapeMasterusecase;
    }

 async createshapeMaster(req, res) {
    try {
        const data = req.body;
        data.createdBy = req.user.id_employee;
        
        const existingStone = await this.shapemasterusecase.findByFields({
            name: req.body.name.trim(),
        });
        
        if (existingStone) {
            return res.status(400).json({
                success: false,
                message: "Shape Master with this name already exists.",
            });
        }
        const newClarity = await this.shapemasterusecase.createClarityMaster(data);
        
        res.status(201).json({
            status: 201,
            message: "Shape Master created successfully",
            data: newClarity,
        });
    } catch (error) {
        res.status(400).json({ status: 400, message: error.message });
    }
};

async getshapeMasters(req, res) {
    try {
        const clarityMasters = await this.shapemasterusecase.getClarityMasters();

        res.status(200).json({
            status: 200,
            message: "Shape Masters fetched successfully",
            data: clarityMasters,
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

}

export default shapeMasterController;
