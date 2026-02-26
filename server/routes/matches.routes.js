import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// ==========================================
// 1. UTILIDADES (Para los selectores del Admin)
// ==========================================

// Obtener todos los equipos
router.get('/teams', async (req, res) => {
    const { data, error } = await supabase.from('teams').select('*').order('name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Obtener jugadores de un equipo específico (Para seleccionar quién hizo el gol)
router.get('/teams/:teamId/players', async (req, res) => {
    const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', req.params.teamId)
        .order('name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// ==========================================
// 2. GESTIÓN DE PARTIDOS
// ==========================================

router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('matches')
        .select('*')
        .not('category', 'is', null) // La clave: Solo trae los partidos que tengan categoría (TC o Seniors)
        .order('match_date', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});
// Obtener todos los partidos de un Torneo específico
router.get('/tournament/:tournamentId', async (req, res) => {
    const { data, error } = await supabase
        .from('matches')
        .select(`
            *,
            home:home_team_id(id, name, logo_url),
            away:away_team_id(id, name, logo_url)
        `)
        .eq('tournament_id', req.params.tournamentId)
        .order('match_date', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Crear un nuevo partido (Programar fixture)
router.post('/', async (req, res) => {
    const { tournament_id, home_team_id, away_team_id, match_date, location } = req.body;

    const { data, error } = await supabase
        .from('matches')
        .insert([{
            tournament_id,
            home_team_id,
            away_team_id,
            match_date,
            location,
            status: 'scheduled'
        }])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
});

// ==========================================
// 3. GUARDAR EL RESULTADO Y GOLEADORES (¡La ruta maestra!)
// ==========================================
router.post('/:id/result', async (req, res) => {
    const matchId = req.params.id;
    const { home_score, away_score, goals } = req.body;

    /* Nota: 'goals' será un array de objetos desde el frontend: 
       [ { player_id: 1, team_id: 2 }, { player_id: 4, team_id: 2 } ]
    */

    try {
        // A. Actualizar el marcador del partido y ponerlo como finalizado
        const { error: matchError } = await supabase
            .from('matches')
            .update({
                home_score: home_score,
                away_score: away_score,
                status: 'finished'
            })
            .eq('id', matchId);

        if (matchError) throw matchError;

        // B. Insertar los goles en la tabla 'goals' (si es que hubo goles)
        if (goals && goals.length > 0) {
            const goalsToInsert = goals.map(g => ({
                match_id: matchId,
                player_id: g.player_id,
                team_id: g.team_id
            }));

            const { error: goalsError } = await supabase
                .from('goals')
                .insert(goalsToInsert);

            if (goalsError) throw goalsError;
        }

        res.json({ message: '✅ Resultado y goleadores guardados con éxito' });
    } catch (error) {
        console.error("❌ Error guardando resultado:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;