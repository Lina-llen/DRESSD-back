import express from 'express';
import tagsController from '../Controllers/tags.controller.js';

const router = express.Router();

router.get('/', tagsController.getAll);
router.post('/', tagsController.create);
router.delete('/:id', tagsController.remove);

export default router;
