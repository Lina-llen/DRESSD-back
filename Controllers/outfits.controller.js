import outfitsModel from '../Models/outfits.model.js';

async function getAll(req, res) {
    try {
        const filters = {
            is_favorite: req.query.is_favorite,
            search: req.query.search
        };
        const outfits = await outfitsModel.getAllByUser(req.user.id, filters);
        res.json(outfits);
    } catch (error) {
        console.error('Erreur getAll outfits:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des outfits.' });
    }
}

async function getById(req, res) {
    try {
        const outfit = await outfitsModel.getById(req.params.id, req.user.id);
        if (!outfit) {
            return res.status(404).json({ error: 'Outfit introuvable.' });
        }
        res.json(outfit);
    } catch (error) {
        console.error('Erreur getById outfit:', error);
        res.status(500).json({ error: "Erreur lors de la récupération de l'outfit." });
    }
}

async function create(req, res) {
    try {
        const { name, is_favorite, clothing_ids } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Le nom de l'outfit est obligatoire." });
        }

        const validClothingIds = Array.isArray(clothing_ids) ? clothing_ids.map(Number) : [];

        const result = await outfitsModel.insert(
            {
                user_id: req.user.id,
                name: name.trim(),
                is_favorite: is_favorite === 'true' || is_favorite === true || is_favorite === 1
            },
            validClothingIds
        );

        const created = await outfitsModel.getById(result.insertId, req.user.id);
        res.status(201).json({
            message: 'Outfit créé avec succès !',
            outfit: created
        });
    } catch (error) {
        console.error('Erreur create outfit:', error);
        res.status(500).json({ error: "Erreur lors de la création de l'outfit." });
    }
}

async function update(req, res) {
    try {
        const id = req.params.id;
        const { name, is_favorite, clothing_ids } = req.body;

        const existing = await outfitsModel.getById(id, req.user.id);
        if (!existing) {
            return res.status(404).json({ error: 'Outfit introuvable ou non autorisé.' });
        }

        const updates = {};
        if (name !== undefined) updates.name = name.trim();
        if (is_favorite !== undefined) updates.is_favorite = is_favorite === 'true' || is_favorite === true || is_favorite === 1;

        let parsedClothingIds = null;
        if (clothing_ids !== undefined) {
            parsedClothingIds = Array.isArray(clothing_ids) ? clothing_ids.map(Number) : [];
        }

        await outfitsModel.update(id, req.user.id, updates, parsedClothingIds);

        const updated = await outfitsModel.getById(id, req.user.id);
        res.json({
            message: 'Outfit mis à jour avec succès.',
            outfit: updated
        });
    } catch (error) {
        console.error('Erreur update outfit:', error);
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'outfit." });
    }
}

async function toggleFavorite(req, res) {
    try {
        const id = req.params.id;
        const result = await outfitsModel.toggleFavorite(id, req.user.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Outfit introuvable ou non autorisé.' });
        }

        const outfit = await outfitsModel.getById(id, req.user.id);
        res.json({
            message: 'Statut favori mis à jour.',
            is_favorite: Boolean(outfit.is_favorite)
        });
    } catch (error) {
        console.error('Erreur toggleFavorite outfit:', error);
        res.status(500).json({ error: 'Erreur lors de la modification du favori.' });
    }
}

async function remove(req, res) {
    try {
        const id = req.params.id;
        const result = await outfitsModel.deleteOutfit(id, req.user.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Outfit introuvable ou non autorisé.' });
        }
        res.json({ message: 'Outfit supprimé avec succès.' });
    } catch (error) {
        console.error('Erreur remove outfit:', error);
        res.status(500).json({ error: "Erreur lors de la suppression de l'outfit." });
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
