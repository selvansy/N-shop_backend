import express from 'express';
import cartRoutes from "./cartRoutes.js"
import orderRoutes from "./orderRoutes.js"
import producRoutes from '../chit/client/productsRoutes.js'
import sizemasterRoutes from './sizemasterRoutes.js'
import pincodeMasterRoutes from './pincodeMasterRoutes.js'
import collectionRoutes from './collectionRoutes.js'
import stateMaster from './stateMasterRoutes.js'
import stonedetailsRoutes from './stonedetailsRoutes.js'
import ecomSettings from './ecomSettingsRoutes.js'

const router = express.Router()

router.use("/collection",collectionRoutes)
router.use("/cart",cartRoutes)
router.use("/order",orderRoutes)
router.use("/products",producRoutes)
router.use('/size-master',sizemasterRoutes)
router.use('/pincode-master',pincodeMasterRoutes)
router.use('/state-master',stateMaster)
router.use('/stonedetails',stonedetailsRoutes)
router.use('/settings',ecomSettings)

export default router;