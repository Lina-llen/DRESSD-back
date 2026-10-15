import express from 'express';
import clothesController from '../Controllers/clothes.controller.js';
import upload from '../Middlewares/upload.middleware.js';

const router = express.Router();

router.get('/', clothesController.getAll);
router.get('/:id', clothesController.getById);
router.post('/', upload.single('photo'), clothesController.create);
router.put('/:id', upload.single('photo'), clothesController.update);
router.patch('/:id/favorite', clothesController.toggleFavorite);
router.delete('/:id', clothesController.remove);

export default router;
