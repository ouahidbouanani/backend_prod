import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import transporter from '../config/mailer'; // <-- OK
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();                    

export const register = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { nom, prenom, email, password } = req.body;

        if (!email.endsWith('@treefrog.fr')) {
            return res.status(400).json({ error: 'Email non autorisé.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.users.create({
            data: { nom, prenom, email, password: hashedPassword }
        });

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const mailOptions = {
            from: '"FrogBox" <noreply@frogbox.com>',
            to: email,
            subject: 'Validez votre compte FrogBox',
            html: `
                <p>Bonjour ${prenom},</p>
                <p>Merci de vous être inscrit. Cliquez sur le lien ci-dessous pour valider votre compte :</p>
                <p>
                    <a href="https://frogbox-v2.vercel.app/api/auth/verify-email?token=${token}">
                        Valider mon compte
                    </a>
                </p>
            `
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) return res.status(500).json({ message: 'Erreur envoi email.' });
            res.status(200).json({ message: 'Inscription réussie. Vérifiez votre boîte mail.' });
        });
    } catch (err) {
        console.error('Erreur:', err); // Pour voir l'erreur exacte
        if (err.code === 'P2002') {
            return res.status(400).json({ message: 'Email déjà utilisé.' });
        }
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};
export const verifyEmail = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Token manquant ou invalide.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    const email = decoded.email as string;

    const result = await prisma.users.updateMany({
      where: { email },
      data: { is_verified: true },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    return res.status(200).json({ message: 'Email vérifié avec succès.' });
  } catch (error) {
    console.error('Erreur vérification email :', error);
    return res.status(500).json({ message: 'Erreur lors de la vérification du token.' });
  }
};

export const login = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.users.findUnique({
            where: { email }
        });

        if (!user) return res.status(401).json({ error: 'Email invalide' });

        // ✅ VÉRIFICATION : Email confirmé ?
        if (!user.is_verified) {
            return res.status(403).json({ 
                error: 'Veuillez vérifier votre email avant de vous connecter.',
                message: 'Un email de vérification vous a été envoyé.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Mot de passe invalide' });

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Connexion réussie',
            token,
            user: {
                nom: user.nom,
                prenom: user.prenom,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Erreur login:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
export const protectedRoute = (req: Request, res: Response): Response | void => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Non autorisé' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token invalide' });
        res.json({ message: 'Contenu protégé', user: decoded });
    });
};