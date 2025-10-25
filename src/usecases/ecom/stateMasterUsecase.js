export default class StateMasterUseCase {
  constructor(stateRepo) {
    this.stateRepo = stateRepo;
  }

  async createState(data) {
    try {
      const existingState = await this.stateRepo.findByStateNameOrCode(data.stateName, data.stateCode);

      if (existingState) {
        return { success: false, message: "State already exists" };
      }
      
      const result = await this.stateRepo.create(data);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error creating state:", error);
      throw new Error("Failed to create state.");
    }
  }

  // async getAllStates(filters = {}) {
  //   try {
  //     const states = await this.stateRepo.findAll(filters);
  //     return { success: true, data: states };
  //   } catch (error) {
  //     console.error("Error fetching states:", error);
  //     throw new Error("Failed to fetch states.");
  //   }
  // }
  async getAllStates(filters = {}) {
  try {
    const result = await this.stateRepo.findAll(filters);
    return { 
      success: true, 
      data: result.states,
      pagination: result.pagination
    };
  } catch (error) {
    console.error("Error fetching states:", error);
    throw new Error("Failed to fetch states.");
  }
}

  async getStateById(id) {
    try {
      const state = await this.stateRepo.findById(id);
      if (!state) {
        return { success: false, message: "State not found" };
      }
      return { success: true, data: state };
    } catch (error) {
      console.error(`Error fetching state with ID ${id}:`, error);
      throw new Error("Failed to fetch state by ID.");
    }
  }

  async updateState(id, data) {
    try {
      const existingState = await this.stateRepo.findById(id);
      if (!existingState) {
        return { success: false, message: "State not found" };
      }

      if (data.stateName || data.stateCode) {
        const duplicateState = await this.stateRepo.findByStateNameOrCode(
          data.stateName || existingState.stateName,
          data.stateCode || existingState.stateCode,
          id
        );
        
        if (duplicateState) {
          return { success: false, message: "State name or code already exists" };
        }
      }

      const updatedState = await this.stateRepo.update(id, data);
      return { success: true, data: updatedState };
    } catch (error) {
      console.error(`Error updating state with ID ${id}:`, error);
      throw new Error("Failed to update state.");
    }
  }

  async activateState(id) {
  try {
    const existingState = await this.stateRepo.findById(id);
    if (!existingState) {
      return { success: false, message: "State not found" };
    }

    const newDeliveryStatus = !existingState.deliveryEnabled;

    const updatedState = await this.stateRepo.updateById(id, {
      deliveryEnabled: newDeliveryStatus,
      updatedAt: new Date()
    });

    return {
      success: true,
      message: `Delivery has been ${newDeliveryStatus ? "enabled" : "disabled"} successfully.`,
      data: updatedState
    };
  } catch (error) {
    console.error(`Error updating delivery status for state ID ${id}:`, error);
    throw new Error("Failed to update delivery status.");
  }
}


  async deleteState(id) {
    try {
      const state = await this.stateRepo.findById(id);
      if (!state) {
        return { success: false, message: "State not found" };
      }

      const result = await this.stateRepo.softDelete(id);
      return { success: true, data: result, message: "State deleted successfully" };
    } catch (error) {
      console.error(`Error deleting state with ID ${id}:`, error);
      throw new Error("Failed to delete state.");
    }
  }
}