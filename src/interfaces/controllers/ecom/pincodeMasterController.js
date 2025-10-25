import axios from "axios";


class pincodeMasterController {
  constructor(usecase) {
    this.usecase = usecase;
  }

  createPincode = async (req, res) => {
  try {
    const requiredFields = {
      id_country: "Country ID is required",
      id_state: "State ID is required",
      id_city: "City ID is required",
      pincode: "Pincode is required",
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message,
        });
      }
    }

    const pincodeData = await this.usecase.createPincode(req.body);

    res.status(201).json({
      success: true,
      message: "Pincode created successfully",
      data: pincodeData,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


  getAllPincodes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search,active} = req.query;

    const pincodes = await this.usecase.getAllPincodes({
      page: parseInt(page),
      limit: parseInt(limit),
      search: search?.trim() || "",
      country,
      state,
      city,
      isDeliveryAvailable,
    });

    res.status(200).json({
      success: true,
      ...pincodes, 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


  getPincodeById = async (req, res) => {
    try {
      const pincode = await this.usecase.getPincodeById(req.params.id);
      res.status(200).json({
        success: true,
        data: pincode,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  };

  updatePincode = async (req, res) => {
    try {
      const pincode = await this.usecase.updatePincode(
        req.params.id,
        req.body
      );
      res.status(200).json({
        success: true,
        message: "Pincode updated successfully",
        data: pincode,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  deletePincode = async (req, res) => {
    try {
      await this.usecase.deletePincode(req.params.id);
      res.status(200).json({
        success: true,
        message: "Pincode deleted successfully",
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  };

  checkDeliveryAvailability = async (req, res) => {
    try {
      const { pincode } = req.params;

      const pincodeData = await this.usecase.getPincodesByFilters({
        pincode,
      });

      if (pincodeData.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Pincode not found",
        });
      }

      const deliveryInfo = {
        isDeliveryAvailable: pincodeData[0].isDeliveryAvailable,
        estimatedDeliveryDays: pincodeData[0].estimatedDeliveryDays,
        location: {
          country: pincodeData[0].country,
          state: pincodeData[0].state,
          city: pincodeData[0].city,
        },
      };

      res.status(200).json({
        success: true,
        data: deliveryInfo,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  checkDeliveryAvailabilitybypincode = async (req, res) => {
  try {
    const { pincode, latitude, longitude } = req.query;

    let finalPincode = pincode;
    if (!pincode && latitude && longitude) {
      const response = await axios.get(
        `https://search.mappls.com/search/address/rev-geocode`,
        {
          params: {
            lat: latitude,
            lng: longitude,
            region: "IND",
            lang: "en",
            access_token: process.env.MAPPLS_ACCESS_TOKEN,
          },
        }
      );

      if (
        response.data &&
        response.data.results &&
        response.data.results.length > 0
      ) {
        finalPincode = response.data.results[0].pincode;
        console.log("12345678989",finalPincode)
      } else {
        return res.status(404).json({
          success: false,
          message: "Could not fetch pincode from given coordinates",
        });
      }
    }

    // if (!finalPincode) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Delivery not available for this location",
    //   });
    // }

    const pincodeData = await this.usecase.getPincodesBylatandland({
      pincode: finalPincode,
    });

    if (!pincodeData || pincodeData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Delivery not available for this location",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        isDeliveryAvailable: pincodeData?.isDeliveryAvailable,
        estimatedDeliveryDays: pincodeData?.estimatedDeliveryDays,
        pincode:pincodeData?.pincode
        // location: {
        //   country: pincodeData[0].country,
        //   state: pincodeData[0].state,
        //   city: pincodeData[0].city,
        // },
      },
    });
  } catch (error) {
    console.log('error', error);
    
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

 async getpincodetable(req, res) {
    console.log(req.body)
    try {
      const result = await this.usecase.getpincodetable(req.body);
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


   async changeStatus(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Pincode ID is required" });
      }

      const result = await this.usecase.changeStatus(id);
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


export default pincodeMasterController;
