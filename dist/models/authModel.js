"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ============================================
// models/authModel.js
// ============================================
const prisma_1 = __importDefault(require("../config/prisma"));
const bcrypt = require('bcrypt');
const createUser = async (nom, email, mot_de_passe) => {
    try {
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
        const user = await prisma_1.default.users.create({
            data: {
                nom,
                email,
                password: hashedPassword,
                prenom: '' // Ajustez selon vos besoins
            }
        });
        return user;
    }
    catch (error) {
        if (error.code === 'P2002') {
            throw new Error('L\'email est déjà utilisé.');
        }
        throw error;
    }
};
const findUserByEmail = async (email) => {
    try {
        const user = await prisma_1.default.users.findUnique({
            where: { email }
        });
        // Retourner un tableau pour compatibilité avec l'ancien code
        return user ? [user] : [];
    }
    catch (error) {
        throw error;
    }
};
module.exports = {
    createUser,
    findUserByEmail
};
