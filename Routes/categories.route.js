import express from 'express';
import categoriesController from '../Controllers/categories.controller.js';

const router = express.Router();

router.get('/', categoriesController.getAll);
router.get('/main', categoriesController.getMain);
router.get('/sub/:parentId', categoriesController.getSubcategories);
router.get('/:id', categoriesController.getById);

export default router;
