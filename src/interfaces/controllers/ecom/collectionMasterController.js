class CollectionMasterController {
    constructor(collectionUsecase) {
        this.collectionUsecase = collectionUsecase;
    }

    // Create a new collection
    async createCollection(req, res) {
        try {
            const collectionData = req.body;
            const newCollection = await this.collectionUsecase.createCollection(collectionData);
            
            res.status(201).json({
                success: true,
                message: 'Collection created successfully',
                data: newCollection
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating collection',
                error: error.message
            });
        }
    }

    // Get all collections (without pagination)
    async getAllCollections(req, res) {
        try {
            const collections = await this.collectionUsecase.getAllCollections();
            
            res.status(200).json({
                success: true,
                message: 'Collections retrieved successfully',
                data: collections,
                count: collections.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving collections',
                error: error.message
            });
        }
    }

    // Get collection by ID
    async getCollectionById(req, res) {
        try {
            const { id } = req.params;
            const collection = await this.collectionUsecase.getCollectionById(id);
            
            if (!collection) {
                return res.status(404).json({
                    success: false,
                    message: 'Collection not found'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Collection retrieved successfully',
                data: collection
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving collection',
                error: error.message
            });
        }
    }

    // Update collection
    async updateCollection(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            const updatedCollection = await this.collectionUsecase.updateCollection(id, updateData);
            
            if (!updatedCollection) {
                return res.status(404).json({
                    success: false,
                    message: 'Collection not found'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Collection updated successfully',
                data: updatedCollection
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating collection',
                error: error.message
            });
        }
    }

    // Delete collection
    async deleteCollection(req, res) {
        try {
            const { id } = req.params;
            const result = await this.collectionUsecase.deleteCollection(id);
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Collection not found'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Collection deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting collection',
                error: error.message
            });
        }
    }
}

export default CollectionMasterController;