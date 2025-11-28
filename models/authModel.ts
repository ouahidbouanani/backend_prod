// ============================================
// models/authModel.js
// ============================================
import prisma from '../config/prisma';
const bcrypt = require('bcrypt');

const createUser = async (nom, email, mot_de_passe) => {
    try {
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

        const user = await prisma.users.create({
            data: {
                nom,
                email,
                password: hashedPassword,
                prenom: '' // Ajustez selon vos besoins
            }
        });

        return user;
    } catch (error) {
        if (error.code === 'P2002') {
            throw new Error('L\'email est déjà utilisé.');
        }
        throw error;
    }
};

const findUserByEmail = async (email) => {
    try {
        const user = await prisma.users.findUnique({
            where: { email }
        });

        // Retourner un tableau pour compatibilité avec l'ancien code
        return user ? [user] : [];
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createUser,
    findUserByEmail
};