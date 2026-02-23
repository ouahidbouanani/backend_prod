"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const prisma_1 = __importDefault(require("./config/prisma"));
const swagger_1 = require("./config/swagger");
const auth_Routes_1 = __importDefault(require("./routes/auth.Routes"));
const suiviRoutes_1 = __importDefault(require("./routes/FormsSemiRoutes/suiviRoutes"));
const impressionRoutes_1 = __importDefault(require("./routes/FormsSemiRoutes/impressionRoutes"));
const finImpressionRoutes_1 = __importDefault(require("./routes/FormsSemiRoutes/finImpressionRoutes"));
const debutEtchingRoutes_1 = __importDefault(require("./routes/FormsSemiRoutes/debutEtchingRoutes"));
const priseCotesRoute_1 = __importDefault(require("./routes/FormsSemiRoutes/priseCotesRoute"));
const debutTomoRoutes_1 = __importDefault(require("./routes/FormsSemiRoutes/debutTomoRoutes"));
const DebutTomoRoutes_1 = __importDefault(require("./routes/FromsFinisRoutes/DebutTomoRoutes"));
const finTomoRoutes_1 = __importDefault(require("./routes/FormsSemiRoutes/finTomoRoutes"));
const FinTomoRoutes_1 = __importDefault(require("./routes/FromsFinisRoutes/FinTomoRoutes"));
const AssemeblageRoute_1 = __importDefault(require("./routes/FromsFinisRoutes/AssemeblageRoute"));
const cotesRoutes_1 = __importDefault(require("./routes/FormsSemiRoutes/cotesRoutes"));
const finEtchingRoutes_1 = __importDefault(require("./routes/FormsSemiRoutes/finEtchingRoutes"));
const denominationRoutes_1 = __importDefault(require("./routes/FormsSemiRoutes/denominationRoutes"));
const pieceRoutes_1 = __importDefault(require("./routes/pieceRoutes"));
const systemConfigRoutes_1 = __importDefault(require("./routes/systemConfigRoutes"));
const versionPieceRoutes_1 = __importDefault(require("./routes/versionPieceRoutes"));
const gestionNcRoutes_1 = __importDefault(require("./routes/FormsSemiRoutes/gestionNcRoutes"));
const calendarEventRoutes_1 = __importDefault(require("./routes/calendarEventRoutes"));
const semiFinisAchetesRoutes_1 = __importDefault(require("./routes/admin/semiFinisAchetesRoutes"));
const produitsFinisRoutes_1 = __importDefault(require("./routes/admin/produitsFinisRoutes"));
const preAssemblageRoutes_1 = __importDefault(require("./routes/admin/preAssemblageRoutes"));
const DebutPreAssemblageRoutes_1 = __importDefault(require("./routes/FromsFinisRoutes/DebutPreAssemblageRoutes"));
const FinPreAssemblageRoutes_1 = __importDefault(require("./routes/FromsFinisRoutes/FinPreAssemblageRoutes"));
const AssemeblageRoute_2 = __importDefault(require("./routes/FromsFinisRoutes/AssemeblageRoute"));
const DebutAssemblageRoutes_1 = __importDefault(require("./routes/FromsFinisRoutes/DebutAssemblageRoutes"));
const FinAssemblageRoutes_1 = __importDefault(require("./routes/FromsFinisRoutes/FinAssemblageRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const swaggerSpec = (0, swagger_1.createOpenApiSpec)({
    baseUrl: process.env.SWAGGER_BASE_URL || `http://localhost:${PORT}`,
});
const allowedOrigins = [
    'http://localhost:5173',
    'https://frogbox-v2-5ugvb5gip-ouahidbouananis-projects.vercel.app',
    'https://frogbox-v2.vercel.app'
];
const corsOptions = {
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(body_parser_1.default.json());
app.use((0, cookie_parser_1.default)());
app.get('/api-docs.json', (req, res) => {
    res.json(swaggerSpec);
});
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, { explorer: true }));
app.use('/api/impression', impressionRoutes_1.default);
app.use('/api/fin-impression', finImpressionRoutes_1.default);
app.use('/api/debut-etching', debutEtchingRoutes_1.default);
app.use('/api/debut-tomo', debutTomoRoutes_1.default);
app.use('/api/fin-tomo', finTomoRoutes_1.default);
app.use('/api/fin-tomo-finis', FinTomoRoutes_1.default);
app.use('/api', priseCotesRoute_1.default);
app.use('/api/cotes', cotesRoutes_1.default);
app.use('/api/fin-etching', finEtchingRoutes_1.default);
app.use('/api/suivi', suiviRoutes_1.default);
app.use('/api/auth', auth_Routes_1.default);
app.use('/api', pieceRoutes_1.default);
app.use('/api/assemblage', AssemeblageRoute_1.default);
app.use('/api', gestionNcRoutes_1.default);
app.use('/api/debut-tomo-finis', DebutTomoRoutes_1.default);
app.use('/api/denominations', denominationRoutes_1.default);
app.use('/api/config', systemConfigRoutes_1.default);
app.use('/api/versions', versionPieceRoutes_1.default);
app.use('/api', calendarEventRoutes_1.default);
app.use('/api/semi-finis-achetes', semiFinisAchetesRoutes_1.default);
app.use('/api/produits-finis', produitsFinisRoutes_1.default);
app.use("/api/semi-finis-pre-assemblage", preAssemblageRoutes_1.default);
app.use("/api/debutpreassemblage", DebutPreAssemblageRoutes_1.default);
app.use("/api/finpreassemblage", FinPreAssemblageRoutes_1.default);
app.use("/api/debut-assemblage", AssemeblageRoute_2.default);
app.use("/api/debutassemblage", DebutAssemblageRoutes_1.default);
app.use("/api/finassemblage", FinAssemblageRoutes_1.default);
const server = app.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur le port ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
});
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 ${signal} reçu, arrêt du serveur...`);
    server.close(async () => {
        console.log('📡 Serveur HTTP fermé');
        try {
            await prisma_1.default.$disconnect();
            console.log('🔌 Prisma déconnecté');
            process.exit(0);
        }
        catch (error) {
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
exports.default = app;
