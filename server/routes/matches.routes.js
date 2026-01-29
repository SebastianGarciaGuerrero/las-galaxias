import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// GET /api/matches?league_id=...
router.get('/', async (req, res) => {
    const { league_id } = req.query;

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

export default router;