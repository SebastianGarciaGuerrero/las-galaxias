import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// PING DE MANTENCIÓN
// Toca la base para que Supabase no la pause por inactividad.
// (Plan free: el proyecto se suspende a los 7 días sin actividad.)
// Lo llama el workflow .github/workflows/keepalive.yml todos los días.
router.get('/', async (req, res) => {
    const start = Date.now();

    const { error } = await supabase
        .from('tournaments')
        .select('id', { count: 'exact', head: true });

    const ms = Date.now() - start;

    if (error) {
        console.error('❌ Health check falló:', error.message);
        return res.status(503).json({ status: 'error', db: 'down', error: error.message, ms });
    }

    res.json({ status: 'ok', db: 'up', ms, checked_at: new Date().toISOString() });
});

export default router;
