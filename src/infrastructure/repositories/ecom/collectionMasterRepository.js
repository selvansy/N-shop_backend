import collectionModel from "../../models/ecom/collectionModel.js";

class CollectionMasterRepository {
  constructor() {
    this.Collection = collectionModel;
  }

  // Create a new collection
  async create(collectionData) {
    try {
      const collection = new this.Collection(collectionData);
      return await collection.save();
    } catch (error) {
      console.error("Repository Error - Create:", error);
      throw new Error(`Repository Error - Create: ${error.message}`);
    }
  }

  // Get all collections
  async findAll() {
    try {
      return await this.Collection.find({ active: true }).sort({
        createdAt: -1,
      });
    } catch (error) {
      console.error("Repository Error - Find All:", error);
      throw new Error(`Repository Error - Find All: ${error.message}`);
    }
  }

  // Get collection by ID
  async findById(id) {
    try {
      return await this.Collection.findById(id);
    } catch (error) {
      console.error("Repository Error - Find By ID:", error);
      throw new Error(`Repository Error - Find By ID: ${error.message}`);
    }
  }

  // Get collection by slug
  async findBySlug(slug) {
    try {
      return await this.Collection.findOne({ slug });
    } catch (error) {
      console.error("Repository Error - Find By Slug:", error);
      throw new Error(`Repository Error - Find By Slug: ${error.message}`);
    }
  }

  // Update collection
  async update(id, updateData) {
    try {
      return await this.Collection.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      console.error("Repository Error - Update:", error);
      throw new Error(`Repository Error - Update: ${error.message}`);
    }
  }

  // Delete collection
  async delete(id) {
    try {
      return await this.Collection.findByIdAndUpdate(
        id,
        {
          $set: {
            isDeleted: true,
            active: false,
          },
        },
        { new: true, runValidators: true }
      );
    } catch (error) {
      console.error(error)
      throw new Error(`Repository Error - Soft Delete: ${error.message}`);
    }
  }

  // Find collections by active status
  async findByStatus(isActive) {
    try {
      return await this.Collection.find({ isActive }).sort({ createdAt: -1 });
    } catch (error) {
      console.error("Repository Error - Find By Status:", error);
      throw new Error(`Repository Error - Find By Status: ${error.message}`);
    }
  }

  // Search collections by name or description
  async searchCollections(searchTerm) {
    try {
      return await this.Collection.find({
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
        ],
      }).sort({ createdAt: -1 });
    } catch (error) {
      console.error("Repository Error - Search:", error);
      throw new Error(`Repository Error - Search: ${error.message}`);
    }
  }

  // Count total collections
  async countCollections() {
    try {
      return await this.Collection.countDocuments();
    } catch (error) {
      console.error("Repository Error - Count:", error);
      throw new Error(`Repository Error - Count: ${error.message}`);
    }
  }

  // Bulk update collections
  async bulkUpdate(ids, updateData) {
    try {
      return await this.Collection.updateMany(
        { _id: { $in: ids } },
        updateData,
        { runValidators: true }
      );
    } catch (error) {
      console.error("Repository Error - Bulk Update:", error);
      throw new Error(`Repository Error - Bulk Update: ${error.message}`);
    }
  }

  // Check if collection exists by ID
  async existsById(id) {
    try {
      return await this.Collection.exists({ _id: id });
    } catch (error) {
      console.error("Repository Error - Exists By ID:", error);
      throw new Error(`Repository Error - Exists By ID: ${error.message}`);
    }
  }
}

export default CollectionMasterRepository;
