import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rutas
import leaguesRoutes from './routes/leagues.routes.js';
import newsRoutes from './routes/news.routes.js';
import matchesRoutes from './routes/matches.routes.js';
import uploadRoutes from './routes/upload.routes.js';

dotenv.config();

const app = express();

// --- Middlewares ---
const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL // Opcional: URL de Vercel en .env
];

// Configuración CORS (Usamos solo esta, borramos la duplicada de abajo)
app.use(cors({
    origin: function (origin, callback) {
        // Permitir peticiones sin origen (como Postman) o si está en la lista
        // El "|| true" es un comodín temporal para desarrollo
        if (!origin || allowedOrigins.includes(origin) || true) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

app.use(express.json()); // Para entender JSON

// --- USAR RUTAS ---
app.use('/api/leagues', leaguesRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/upload', uploadRoutes); // Aquí ya se encarga el archivo upload.routes.js de Multer

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