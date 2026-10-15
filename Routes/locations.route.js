import express from 'express';
import locationsController from '../Controllers/locations.controller.js';

const router = express.Router();

router.get('/', locationsController.getAll);
router.get('/:id', locationsController.getById);
router.post('/', locationsController.create);
router.put('/:id', locationsController.update);
router.delete('/:id', locationsController.remove);

export default router;
