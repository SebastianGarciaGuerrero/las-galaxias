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

// 4. NÓMINAS Y GOLES DE UNA JORNADA
//
// Para el botón de la Liga de los Viernes. Cada jornada se juega en una sola
// noche, así que "los que jugaron ese día" son las nóminas de los equipos que
// salieron a la cancha en esa jornada, y a cada uno se le cuentan los goles que
// hizo en esos partidos. No hay registro de asistencia: la nómina es el plantel
// inscrito, haya ido o no esa noche.
//
// Los goles de un amistoso se cuentan aparte (friendly_goals): se hicieron esa
// noche, pero no entran a la tabla de goleadores y la página lo tiene que decir.
router.get('/:id/rounds/:round/players', async (req, res) => {
    const { id, round } = req.params;

    const { data: partidos, error: errorPartidos } = await supabase
        .from('matches')
        .select('*, home:home_team_id(id, name, logo_url), away:away_team_id(id, name, logo_url)')
        .eq('tournament_id', id)
        .eq('round', round)
        .order('match_date', { ascending: true });

    if (errorPartidos) return res.status(500).json({ error: errorPartidos.message });
    if (!partidos?.length) return res.json({ teams: [] });

    // Los equipos en el orden en que jugaron esa noche
    const equipos = new Map();
    for (const m of partidos) {
        for (const e of [m.home, m.away]) {
            if (e && !equipos.has(e.id)) {
                equipos.set(e.id, { id: e.id, name: e.name, logo_url: e.logo_url, jugadores: new Map() });
            }
        }
    }

    const amistosos = new Set(partidos.filter(m => m.is_friendly).map(m => m.id));

    const [{ data: nominas, error: errorNominas }, { data: goles, error: errorGoles }] = await Promise.all([
        supabase
            .from('tournament_players')
            .select('team_id, players(id, name)')
            .eq('tournament_id', id)
            .in('team_id', [...equipos.keys()]),
        supabase
            .from('goals')
            .select('match_id, player_id, team_id')
            .in('match_id', partidos.map(m => m.id)),
    ]);

    if (errorNominas || errorGoles) {
        console.error("❌ Error en nóminas de la jornada:", errorNominas || errorGoles);
        return res.status(500).json({ error: 'Error cargando las nóminas de la jornada' });
    }

    for (const tp of nominas || []) {
        const equipo = equipos.get(tp.team_id);
        if (!equipo || !tp.players || equipo.jugadores.has(tp.players.id)) continue;
        equipo.jugadores.set(tp.players.id, { id: tp.players.id, name: tp.players.name, goals: 0, friendly_goals: 0 });
    }

    // Un gol de alguien que no está en la nómina de ese equipo igual se
    // muestra: el gol existe. El nombre se busca aparte.
    const sinNomina = new Set();
    for (const g of goles || []) {
        const equipo = equipos.get(g.team_id);
        if (!equipo) continue;
        let jugador = equipo.jugadores.get(g.player_id);
        if (!jugador) {
            jugador = { id: g.player_id, name: null, goals: 0, friendly_goals: 0 };
            equipo.jugadores.set(g.player_id, jugador);
            sinNomina.add(g.player_id);
        }
        jugador.goals += 1;
        if (amistosos.has(g.match_id)) jugador.friendly_goals += 1;
    }

    if (sinNomina.size > 0) {
        const { data: nombres } = await supabase
            .from('players')
            .select('id, name')
            .in('id', [...sinNomina]);
        const porId = new Map((nombres || []).map(p => [p.id, p.name]));
        for (const equipo of equipos.values()) {
            for (const j of equipo.jugadores.values()) {
                if (j.name === null) j.name = porId.get(j.id) || 'Sin nombre';
            }
        }
    }

    // Dentro de cada equipo, primero los que hicieron goles
    const teams = [...equipos.values()].map(({ jugadores, ...equipo }) => ({
        ...equipo,
        players: [...jugadores.values()]
            .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name, 'es')),
    }));

    res.json({ teams });
});

export default router;