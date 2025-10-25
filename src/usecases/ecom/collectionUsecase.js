class CollectionMasterUsecase {
    constructor(collectionRepository) {
        this.collectionRepository = collectionRepository;
    }

    async createCollection(collectionData) {
        try {
            if (!collectionData.name || !collectionData.slug) {
                throw new Error('Name and slug are required fields');
            }

            const existingCollection = await this.collectionRepository.findBySlug(collectionData.slug);
            if (existingCollection) {
                throw new Error('Collection with this slug already exists');
            }

            const collectionToCreate = {
                ...collectionData,
                isActive: collectionData.isActive !== undefined ? collectionData.isActive : true,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            return await this.collectionRepository.create(collectionToCreate);
        } catch (error) {
            throw new Error(`Failed to create collection: ${error.message}`);
        }
    }

    async getAllCollections() {
        try {
            const collections = await this.collectionRepository.findAll();
            return collections;
        } catch (error) {
            throw new Error(`Failed to retrieve collections: ${error.message}`);
        }
    }

    async getCollectionById(id) {
        try {
            if (!id) {
                throw new Error('Collection ID is required');
            }

            const collection = await this.collectionRepository.findById(id);
            return collection;
        } catch (error) {
            throw new Error(`Failed to retrieve collection: ${error.message}`);
        }
    }

    async updateCollection(id, updateData) {
        try {
            if (!id) {
                throw new Error('Collection ID is required');
            }

            const existingCollection = await this.collectionRepository.findById(id);
            if (!existingCollection) {
                return null;
            }

            if (updateData.slug && updateData.slug !== existingCollection.slug) {
                const collectionWithSameSlug = await this.collectionRepository.findBySlug(updateData.slug);
                if (collectionWithSameSlug && collectionWithSameSlug._id.toString() !== id) {
                    throw new Error('Another collection with this slug already exists');
                }
            }

            const dataToUpdate = {
                ...updateData,
                updatedAt: new Date()
            };

            const updatedCollection = await this.collectionRepository.update(id, dataToUpdate);
            return updatedCollection;
        } catch (error) {
            throw new Error(`Failed to update collection: ${error.message}`);
        }
    }

    async deleteCollection(id) {
        try {
            if (!id) {
                throw new Error('Collection ID is required');
            }

            const existingCollection = await this.collectionRepository.findById(id);
            if (!existingCollection) {
                return null;
            }

            const result = await this.collectionRepository.delete(id);
            return result;
        } catch (error) {
            throw new Error(`Failed to delete collection: ${error.message}`);
        }
    }

    async getActiveCollections() {
        try {
            const collections = await this.collectionRepository.findByStatus(true);
            return collections;
        } catch (error) {
            throw new Error(`Failed to retrieve active collections: ${error.message}`);
        }
    }

    async getCollectionBySlug(slug) {
        try {
            if (!slug) {
                throw new Error('Slug is required');
            }

            const collection = await this.collectionRepository.findBySlug(slug);
            return collection;
        } catch (error) {
            throw new Error(`Failed to retrieve collection by slug: ${error.message}`);
        }
    }
}

export default CollectionMasterUsecase;