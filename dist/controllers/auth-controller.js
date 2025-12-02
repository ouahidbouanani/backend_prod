"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectedRoute = exports.login = exports.verifyEmail = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// 🧾 INSCRIPTION (sans envoi d'email, utilisateur vérifié directement)
const register = async (req, res) => {
    try {
        const { nom, prenom, email, password } = req.body;
        if (!email.endsWith('@treefrog.fr')) {
            return res.status(400).json({ error: 'Email non autorisé.' });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        await prisma.users.create({
            data: {
                nom,
                prenom,
                email,
                password: hashedPassword,
                // ⚠️ important : on marque directement l'utilisateur comme vérifié
                is_verified: true,
            },
        });
        return res.status(201).json({ message: 'Inscription réussie.' });
    }
    catch (err) {
        console.error('Erreur:', err);
        if (err.code === 'P2002') {
            return res.status(400).json({ message: 'Email déjà utilisé.' });
        }
        return res.status(500).json({ message: 'Erreur serveur.' });
    }
};
exports.register = register;
// 🔐 (Optionnel) Ancienne route de vérification d'email – plus utilisée maintenant
// Tu peux la supprimer si tu n'as plus de route /api/auth/verify-email côté front
const verifyEmail = async (req, res) => {
    return res.status(410).json({
        message: 'La vérification par email n’est plus nécessaire. Votre compte est déjà vérifié à la création.',
    });
};
exports.verifyEmail = verifyEmail;
// 🔑 CONNEXION (plus de blocage sur is_verified)
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.users.findUnique({
            where: { email },
        });
        if (!user)
            return res.status(401).json({ error: 'Email invalide' });
        // ❌ On enlève complètement ce bloc
        // if (!user.is_verified) {
        //   return res.status(403).json({
        //     error: 'Veuillez vérifier votre email avant de vous connecter.',
        //     message: 'Un email de vérification vous a été envoyé.',
        //   });
        // }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ error: 'Mot de passe invalide' });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        return res.status(200).json({
            message: 'Connexion réussie',
            token,
            user: {
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
            },
        });
    }
    catch (err) {
        console.error('Erreur login:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
};
exports.login = login;
// 🛡️ ROUTE PROTÉGÉE (inchangée)
const protectedRoute = (req, res) => {
    const token = req.cookies.token;
    if (!token)
        return res.status(401).json({ error: 'Non autorisé' });
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err)
            return res.status(401).json({ error: 'Token invalide' });
        return res.json({ message: 'Contenu protégé', user: decoded });
    });
};
exports.protectedRoute = protectedRoute;
