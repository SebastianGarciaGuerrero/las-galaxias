import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// 1. OBTENER TODOS LOS TORNEOS (Para la vista de tarjetas)
router.get('/', async (req, res) => {
    console.log("📡 Buscando lista de torneos...");

    const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// 2. OBTENER DETALLE DE UN TORNEO (Tabla y Goleadores)
router.get('/:id/summary', async (req, res) => {
    const { id } = req.params;
    console.log(`📡 Buscando resumen del torneo ID: ${id}`);

    // A. Consultamos la VISTA de posiciones
    const { data: standings, error: errorStandings } = await supabase
        .from('standings')
        .select('*')
        .eq('tournament_id', id)
        .order('points', { ascending: false })
        .order('gd', { ascending: false }); // Desempate por diferencia de goles

    // B. Consultamos la VISTA de goleadores
    const { data: scorers, error: errorScorers } = await supabase
        .from('top_scorers')
        .select('*')
        .eq('tournament_id', id)
        .limit(10); // Traemos el Top 10

    if (errorStandings || errorScorers) {
        console.error("❌ Error en Vistas:", errorStandings || errorScorers);
        return res.status(500).json({ error: 'Error cargando los datos del torneo' });
    }

    // Formateamos los goleadores para el Frontend
    const formattedScorers = (scorers || []).map(p => ({
        id: p.player_id,
        name: p.name,
        team: p.team_name,
        goals: p.goals,
        img: p.photo_url || "https://i.pravatar.cc/150?u=" + p.player_id // Avatar por defecto si no tiene foto
    }));

    res.json({ standings: standings || [], scorers: formattedScorers });
});

export default router;