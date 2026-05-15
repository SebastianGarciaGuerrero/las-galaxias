import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// ==========================================
// STAGING DE RESULTADOS DESDE APP MOBILE
// ==========================================
// Estas rutas trabajan SOLO contra las tablas:
//   - staging_match_results
//   - staging_match_goals
// No tocan la data oficial (matches, goals) hasta que el admin
// aprueba un registro, momento en el que se hace el "merge".

// ------------------------------------------
// CATÁLOGOS QUE NECESITA LA APP MOBILE
// ------------------------------------------

// Lista los torneos activos (para que la app elija liga)
router.get('/tournaments', async (req, res) => {
    const { data, error } = await supabase
        .from('tournaments')
        .select('id, name, season, category')
        .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Lista los partidos programados de un torneo (los que aún no se cerraron)
router.get('/tournaments/:id/matches', async (req, res) => {
    const { data, error } = await supabase
        .from('matches')
        .select('id, match_date, round, status, home:home_team_id(id, name), away:away_team_id(id, name)')
        .eq('tournament_id', req.params.id)
        .order('match_date', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Lista los jugadores de un torneo separados por equipo (para tap-a-marcar)
router.get('/tournaments/:id/players', async (req, res) => {
    const { data, error } = await supabase
        .from('tournament_players')
        .select('player_id, team_id, players(id, name), teams(id, name)')
        .eq('tournament_id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });

    const players = (data || []).map(tp => ({
        id: tp.players.id,
        name: tp.players.name,
        team_id: tp.team_id,
        team_name: tp.teams?.name,
    }));
    res.json(players);
});

// ------------------------------------------
// APP MOBILE: ENVIAR UN RESULTADO PENDIENTE
// ------------------------------------------
// Body esperado:
//   {
//     match_id: 123,
//     home_score: 2,
//     away_score: 1,
//     device_label: "Tablet cancha 1",
//     goals: [
//        { player_id: 7, team_id: 3, count: 2 },
//        { player_id: 11, team_id: 5, count: 1 }
//     ]
//   }
router.post('/submissions', async (req, res) => {
    const { match_id, home_score, away_score, device_label, goals = [] } = req.body;

    if (!match_id || home_score == null || away_score == null) {
        return res.status(400).json({ error: 'match_id, home_score y away_score son obligatorios' });
    }

    const { data: submission, error: subErr } = await supabase
        .from('staging_match_results')
        .insert([{
            match_id,
            home_score,
            away_score,
            device_label: device_label || 'app-mobile',
            status: 'pending',
        }])
        .select()
        .single();

    if (subErr) return res.status(500).json({ error: subErr.message });

    if (goals.length > 0) {
        const rows = goals
            .filter(g => g.player_id && g.team_id && g.count > 0)
            .map(g => ({
                submission_id: submission.id,
                player_id: g.player_id,
                team_id: g.team_id,
                count: g.count,
            }));

        if (rows.length > 0) {
            const { error: goalsErr } = await supabase
                .from('staging_match_goals')
                .insert(rows);
            if (goalsErr) return res.status(500).json({ error: goalsErr.message });
        }
    }

    res.status(201).json({ id: submission.id, status: submission.status });
});

// ------------------------------------------
// ADMIN: LISTAR PENDIENTES + HISTORIAL
// ------------------------------------------
router.get('/submissions', async (req, res) => {
    const { status } = req.query; // pending | approved | rejected | (vacío = todos)

    let query = supabase
        .from('staging_match_results')
        .select(`
            id, match_id, home_score, away_score, device_label, status,
            created_at, reviewed_at, review_notes,
            match:match_id(
                id, match_date, round, status,
                home:home_team_id(id, name),
                away:away_team_id(id, name),
                tournament:tournament_id(id, name, season)
            )
        `)
        .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const ids = (data || []).map(s => s.id);
    let goalsBySubmission = {};
    if (ids.length > 0) {
        const { data: goalsData, error: gErr } = await supabase
            .from('staging_match_goals')
            .select('id, submission_id, player_id, team_id, count, players(id, name), teams(id, name)')
            .in('submission_id', ids);
        if (gErr) return res.status(500).json({ error: gErr.message });

        goalsBySubmission = (goalsData || []).reduce((acc, g) => {
            (acc[g.submission_id] ||= []).push({
                id: g.id,
                player_id: g.player_id,
                player_name: g.players?.name,
                team_id: g.team_id,
                team_name: g.teams?.name,
                count: g.count,
            });
            return acc;
        }, {});
    }

    res.json((data || []).map(s => ({ ...s, goals: goalsBySubmission[s.id] || [] })));
});

// ------------------------------------------
// ADMIN: EDITAR UNA SUBMISSION (antes de aprobar)
// ------------------------------------------
// Permite corregir score y/o goleadores sin tocar aún la tabla oficial.
router.patch('/submissions/:id', async (req, res) => {
    const { home_score, away_score, goals, review_notes } = req.body;

    const updates = {};
    if (home_score != null) updates.home_score = home_score;
    if (away_score != null) updates.away_score = away_score;
    if (review_notes !== undefined) updates.review_notes = review_notes;

    if (Object.keys(updates).length > 0) {
        const { error } = await supabase
            .from('staging_match_results')
            .update(updates)
            .eq('id', req.params.id);
        if (error) return res.status(500).json({ error: error.message });
    }

    if (Array.isArray(goals)) {
        // Reemplazo total del detalle de goles
        const { error: delErr } = await supabase
            .from('staging_match_goals')
            .delete()
            .eq('submission_id', req.params.id);
        if (delErr) return res.status(500).json({ error: delErr.message });

        const rows = goals
            .filter(g => g.player_id && g.team_id && g.count > 0)
            .map(g => ({
                submission_id: Number(req.params.id),
                player_id: g.player_id,
                team_id: g.team_id,
                count: g.count,
            }));

        if (rows.length > 0) {
            const { error: insErr } = await supabase
                .from('staging_match_goals')
                .insert(rows);
            if (insErr) return res.status(500).json({ error: insErr.message });
        }
    }

    res.json({ ok: true });
});

// ------------------------------------------
// ADMIN: APROBAR -> ESCRIBE EN matches + goals
// ------------------------------------------
router.post('/submissions/:id/approve', async (req, res) => {
    try {
        const { data: sub, error: subErr } = await supabase
            .from('staging_match_results')
            .select('*')
            .eq('id', req.params.id)
            .single();
        if (subErr) throw subErr;
        if (!sub) return res.status(404).json({ error: 'No existe la submission' });
        if (sub.status !== 'pending') {
            return res.status(409).json({ error: `La submission ya fue ${sub.status}` });
        }

        const { data: goalsData, error: gErr } = await supabase
            .from('staging_match_goals')
            .select('player_id, team_id, count')
            .eq('submission_id', sub.id);
        if (gErr) throw gErr;

        // 1) Marcar partido oficial como finalizado con el marcador aprobado
        const { error: matchErr } = await supabase
            .from('matches')
            .update({
                home_score: sub.home_score,
                away_score: sub.away_score,
                status: 'finished',
            })
            .eq('id', sub.match_id);
        if (matchErr) throw matchErr;

        // 2) Borrar goles previos del partido (si re-aprueban) e insertar los nuevos
        const { error: delGoalsErr } = await supabase
            .from('goals')
            .delete()
            .eq('match_id', sub.match_id);
        if (delGoalsErr) throw delGoalsErr;

        const rows = [];
        (goalsData || []).forEach(g => {
            for (let i = 0; i < g.count; i++) {
                rows.push({
                    match_id: sub.match_id,
                    player_id: g.player_id,
                    team_id: g.team_id,
                });
            }
        });
        if (rows.length > 0) {
            const { error: insGoalsErr } = await supabase.from('goals').insert(rows);
            if (insGoalsErr) throw insGoalsErr;
        }

        // 3) Marcar staging como aprobado
        const { error: updErr } = await supabase
            .from('staging_match_results')
            .update({ status: 'approved', reviewed_at: new Date().toISOString() })
            .eq('id', sub.id);
        if (updErr) throw updErr;

        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ------------------------------------------
// ADMIN: RECHAZAR
// ------------------------------------------
router.post('/submissions/:id/reject', async (req, res) => {
    const { review_notes } = req.body;
    const { error } = await supabase
        .from('staging_match_results')
        .update({
            status: 'rejected',
            reviewed_at: new Date().toISOString(),
            review_notes: review_notes || null,
        })
        .eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
});

export default router;
