import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import prisma from './config/prisma';
import { createOpenApiSpec } from './config/swagger';

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
import produitsFinisRoutes from './routes/admin/produitsFinisRoutes';
import preAssemblageRoutes from "./routes/admin/preAssemblageRoutes";
import debutpreAssemblageRoutes from "./routes/FromsFinisRoutes/DebutPreAssemblageRoutes";
import finPreassemblageRoutes from "./routes/FromsFinisRoutes/FinPreAssemblageRoutes";
import debutAssemblage from "./routes/FromsFinisRoutes/AssemeblageRoute";
import debutAssemblageRoutes from "./routes/FromsFinisRoutes/DebutAssemblageRoutes";
import finAssemblageRoutes from "./routes/FromsFinisRoutes/FinAssemblageRoutes";
import debutHydroFinisRoutes from "./routes/FromsFinisRoutes/DebutHydroRoutes";
import finHydroFinisRoutes from "./routes/FromsFinisRoutes/FinHydroRoutes";
const app: Application = express();
const PORT = process.env.PORT || 3000;

const swaggerSpec = createOpenApiSpec({
  baseUrl: process.env.SWAGGER_BASE_URL || `http://localhost:${PORT}`,
});

const allowedOrigins: string[] = [
  'http://localhost:5173',
  'https://frogbox-v2-5ugvb5gip-ouahidbouananis-projects.vercel.app',
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

app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

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
app.use('/api/semi-finis-achetes', semiFinisAchetesRoutes);
app.use('/api/produits-finis', produitsFinisRoutes);
app.use("/api/semi-finis-pre-assemblage", preAssemblageRoutes);
app.use("/api/debutpreassemblage", debutpreAssemblageRoutes);
app.use("/api/finpreassemblage", finPreassemblageRoutes);
app.use("/api/debut-assemblage", debutAssemblage);
app.use("/api/debutassemblage", debutAssemblageRoutes);
app.use("/api/finassemblage", finAssemblageRoutes);
app.use("/api/debut-hydro-finis", debutHydroFinisRoutes);
app.use("/api/fin-hydro-finis", finHydroFinisRoutes);

const server = app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
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
