import categoryModel from '../Models/categories.model.js';

async function getAll(req, res) {
    try {
        if (req.query.tree === 'true') {
            const tree = await categoryModel.getTree();
            return res.json(tree);
        }
        const categories = await categoryModel.getAll();
        res.json(categories);
    } catch (error) {
        console.error('Erreur getAll categories:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des catégories.' });
    }
}

async function getMain(req, res) {
    try {
        const main = await categoryModel.getMainCategories();
        res.json(main);
    } catch (error) {
        console.error('Erreur getMain categories:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des catégories principales.' });
    }
}

async function getSubcategories(req, res) {
    try {
        const parentId = req.params.parentId;
        const subs = await categoryModel.getSubcategories(parentId);
        res.json(subs);
    } catch (error) {
        console.error('Erreur getSubcategories:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des sous-catégories.' });
    }
}

async function getById(req, res) {
    try {
        const id = req.params.id;
        const category = await categoryModel.getById(id);
        if (!category) {
            return res.status(404).json({ error: 'Catégorie introuvable.' });
        }
        res.json(category);
    } catch (error) {
        console.error('Erreur getById category:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la catégorie.' });
    }
}

export default {
    getAll,
    getMain,
    getSubcategories,
    getById
};
