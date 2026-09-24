import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// 1. OBTENER TODOS LOS TORNEOS (Para la vista de tarjetas)
router.get('/', async (req, res) => {
    console.log("📡 Buscando lista de torneos...");

    const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// 2. OBTENER DETALLE DE UN TORNEO (Tabla y Goleadores)
router.get('/:id/summary', async (req, res) => {
    const { id } = req.params;
    console.log(`📡 Buscando resumen del torneo ID: ${id}`);

    // A. Consultamos la VISTA de posiciones
    const { data: standings, error: errorStandings } = await supabase
        .from('standings')
        .select('*')
        .eq('tournament_id', id)
        .order('points', { ascending: false })
        .order('gd', { ascending: false }); // Desempate por diferencia de goles

    // B. Consultamos la VISTA de goleadores
    //
    // Se piden todas las filas del torneo: la vista puede devolver al mismo
    // jugador más de una vez —una fila por cada equipo en el que esté
    // inscrito— así que cortar en la base dejaría afuera goleadores de verdad
    // para gastar lugares en filas repetidas. Se juntan acá.
    const { data: scorers, error: errorScorers } = await supabase
        .from('top_scorers')
        .select('*')
        .eq('tournament_id', id)
        .order('goals', { ascending: false });

    if (errorStandings || errorScorers) {
        console.error("❌ Error en Vistas:", errorStandings || errorScorers);
        return res.status(500).json({ error: 'Error cargando los datos del torneo' });
    }

    // Formateamos los goleadores para el Frontend
    //
    // Antes de armar el top hay que juntar al jugador consigo mismo. En la
    // Liga de los Martes las nóminas rotan y alguien puede estar inscrito en
    // dos equipos a la vez (Cristóbal, en Unión Roma y en Isla Fantasía FC):
    // la vista devuelve una fila por equipo y en la página salía dos veces,
    // ocupando dos puestos del podio.
    //
    // Las filas repetidas traen TODAS el mismo número, que es el total del
    // jugador en el torneo, no lo que hizo con cada camiseta. Por eso acá se
    // queda el máximo y no la suma: sumarlas lo mostraría con el doble de
    // goles. El equipo que se muestra es el de la primera fila.
    //
    // Esto es la red de contención. El arreglo de fondo es que la vista deje
    // de repetir: server/sql/top_scorers_sin_duplicados.sql. Corrido ese, acá
    // ya no queda nada que juntar y el equipo que llega es el correcto —aquel
    // con el que hizo más goles— en vez de uno cualquiera de la nómina.
    const porJugador = new Map();
    for (const p of scorers || []) {
        const yaEsta = porJugador.get(p.player_id);
        if (!yaEsta) {
            porJugador.set(p.player_id, {
                id: p.player_id,
                name: p.name,
                team: p.team_name,
                goals: p.goals || 0,
                img: p.photo_url || "https://i.pravatar.cc/150?u=" + p.player_id // Avatar por defecto si no tiene foto
            });
        } else if ((p.goals || 0) > yaEsta.goals) {
            yaEsta.goals = p.goals;
        }
    }

    // Van todos, no el top 10. La página muestra el podio y los primeros
    // puestos, y detrás tiene un "Ver más" que abre la lista completa de los
    // que hicieron algún gol en el torneo; con el corte acá esa lista nunca
    // pasaba de diez. Son pocos cientos de filas en el peor caso y el que
    // comparte el pantallazo sigue llevándose solo los diez primeros.
    const formattedScorers = [...porJugador.values()]
        .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));

    res.json({ standings: standings || [], scorers: formattedScorers });
});

// 3. GET partidos de una liga agrupados por jornada
router.get('/:id/matches', async (req, res) => {
    const { data, error } = await supabase
        .from('matches')
        .select(`*, home:home_team_id(id, name, logo_url), away:away_team_id(id, name, logo_url)`)
        .eq('tournament_id', req.params.id)
        .order('round', { ascending: true })
        .order('match_date', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

router.get('/:id/byes', async (req, res) => {
    const { data, error } = await supabase
        .from('bye_weeks')
        .select('id, tournament_id, team_id, round')
        .eq('tournament_id', req.params.id)
        .order('round', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    // Trae los nombres de los equipos manualmente
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

export default router;