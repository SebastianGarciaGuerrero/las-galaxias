import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// CREAR EQUIPO NUEVO AL VUELO
router.post('/teams', async (req, res) => {
    const { name, short_name, logo_url, bio_title, bio_description } = req.body;

    const { data, error } = await supabase
        .from('teams')
        .insert([{
            name,
            short_name,
            logo_url,
            bio_title,
            bio_description
        }])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
});

// 1. OBTENER EQUIPOS (Ocultamos al Ghost Team para que no salga en las opciones)
router.get('/teams', async (req, res) => {
    const { data, error } = await supabase.from('teams').select('*').neq('name', 'Ghost Team').order('name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// 2. OBTENER TODOS LOS JUGADORES (Para los parches)
router.get('/players', async (req, res) => {
    const { data, error } = await supabase.from('players').select('*, teams(name)').order('name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// 3. CREAR JUGADOR NUEVO AL VUELO
router.post('/players', async (req, res) => {
    const { name, team_id } = req.body;
    const { data, error } = await supabase.from('players').insert([{ name, team_id }]).select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
});

// 4. OBTENER EL FIXTURE DE UNA LIGA
router.get('/tournament/:tournamentId', async (req, res) => {
    const { data, error } = await supabase
        .from('matches')
        .select(`*, home:home_team_id(id, name, logo_url), away:away_team_id(id, name, logo_url)`)
        .eq('tournament_id', req.params.tournamentId)
        .order('match_date', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// 5. PROGRAMAR UN PARTIDO DE LIGA
router.post('/match', async (req, res) => {
    const { tournament_id, home_team_id, away_team_id, match_date, location } = req.body;
    const { data, error } = await supabase
        .from('matches')
        .insert([{ tournament_id, home_team_id, away_team_id, match_date, location, status: 'scheduled' }])
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
});

// 6. GUARDAR RESULTADOS Y GOLEADORES DE LA LIGA
router.post('/match/:id/result', async (req, res) => {
    const matchId = req.params.id;
    const { home_score, away_score, goals } = req.body;
    try {
        const { error: matchError } = await supabase.from('matches').update({ home_score, away_score, status: 'finished' }).eq('id', matchId);
        if (matchError) throw matchError;

        if (goals && goals.length > 0) {
            const goalsToInsert = goals.map(g => ({ match_id: matchId, player_id: g.player_id, team_id: g.team_id }));
            const { error: goalsError } = await supabase.from('goals').insert(goalsToInsert);
            if (goalsError) throw goalsError;
        }
        res.json({ message: 'Resultado guardado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;