import express from 'express';
import outfitsController from '../Controllers/outfits.controller.js';

const router = express.Router();

router.get('/', outfitsController.getAll);
router.get('/:id', outfitsController.getById);
router.post('/', outfitsController.create);
router.put('/:id', outfitsController.update);
router.patch('/:id/favorite', outfitsController.toggleFavorite);
router.delete('/:id', outfitsController.remove);

export default router;
