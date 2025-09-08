import express from 'express';
import * as controller from '../controllers/habitsController.js';

const router = express.Router();

router.post('/studies/:studyId/habits', controller.create);
router.get('/studies/:studyId/habits', controller.list);
router.get('/studies/:studyId/habits/:id', controller.getById);
router.patch('/studies/:studyId/habits/:id', controller.update);
router.delete('/studies/:studyId/habits/:id', controller.remove);

export default router;
