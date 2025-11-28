import express from 'express';
const router = express.Router();
import * as controller from '../controllers/systemConfigController';

// Routes activités
router.get('/activites', controller.getAllActivities);
router.post('/activites', controller.createActivity);

// Routes imprimantes
router.get('/imprimantes', controller.getAllPrinters);
router.post('/imprimantes', controller.createPrinter);

export default router;
