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
    const { data, error } = await supabase
        .from('players')
        .select('id, name, photo_url')
        .order('name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// 3. CREAR JUGADOR NUEVO AL VUELO
router.post('/players', async (req, res) => {
    const { name, team_id, tournament_id } = req.body;

    // Verificar si ya existe el jugador
    let { data: existing } = await supabase
        .from('players')
        .select('id')
        .eq('name', name);

    let playerId;

    if (existing && existing.length > 0) {
        playerId = existing[0].id;
    } else {
        // Crear jugador nuevo
        const { data: newPlayer, error } = await supabase
            .from('players')
            .insert([{ name }])
            .select();
        if (error) return res.status(500).json({ error: error.message });
        playerId = newPlayer[0].id;
    }

    // Verificar si ya está en este torneo Y equipo (no solo torneo)
    const { data: existingTp } = await supabase
        .from('tournament_players')
        .select('id')
        .eq('player_id', playerId)
        .eq('tournament_id', tournament_id)
        .eq('team_id', team_id);

    if (existingTp && existingTp.length > 0)
        return res.status(409).json({ error: `${name} ya está registrado en este equipo` });

    // Insertar en tournament_players
    const { error: tpError } = await supabase
        .from('tournament_players')
        .insert([{ player_id: playerId, team_id, tournament_id }]);

    if (tpError) return res.status(500).json({ error: tpError.message });
    res.status(201).json({ id: playerId, name, team_id, tournament_id });
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

    const { data: existing } = await supabase
        .from('matches')
        .select('round')
        .eq('tournament_id', tournament_id)
        .order('round', { ascending: false });

    // Cuenta también los bye_weeks de la jornada actual
    let nextRound = 1;
    if (existing && existing.length > 0) {
        const lastRound = existing[0].round || 1;
        const matchesInLastRound = existing.filter(m => m.round === lastRound).length;

        const { data: byes } = await supabase
            .from('bye_weeks')
            .select('round')
            .eq('tournament_id', tournament_id)
            .eq('round', lastRound);

        const byesInLastRound = byes?.length || 0;
        const totalInLastRound = matchesInLastRound + byesInLastRound;

        // Obtiene cuántos equipos hay en este torneo
        const { data: tournamentTeams } = await supabase
            .from('tournament_teams')
            .select('team_id')
            .eq('tournament_id', tournament_id);

        const totalTeams = tournamentTeams?.length || 8;
        // Partidos por jornada = mitad de equipos (redondeado hacia abajo)
        const matchesPerRound = Math.floor(totalTeams / 2);

        nextRound = totalInLastRound >= matchesPerRound ? lastRound + 1 : lastRound;
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

    const { data, error } = await supabase
        .from('tournament_players')
        .select('*, players(id, name, photo_url), teams(id, name)')
        .eq('tournament_id', tournamentId)
        .order('players(name)');

    if (error) return res.status(500).json({ error: error.message });

    // Normalizar para que el frontend reciba el mismo formato de antes
    const players = data.map(tp => ({
        id: tp.players.id,
        name: tp.players.name,
        photo_url: tp.players.photo_url,
        team_id: tp.team_id,
        teams: tp.teams
    }));

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

// POST registrar descanso
// POST registrar descanso
router.post('/bye', async (req, res) => {
    const { tournament_id, team_id, round } = req.body;
    const { data, error } = await supabase
        .from('bye_weeks')
        .insert([{ tournament_id, team_id, round }])
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
});

// EDITAR BYE EXISTENTE
router.patch('/bye/:id', async (req, res) => {
    const { team_id } = req.body;
    const { data, error } = await supabase
        .from('bye_weeks')
        .update({ team_id })
        .eq('id', req.params.id)
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

router.get('/tournament/:tournamentId/byes', async (req, res) => {
    const { data, error } = await supabase
        .from('bye_weeks')
        .select('id, tournament_id, team_id, round')
        .eq('tournament_id', req.params.tournamentId)
        .order('round', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    const byesWithTeam = await Promise.all(data.map(async (bye) => {
        const { data: team } = await supabase
            .from('teams')
            .select('id, name')
            .eq('id', bye.team_id)
            .single();
        return { ...bye, team };
    }));

    res.json(byesWithTeam);
});

// CAMBIAR ESTADO DE UN TORNEO (active / past / upcoming)
// Se usa para finalizar un torneo manualmente desde el panel de admin.
router.patch('/tournament/:id/status', async (req, res) => {
    const { status } = req.body;
    const allowed = ['active', 'past', 'upcoming'];
    if (!allowed.includes(status)) {
        return res.status(400).json({ error: 'Estado inválido' });
    }
    const { data, error } = await supabase
        .from('tournaments')
        .update({ status })
        .eq('id', req.params.id)
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

// EDITAR PARTIDO (equipos y fecha)
router.patch('/match/:id', async (req, res) => {
    const { home_team_id, away_team_id, match_date } = req.body;
    const { data, error } = await supabase
        .from('matches')
        .update({ home_team_id, away_team_id, match_date })
        .eq('id', req.params.id)
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

export default router;