import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// GET /api/leagues/:id/summary
router.get('/:id/summary', async (req, res) => {
    const { id } = req.params;
    console.log(`📡 Solicitando datos para la liga: ${id}`);

    // 1. Tabla de Posiciones
    const { data: standings, error: errorStandings } = await supabase
        .from('teams')
        .select('*')
        .eq('league_id', id)
        .order('points', { ascending: false });

    // 2. Goleadores (Top 10)
    const { data: scorers, error: errorScorers } = await supabase
        .from('players')
        .select(`*, teams (name)`)
        .eq('teams.league_id', id)
        .order('goals', { ascending: false })
        .limit(10);

    if (errorStandings || errorScorers) {
        console.error("Error Supabase:", errorStandings || errorScorers);
        return res.status(500).json({ error: 'Error fetching data' });
    }

    const formattedScorers = scorers.map(p => ({
        ...p,
        team: p.teams?.name,
        img: p.photo_url || "https://i.pravatar.cc/150?u=" + p.id
    }));

    res.json({ standings, scorers: formattedScorers });
});

export default router;