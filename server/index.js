import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './config/supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Permite que tu React (puerto 5173) hable con este Server (3001)
app.use(express.json()); // Para entender JSON en los POST

// --- RUTAS RÁPIDAS (Idealmente mover a carpeta /routes) ---

// 1. Obtener datos de una Liga (Tabla y Goleadores)
app.get('/api/leagues/:id/summary', async (req, res) => {
    const { id } = req.params;
    console.log(`📡 Solicitando datos para la liga: ${id}`);

    // 1. Tabla de Posiciones
    const { data: standings, error: errorStandings } = await supabase
        .from('teams')
        .select('*')
        .eq('league_id', id)
        .order('points', { ascending: false });

    // 2. Goleadores (Top 10)
    // OJO: Aquí hacemos algo clave. Pedimos los datos del jugador Y el nombre de su equipo
    const { data: scorers, error: errorScorers } = await supabase
        .from('players')
        .select(`
            *,
            teams (name) 
        `)
        .eq('teams.league_id', id) // Esto filtra jugadores por la liga del equipo
        .order('goals', { ascending: false })
        .limit(10);

    if (errorStandings || errorScorers) {
        console.error("Error Supabase:", errorStandings || errorScorers);
        return res.status(500).json({ error: 'Error fetching data' });
    }

    // Formateamos un poco para que el frontend reciba "team: 'Peumos FC'" en vez de un objeto anidado
    const formattedScorers = scorers.map(p => ({
        ...p,
        team: p.teams?.name,
        img: p.photo_url || "https://i.pravatar.cc/150?u=" + p.id // Imagen por defecto si no hay foto
    }));

    res.json({ standings, scorers: formattedScorers });
});

// 2. Obtener Noticias
app.get('/api/news', async (req, res) => {
    const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('publish_date', { ascending: false });

    if (error) return res.status(500).json({ error });
    res.json(data);
});

// 3. Obtener Partidos (Fixture)
app.get('/api/matches', async (req, res) => {
    const { league_id } = req.query; // ?league_id=...

    let query = supabase
        .from('matches')
        .select(`
            *,
            home_team:teams!home_team_id(name, short_name, shield_url),
            away_team:teams!away_team_id(name, short_name, shield_url)
        `)
        .order('match_date', { ascending: true });

    if (league_id) {
        query = query.eq('league_id', league_id);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error });
    res.json(data);
});

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
}

export default app;