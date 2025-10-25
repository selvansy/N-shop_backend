class colorMasterController {
   constructor(colourmasterusecase) {
      this.colourmasterusecase = colourmasterusecase;
    }

 async Createcolormaster(req, res) {
    try {
        const data = req.body;
        data.createdBy = req.user.id_employee;

         const existingStone = await this.colourmasterusecase.findByFields({
                name: req.body.name.trim(),
            });

            if (existingStone) {
                return res.status(400).json({
                    success: false,
                    message: "Colur Master with this name already exists.",
                });
            }

        const newClarity = await this.colourmasterusecase.createColourMaster(data);

        res.status(201).json({
            status: 201,
            message: "Color master created successfully",
            data: newClarity,
        });
    } catch (error) {
        res.status(400).json({ status: 400, message: error.message });
    }
};

async Getcolormaster(req, res) {
    try {
        const clarityMasters = await this.colourmasterusecase.getcolourmasters();

        res.status(200).json({
            status: 200,
            message: "Color Masters fetched successfully",
            data: clarityMasters,
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

}

export default colorMasterController;
