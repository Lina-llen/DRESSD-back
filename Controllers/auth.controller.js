import userModel from '../Models/users.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

async function register(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Tous les champs (email, mot de passe) sont obligatoires !' });
        }

        // Vérifier si l'email existe déjà
        const existingUser = await userModel.getByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Un compte existe déjà avec cette adresse email.' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const result = await userModel.insert({
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: 'Inscription réussie !',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Erreur register:', error);
        res.status(500).json({ error: "Une erreur est survenue lors de l'inscription." });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Identifiants obligatoires.' });
        }

        const user = await userModel.getByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Identifiants incorrects.' });
        }

        const passwordValid = bcrypt.compareSync(password, user.password);
        if (!passwordValid) {
            return res.status(401).json({ error: 'Identifiants incorrects.' });
        }

        // Payload avec id et email
        const token = jwt.sign(
            {
                user: {
                    id: user.id,
                    email: user.email
                }
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Connexion réussie !',
            token,
            user: {
                id: user.id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Erreur login:', error);
        res.status(500).json({ error: 'Une erreur est survenue lors de la connexion.' });
    }
}

async function me(req, res) {
    try {
        const user = await userModel.getById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }
        res.json({ user });
    } catch (error) {
        console.error('Erreur me:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du profil.' });
    }
}

export default {
    register,
    login,
    me
};
