import express from 'express'
import Collectioncontroller from "../../controllers/ecom/collectionMasterController.js"
import CollectionUsecase from '../../../usecases/ecom/collectionUsecase.js'
import CollectionRepository from '../../../infrastructure/repositories/ecom/collectionMasterRepository.js'

const router = express.Router();

const repo = new CollectionRepository();
const usecases = new CollectionUsecase(repo);
const controller = new Collectioncontroller(usecases);

router.post('/', (req, res) => controller.createCollection(req, res));
router.get('/', (req, res) => controller.getAllCollections(req, res));
router.get('/:id', (req, res) => controller.getCollectionById(req, res));
router.patch('/:id', (req, res) => controller.updateCollection(req, res));
router.delete('/:id', (req, res) => controller.deleteCollection(req, res));

export default router;