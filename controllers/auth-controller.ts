import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🧾 INSCRIPTION (sans envoi d'email, utilisateur vérifié directement)
export const register = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { nom, prenom, email, password } = req.body;

    if (!email.endsWith('@treefrog.fr')) {
      return res.status(400).json({ error: 'Email non autorisé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
  } catch (err: any) {
    console.error('Erreur:', err);
    if (err.code === 'P2002') {
      return res.status(400).json({ message: 'Email déjà utilisé.' });
    }
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// 🔐 (Optionnel) Ancienne route de vérification d'email – plus utilisée maintenant
// Tu peux la supprimer si tu n'as plus de route /api/auth/verify-email côté front
export const verifyEmail = async (req: Request, res: Response): Promise<Response | void> => {
  return res.status(410).json({
    message: 'La vérification par email n’est plus nécessaire. Votre compte est déjà vérifié à la création.',
  });
};

// 🔑 CONNEXION (plus de blocage sur is_verified)
export const login = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) return res.status(401).json({ error: 'Email invalide' });

    // ❌ On enlève complètement ce bloc
    // if (!user.is_verified) {
    //   return res.status(403).json({
    //     error: 'Veuillez vérifier votre email avant de vous connecter.',
    //     message: 'Un email de vérification vous a été envoyé.',
    //   });
    // }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Mot de passe invalide' });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Connexion réussie',
      token,
      user: {
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Erreur login:', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

// 🛡️ ROUTE PROTÉGÉE (inchangée)
export const protectedRoute = (req: Request, res: Response): Response | void => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Non autorisé' });

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Token invalide' });
    return res.json({ message: 'Contenu protégé', user: decoded });
  });
};
