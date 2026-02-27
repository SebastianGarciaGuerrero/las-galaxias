import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// GET (Obtener noticias)
router.get('/', async (req, res) => {
    const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('publish_date', { ascending: false });

    if (error) return res.status(500).json({ error });
    res.json(data);
});

// POST (Crear noticia)
router.post('/', async (req, res) => {
    console.log("\n--- INTENTANDO CREAR NOTICIA ---");
    const { title, summary, content, image_url } = req.body;

    // 1. VALIDACIONES ESTRICTAS
    if (!title) return res.status(400).json({ error: 'El título es obligatorio' });
    if (!content) return res.status(400).json({ error: 'El contenido es obligatorio' });

    // AQUÍ OBLIGAMOS LA FOTO
    if (!image_url || image_url.trim() === '') {
        console.error("❌ ERROR: Se intentó subir noticia sin foto.");
        return res.status(400).json({ error: 'La imagen es OBLIGATORIA para esta noticia.' });
    }

    console.log("✅ Datos válidos. Guardando en Supabase...");

    // 2. INSERTAR EN SUPABASE
    const { data, error } = await supabase
        .from('news')
        .insert([{
            title,
            summary,
            content,
            image_url,
            publish_date: new Date()
        }])
        .select();

    if (error) {
        console.error("❌ Error Supabase:", error.message);
        return res.status(500).json({ error: error.message });
    }

    console.log("🎉 Noticia creada con éxito ID:", data[0]?.id);
    res.status(201).json(data[0]);
});

// DELETE (Borrar noticia)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Eliminado' });
});

// OBTENER UNA SOLA NOTICIA POR SU ID
router.get('/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', req.params.id)
        .single(); // .single() le dice que solo traiga un objeto, no un array

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

export default router;