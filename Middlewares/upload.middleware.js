import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Création du dossier uploads s'il n'existe pas encore
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage disque
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Nom unique basé sur timestamp + nombre aléatoire + extension d'origine
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `clothing-${uniqueSuffix}${ext}`);
    }
});

// Filtre pour n'accepter que les formats d'image courants
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Format de fichier non supporté. Veuillez envoyer une image (JPEG, PNG, WEBP).'), false);
    }
};

// Limitation de la taille à 5 Mo
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

export default upload;
