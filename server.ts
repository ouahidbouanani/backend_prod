import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import prisma from './config/prisma';

import authRoutes from './routes/auth.Routes';
import suiviRoutes from './routes/FormsSemiRoutes/suiviRoutes';
import impressionRoutes from './routes/FormsSemiRoutes/impressionRoutes';
import finImpressionRoutes from './routes/FormsSemiRoutes/finImpressionRoutes';
import debutEtchingRoutes from './routes/FormsSemiRoutes/debutEtchingRoutes';
import priseCotesRoute from './routes/FormsSemiRoutes/priseCotesRoute';
import debutTomoRoutes from './routes/FormsSemiRoutes/debutTomoRoutes';
import debutTomoFinisRoute from './routes/FromsFinisRoutes/DebutTomoRoutes';
import finTomoRoutes from './routes/FormsSemiRoutes/finTomoRoutes';
import finTomoFinisRoutes from './routes/FromsFinisRoutes/FinTomoRoutes';
import assemblage from './routes/FromsFinisRoutes/AssemeblageRoute';
import cotesRoutes from './routes/FormsSemiRoutes/cotesRoutes';
import finEtchingRoutes from './routes/FormsSemiRoutes/finEtchingRoutes';
import denominationRoutes from './routes/FormsSemiRoutes/denominationRoutes';
import pieceRoutes from './routes/pieceRoutes';
import systemConfigRoutes from './routes/systemConfigRoutes';
import versionPieceRoutes from './routes/versionPieceRoutes';
import ncRoutes from './routes/FormsSemiRoutes/gestionNcRoutes';
import calendarEventRoutes from './routes/calendarEventRoutes';
import semiFinisAchetesRoutes from './routes/admin/semiFinisAchetesRoutes';
import produitsFinisRoutes from './routes/admin/produitsFinisRoutes'
const app: Application = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins: string[] = [
  'http://localhost:5173',
  'https://frogbox-v2-fd8e.vercel.app',
  'https://frogbox-v2.vercel.app'
];

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/api/impression', impressionRoutes);
app.use('/api/fin-impression', finImpressionRoutes);
app.use('/api/debut-etching', debutEtchingRoutes);
app.use('/api/debut-tomo', debutTomoRoutes);
app.use('/api/fin-tomo', finTomoRoutes);
app.use('/api/fin-tomo-finis', finTomoFinisRoutes);
app.use('/api', priseCotesRoute);
app.use('/api/cotes', cotesRoutes);
app.use('/api/fin-etching', finEtchingRoutes);
app.use('/api/suivi', suiviRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', pieceRoutes);
app.use('/api/assemblage', assemblage);
app.use('/api', ncRoutes);
app.use('/api/debut-tomo-finis', debutTomoFinisRoute);
app.use('/api/denominations', denominationRoutes);
app.use('/api/config', systemConfigRoutes);
app.use('/api/versions', versionPieceRoutes);
app.use('/api', calendarEventRoutes);
// Nouvelles routes
app.use('/api/semi-finis-achetes', semiFinisAchetesRoutes);
app.use('/api/produits-finis', produitsFinisRoutes);

const server = app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 ${signal} reçu, arrêt du serveur...`);

  server.close(async () => {
    console.log('📡 Serveur HTTP fermé');

    try {
      await prisma.$disconnect();
      console.log('🔌 Prisma déconnecté');
      process.exit(0);
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion de Prisma:', error);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('⚠️  Arrêt forcé après timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export default app;
