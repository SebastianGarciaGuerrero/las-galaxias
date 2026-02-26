import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// ==========================================
// OBTENER PARTIDOS PROPIOS DEL CLUB (TC y Seniors)
// ==========================================
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('matches')
        .select('*')
        .not('category', 'is', null) // Solo trae los partidos que tengan categoría (TC o Seniors)
        .order('match_date', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

export default router;