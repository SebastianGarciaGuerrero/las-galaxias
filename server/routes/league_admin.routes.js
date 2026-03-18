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

    // Calcula automáticamente la siguiente jornada del torneo
    // Reemplaza solo esta parte del cálculo:

    // Cuenta cuántos partidos tiene la jornada actual
    const { data: existing } = await supabase
        .from('matches')
        .select('round')
        .eq('tournament_id', tournament_id)
        .order('round', { ascending: false });

    let nextRound = 1;
    if (existing && existing.length > 0) {
        const lastRound = existing[0].round || 1;
        const matchesInLastRound = existing.filter(m => m.round === lastRound).length;
        // Si la jornada actual ya tiene 4 partidos, crea una nueva
        nextRound = matchesInLastRound >= 4 ? lastRound + 1 : lastRound;
    }

    const { data, error } = await supabase
        .from('matches')
        .insert([{ tournament_id, home_team_id, away_team_id, match_date, location, status: 'scheduled', round: nextRound }])
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

// 7. OBTENER JUGADORES DE UN TORNEO (por los equipos participantes)
router.get('/tournament/:tournamentId/players', async (req, res) => {
    const { tournamentId } = req.params;

    // Primero obtenemos los equipos que participan en este torneo
    const { data: matches, error: matchError } = await supabase
        .from('matches')
        .select('home_team_id, away_team_id')
        .eq('tournament_id', tournamentId);

    if (matchError) return res.status(500).json({ error: matchError.message });

    // Extraemos los IDs únicos de equipos
    const teamIds = [...new Set(matches.flatMap(m => [m.home_team_id, m.away_team_id]))];

    if (teamIds.length === 0) return res.json([]);

    // Traemos los jugadores de esos equipos
    const { data: players, error: playersError } = await supabase
        .from('players')
        .select('*, teams(id, name)')
        .in('team_id', teamIds)
        .order('name');

    if (playersError) return res.status(500).json({ error: playersError.message });
    res.json(players);
});

// EDITAR JORNADA DE UN PARTIDO
router.patch('/match/:id/round', async (req, res) => {
    const { round } = req.body;
    const { data, error } = await supabase
        .from('matches')
        .update({ round })
        .eq('id', req.params.id)
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

export default router;