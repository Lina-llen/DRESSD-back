import locationModel from '../Models/locations.model.js';

async function getAll(req, res) {
    try {
        const locations = await locationModel.getAllByUser(req.user.id);
        res.json(locations);
    } catch (error) {
        console.error('Erreur getAll locations:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des emplacements.' });
    }
}

async function getById(req, res) {
    try {
        const location = await locationModel.getById(req.params.id, req.user.id);
        if (!location) {
            return res.status(404).json({ error: 'Emplacement introuvable.' });
        }
        res.json(location);
    } catch (error) {
        console.error('Erreur getById location:', error);
        res.status(500).json({ error: "Erreur lors de la récupération de l'emplacement." });
    }
}

async function create(req, res) {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Le nom de l'emplacement est obligatoire." });
        }

        const result = await locationModel.insert({
            user_id: req.user.id,
            name: name.trim()
        });

        res.status(201).json({
            message: 'Emplacement créé avec succès.',
            id: result.insertId,
            name: name.trim()
        });
    } catch (error) {
        console.error('Erreur create location:', error);
        res.status(500).json({ error: "Erreur lors de la création de l'emplacement." });
    }
}

async function update(req, res) {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Le nom de l'emplacement est obligatoire." });
        }

        const result = await locationModel.update(req.params.id, req.user.id, {
            name: name.trim()
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Emplacement introuvable ou non autorisé.' });
        }

        res.json({ message: 'Emplacement mis à jour avec succès.' });
    } catch (error) {
        console.error('Erreur update location:', error);
        res.status(500).json({ error: "Erreur lors de la modification de l'emplacement." });
    }
}

async function remove(req, res) {
    try {
        const result = await locationModel.deleteLocation(req.params.id, req.user.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Emplacement introuvable ou non autorisé.' });
        }

        res.json({ message: 'Emplacement supprimé avec succès.' });
    } catch (error) {
        console.error('Erreur remove location:', error);
        res.status(500).json({ error: "Erreur lors de la suppression de l'emplacement." });
    }
}

export default {
    getAll,
    getById,
    create,
    update,
    remove
};
