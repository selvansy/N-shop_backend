export default class StateMasterController {
  constructor(usecases) {
    this.usecases = usecases;
  }

  async createState(req, res) {
    try {
      const state = await this.usecases.createState(req.body);
      
      if(!state.success){
          res.status(400).json({message:state.message});   
      }

      return res.status(201).json({message:state.message})
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async getAllStates(req, res) {
  try {
    const result = await this.usecases.getAllStates(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
}

  async getStateById(req, res) {
    try {
      const state = await this.usecases.getStateById(req.params.id);
      if (!state) return res.status(404).json({ message: "State not found" });
      res.json(state);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async updateState(req, res) {
    try {
      const state = await this.usecases.updateState(req.params.id, req.body);
      if (!state) return res.status(404).json({ message: "State not found" });
      res.json(state);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async activateState(req, res) {
    try {
      const state = await this.usecases.activateState(req.params.id);
      if (!state) return res.status(404).json({ message: "State not found" });
      res.json(state);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async deleteState(req, res) {
    try {
      const state = await this.usecases.deleteState(req.params.id);
      if (!state) return res.status(404).json({ message: "State not found" });
      res.json({ message: "State deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}
