import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// GET
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true });

    if (error) {
        console.error("❌ Error al obtener partidos:", error.message);
        return res.status(500).json({ error: error.message });
    }

    // Traductor DB -> Frontend
    const formattedData = data.map(match => ({
        id: match.id,
        category: match.category,
        rival: match.rival,
        is_local: match.is_local,
        date: match.match_date,
        location: match.location,
        address: match.address,
        indications: match.dt_notes,
        status: match.status,
        competition: match.competition,
        home_score: match.home_score,
        away_score: match.away_score
    }));

    res.json(formattedData);
});

// POST (Aquí estaba el problema)
router.post('/', async (req, res) => {
    console.log("📥 Recibiendo intento de crear partido...");
    console.log("Datos recibidos:", req.body);

    const { category, rival, is_local, date, location, address, indications, status, competition, home_score, away_score } = req.body;

    const finalDate = date ? new Date(date).toISOString() : null;

    const { data, error } = await supabase
        .from('matches')
        .insert([{
            category, rival, is_local, match_date: finalDate, location, address, dt_notes: indications, status,
            competition, // <--- GUARDAMOS CAMPEONATO
            home_score: status === 'Finalizado' ? home_score : null, // Solo guardamos goles si finalizó
            away_score: status === 'Finalizado' ? away_score : null
        }])
        .select();

    if (error) {
        // ESTO ES LO QUE NECESITAMOS VER
        console.error("❌❌ ERROR CRÍTICO SUPABASE ❌❌");
        console.error("Código:", error.code);
        console.error("Mensaje:", error.message);
        console.error("Detalles:", error.details);
        return res.status(500).json({ error: error.message, details: error.details });
    }

    console.log("✅ Partido creado con éxito ID:", data[0].id);
    res.status(201).json(data[0]);
});

// DELETE
router.delete('/:id', async (req, res) => {
    const { error } = await supabase.from('matches').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Partido eliminado' });
});

export default router;