import clothesModel from '../Models/clothes.model.js';
import tagsModel from '../Models/tags.model.js';
import fs from 'fs';
import path from 'path';

async function getAll(req, res) {
    try {
        const filters = {
            category_id: req.query.category_id,
            location_id: req.query.location_id,
            is_favorite: req.query.is_favorite,
            tag_id: req.query.tag_id,
            search: req.query.search
        };

        const clothes = await clothesModel.getAllByUser(req.user.id, filters);
        res.json(clothes);
    } catch (error) {
        console.error('Erreur getAll clothes:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la garde-robe.' });
    }
}

async function getById(req, res) {
    try {
        const clothing = await clothesModel.getById(req.params.id, req.user.id);
        if (!clothing) {
            return res.status(404).json({ error: 'Vêtement introuvable.' });
        }
        res.json(clothing);
    } catch (error) {
        console.error('Erreur getById clothing:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du vêtement.' });
    }
}

async function create(req, res) {
    try {
        const { name, category_id, location_id, is_favorite, tag_ids } = req.body;

        if (!name || !category_id || !location_id) {
            return res.status(400).json({ error: 'Les champs nom, catégorie et localisation sont obligatoires.' });
        }

        // Récupérer le chemin de l'image (soit uploadée via multer, soit URL/chemin fourni)
        let image_path = '';
        if (req.file) {
            image_path = `/uploads/${req.file.filename}`;
        } else if (req.body.image_path) {
            image_path = req.body.image_path;
        }

        const result = await clothesModel.insert({
            user_id: req.user.id,
            category_id: Number(category_id),
            location_id: Number(location_id),
            name: name.trim(),
            image_path,
            is_favorite: is_favorite === 'true' || is_favorite === true || is_favorite === 1
        });

        const clothingId = result.insertId;

        // Association des tags si fournis (ex: [1, 2, 3] ou chaîne JSON)
        let parsedTagIds = [];
        if (tag_ids) {
            parsedTagIds = Array.isArray(tag_ids) ? tag_ids : JSON.parse(tag_ids);
            if (parsedTagIds.length > 0) {
                await tagsModel.setClothingTags(clothingId, parsedTagIds.map(Number));
            }
        }

        const createdClothing = await clothesModel.getById(clothingId, req.user.id);

        res.status(201).json({
            message: 'Vêtement ajouté avec succès à votre garde-robe !',
            clothing: createdClothing
        });
    } catch (error) {
        console.error('Erreur create clothing:', error);
        res.status(500).json({ error: "Erreur lors de l'ajout du vêtement." });
    }
}

async function update(req, res) {
    try {
        const id = req.params.id;
        const { name, category_id, location_id, is_favorite, tag_ids } = req.body;

        const existing = await clothesModel.getById(id, req.user.id);
        if (!existing) {
            return res.status(404).json({ error: 'Vêtement introuvable ou non autorisé.' });
        }

        const updates = {};
        if (name !== undefined) updates.name = name.trim();
        if (category_id !== undefined) updates.category_id = Number(category_id);
        if (location_id !== undefined) updates.location_id = Number(location_id);
        if (is_favorite !== undefined) updates.is_favorite = is_favorite === 'true' || is_favorite === true || is_favorite === 1;

        if (req.file) {
            updates.image_path = `/uploads/${req.file.filename}`;
            // Supprimer l'ancienne image locale si elle existe
            if (existing.image_path && existing.image_path.startsWith('/uploads/')) {
                const oldPath = path.join(process.cwd(), existing.image_path);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        } else if (req.body.image_path !== undefined) {
            updates.image_path = req.body.image_path;
        }

        await clothesModel.update(id, req.user.id, updates);

        if (tag_ids !== undefined) {
            const parsedTagIds = Array.isArray(tag_ids) ? tag_ids : JSON.parse(tag_ids);
            await tagsModel.setClothingTags(id, parsedTagIds.map(Number));
        }

        const updated = await clothesModel.getById(id, req.user.id);
        res.json({
            message: 'Vêtement mis à jour avec succès.',
            clothing: updated
        });
    } catch (error) {
        console.error('Erreur update clothing:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du vêtement.' });
    }
}

async function toggleFavorite(req, res) {
    try {
        const id = req.params.id;
        const result = await clothesModel.toggleFavorite(id, req.user.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Vêtement introuvable ou non autorisé.' });
        }

        const clothing = await clothesModel.getById(id, req.user.id);
        res.json({
            message: 'Statut favori mis à jour.',
            is_favorite: Boolean(clothing.is_favorite)
        });
    } catch (error) {
        console.error('Erreur toggleFavorite clothing:', error);
        res.status(500).json({ error: 'Erreur lors de la modification du favori.' });
    }
}

async function remove(req, res) {
    try {
        const id = req.params.id;
        const existing = await clothesModel.getById(id, req.user.id);
        if (!existing) {
            return res.status(404).json({ error: 'Vêtement introuvable ou non autorisé.' });
        }

        await clothesModel.deleteClothing(id, req.user.id);

        // Nettoyage de l'image physique sur le disque
        if (existing.image_path && existing.image_path.startsWith('/uploads/')) {
            const filePath = path.join(process.cwd(), existing.image_path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        res.json({ message: 'Vêtement supprimé avec succès de votre garde-robe.' });
    } catch (error) {
        console.error('Erreur remove clothing:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du vêtement.' });
    }
}

export default {
    getAll,
    getById,
    create,
    update,
    toggleFavorite,
    remove
};
