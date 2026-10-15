import tagModel from '../Models/tags.model.js';

async function getAll(req, res) {
    try {
        const tags = await tagModel.getAllByUser(req.user.id);
        res.json(tags);
    } catch (error) {
        console.error('Erreur getAll tags:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des tags.' });
    }
}

async function create(req, res) {
    try {
        let { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Le nom du tag est obligatoire.' });
        }

        name = name.trim().toLowerCase();
        // Si l'utilisateur a préfixé par un #, on peut le conserver ou le standardiser
        if (!name.startsWith('#')) {
            name = `#${name}`;
        }

        // Vérifier l'existence préalable pour cet utilisateur
        const existing = await tagModel.getByName(name, req.user.id);
        if (existing) {
            return res.status(200).json({
                message: 'Le tag existe déjà.',
                tag: existing
            });
        }

        const result = await tagModel.insert({
            user_id: req.user.id,
            name
        });

        res.status(201).json({
            message: 'Tag créé avec succès.',
            tag: {
                id: result.insertId,
                name
            }
        });
    } catch (error) {
        console.error('Erreur create tag:', error);
        res.status(500).json({ error: 'Erreur lors de la création du tag.' });
    }
}

async function remove(req, res) {
    try {
        const result = await tagModel.deleteTag(req.params.id, req.user.id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tag introuvable ou non autorisé.' });
        }
        res.json({ message: 'Tag supprimé avec succès.' });
    } catch (error) {
        console.error('Erreur remove tag:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du tag.' });
    }
}

export default {
    getAll,
    create,
    remove
};
