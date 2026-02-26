import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rutas
import leaguesRoutes from './routes/leagues.routes.js';
import newsRoutes from './routes/news.routes.js';
import matchesRoutes from './routes/matches.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import leagueAdminRoutes from './routes/league_admin.routes.js';

dotenv.config();

const app = express();

// --- Middlewares ---
const allowedOrigins = [
    'http://localhost:5173',
    'https://las-galaxias.vercel.app',
    process.env.FRONTEND_URL // Opcional: URL de Vercel en .env
];

// Configuración CORS
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("🚫 Origen bloqueado por CORS:", origin); // Esto ayuda a depurar en los logs
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true // Importante para cookies/auth si usas
}));

app.use(express.json()); // Para entender JSON

// --- USAR RUTAS ---
app.use('/api/leagues', leaguesRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/league-admin', leagueAdminRoutes); 

// --- ROOT (Para verificar que el server vive) ---
app.get('/', (req, res) => {
    res.send('🚀 API Club Deportivo Las Galaxias funcionando');
});

// --- LISTEN (Configuración para Vercel) ---
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
}

export default app;