import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

function checkToken(req, res, next) {
    const headers = req.headers['authorization'];
    const token = headers && headers.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Accès non autorisé : token manquant' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide ou expiré' });
        }
        // Injection de l'utilisateur décodé dans la requête pour isoler les données par req.user.id
        req.user = decoded.user;
        next();
    });
}

export default checkToken;
