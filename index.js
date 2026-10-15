import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Import des middlewares
import checkToken from './Middlewares/auth.middleware.js';

// Import des routeurs
import authRoutes from './Routes/auth.route.js';
import categoriesRoutes from './Routes/categories.route.js';
import locationsRoutes from './Routes/locations.route.js';
import tagsRoutes from './Routes/tags.route.js';
import clothesRoutes from './Routes/clothes.route.js';
import outfitsRoutes from './Routes/outfits.route.js';

dotenv.config();

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Distribution des fichiers statiques (photos de vêtements uploadées)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Enregistrement des routes
app.use('/auth', authRoutes);
app.use('/categories', categoriesRoutes);
app.use('/locations', checkToken, locationsRoutes);
app.use('/tags', checkToken, tagsRoutes);
app.use('/clothes', checkToken, clothesRoutes);
app.use('/outfits', checkToken, outfitsRoutes);

// Healthcheck de l'API
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        project: 'DRESSD API',
        version: '1.0.0'
    });
});

// Gestionnaire d'erreurs global (Multer, erreurs de parsing, etc.)
app.use((err, req, res, next) => {
    console.error('Erreur API:', err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Une erreur interne est survenue sur le serveur.'
    });
});

const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur DRESSD démarré sur http://127.0.0.1:${PORT}`);
});
