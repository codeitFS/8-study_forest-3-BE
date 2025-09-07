import express from 'express';
import * as controller from '../controllers/studiesController.js';

const router = express.Router();

router.post('/studies', controller.create);
router.get('/studies', controller.list);
router.get('/studies/:id', controller.getById);
router.patch('/studies/:id', controller.update);
router.patch('/studies/:id/points', controller.incrementPoints);
router.delete('/studies/:id', controller.remove);

export default router;
