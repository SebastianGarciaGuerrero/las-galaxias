// Formato de tres etapas (Liga de los Martes 2026).
//
// La liga se juega en tres etapas encadenadas:
//   1. Primera fase: los 8 equipos, todos contra todos, una sola rueda.
//   2. Segunda fase: la tabla se parte al medio. Del 1° al 4° van al Grupo A
//      y del 5° al 8° al Grupo B. Cada grupo juega todos contra todos
//      partiendo de cero y saca un campeón.
//   3. Final: campeón del Grupo A contra campeón del Grupo B. Súper Campeón.
//
// De dónde sale todo esto: cada partido trae una columna `stage` desde la base
// ('fase1', 'grupo_a', 'grupo_b' o 'final'). Los torneos viejos la traen en
// null y por eso siguen mostrando una sola tabla general, como siempre.
//
// Las tablas se calculan acá y no en una vista de Postgres porque son tablas
// por etapa: la vista `standings` suma todos los partidos del torneo y para
// este formato eso mezclaría la primera fase con los grupos.

export const ETAPAS = {
    FASE1: 'fase1',
    GRUPO_A: 'grupo_a',
    GRUPO_B: 'grupo_b',
    FINAL: 'final',
};

// Cuántos clasifican al Grupo A. Los que sobran van al B.
export const CUPOS_GRUPO_A = 4;

// Un torneo usa este formato si alguno de sus partidos declara etapa.
export const tieneFases = (partidos = []) => partidos.some(m => m.stage);

// Los partidos de una etapa, en orden.
export const partidosDeEtapa = (partidos = [], etapa) =>
    partidos.filter(m => m.stage === etapa);

// Nombre corto de la etapa, para las etiquetas del fixture.
export const nombreDeEtapa = (etapa) => ({
    [ETAPAS.FASE1]: 'Primera Fase',
    [ETAPAS.GRUPO_A]: 'Grupo A',
    [ETAPAS.GRUPO_B]: 'Grupo B',
    [ETAPAS.FINAL]: 'Final',
}[etapa] || null);

const filaVacia = (equipo) => ({
    id: equipo.id,
    name: equipo.name,
    // La vista `standings` expone el escudo como shield_url y los partidos
    // como logo_url. Acá se normaliza a shield_url para que TeamBadge y la
    // tarjeta compartible reciban siempre lo mismo.
    shield_url: equipo.logo_url || null,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goals_for: 0,
    goals_against: 0,
    points: 0,
    gd: 0,
});

// Tabla de posiciones de un conjunto de partidos.
//
// Entran todos los equipos que aparezcan en el fixture, hayan jugado o no: así
// los ocho se ven desde la primera fecha en vez de ir apareciendo de a poco.
// Solo suman los partidos terminados.
export const calcularTabla = (partidos = []) => {
    const filas = new Map();

    const registrar = (equipo) => {
        if (!equipo?.id) return null;
        if (!filas.has(equipo.id)) filas.set(equipo.id, filaVacia(equipo));
        return filas.get(equipo.id);
    };

    for (const m of partidos) {
        const local = registrar(m.home);
        const visita = registrar(m.away);
        if (!local || !visita || m.status !== 'finished') continue;

        const golesLocal = m.home_score ?? 0;
        const golesVisita = m.away_score ?? 0;

        local.played++;
        visita.played++;
        local.goals_for += golesLocal;
        local.goals_against += golesVisita;
        visita.goals_for += golesVisita;
        visita.goals_against += golesLocal;

        if (golesLocal > golesVisita) {
            local.won++; local.points += 3; visita.lost++;
        } else if (golesVisita > golesLocal) {
            visita.won++; visita.points += 3; local.lost++;
        } else {
            local.drawn++; visita.drawn++; local.points++; visita.points++;
        }
    }

    return [...filas.values()]
        .map(f => ({ ...f, gd: f.goals_for - f.goals_against }))
        // Puntos, diferencia de gol, goles a favor y, si sigue el empate, orden
        // alfabético para que la tabla no baile entre recargas.
        .sort((a, b) =>
            b.points - a.points ||
            b.gd - a.gd ||
            b.goals_for - a.goals_for ||
            a.name.localeCompare(b.name));
};

// Los cuatro de arriba y los cuatro de abajo de la primera fase.
// Mientras la fase no termine son provisorios: la división real recién queda
// firme cuando se jugaron los 28 partidos.
export const dividirTabla = (tablaFase1 = []) => ({
    grupoA: tablaFase1.slice(0, CUPOS_GRUPO_A),
    grupoB: tablaFase1.slice(CUPOS_GRUPO_A),
});

// Una etapa está cerrada cuando se jugó el todos-contra-todos entero, no solo
// cuando están jugados los partidos que hay cargados. Es la diferencia entre
// "terminó la fase" y "todavía no programaron la fecha que viene": con n
// equipos, una rueda son n·(n-1)/2 partidos.
const rondaCompleta = (partidos) => {
    if (partidos.length === 0) return false;
    if (!partidos.every(m => m.status === 'finished')) return false;
    const equipos = new Set();
    for (const m of partidos) {
        if (m.home?.id) equipos.add(m.home.id);
        if (m.away?.id) equipos.add(m.away.id);
    }
    const n = equipos.size;
    return partidos.length >= (n * (n - 1)) / 2;
};

// Campeón de un grupo: el primero de su tabla, pero solo cuando se jugaron
// todos los partidos del grupo. Antes de eso no hay campeón, hay puntero.
export const campeonDeGrupo = (partidosDelGrupo = []) => {
    if (!rondaCompleta(partidosDelGrupo)) return null;
    return calcularTabla(partidosDelGrupo)[0] || null;
};

// Ganador de la final. Un empate no define campeón: si terminó igualado se
// devuelve null y el sitio lo muestra como pendiente (se define en cancha).
export const ganadorDeFinal = (partidoFinal) => {
    if (!partidoFinal || partidoFinal.status !== 'finished') return null;
    const golesLocal = partidoFinal.home_score ?? 0;
    const golesVisita = partidoFinal.away_score ?? 0;
    if (golesLocal === golesVisita) return null;
    const equipo = golesLocal > golesVisita ? partidoFinal.home : partidoFinal.away;
    return equipo ? filaVacia(equipo) : null;
};

// Radiografía completa del torneo: lo que necesitan la página y la celebración
// del campeón, calculado de una sola pasada.
export const leerFases = (partidos = []) => {
    const fase1 = partidosDeEtapa(partidos, ETAPAS.FASE1);
    const grupoA = partidosDeEtapa(partidos, ETAPAS.GRUPO_A);
    const grupoB = partidosDeEtapa(partidos, ETAPAS.GRUPO_B);
    const finales = partidosDeEtapa(partidos, ETAPAS.FINAL);
    const final = finales[0] || null;

    const tablaFase1 = calcularTabla(fase1);
    const division = dividirTabla(tablaFase1);
    const fase1Terminada = rondaCompleta(fase1);

    // Los grupos pasan por tres momentos y el sitio los dibuja distinto en
    // cada uno:
    //   1. La primera fase sigue en curso -> los cupos van "Por definir",
    //      como en el afiche. Quién va ganando ya se ve en la tabla de la
    //      primera fase, que marca en verde al 1°-4° y en azul al 5°-8°.
    //   2. La primera fase terminó pero el grupo todavía no tiene fixture
    //      -> se muestran los cuatro clasificados, sin números.
    //   3. El grupo ya juega -> su propia tabla, desde cero.
    const armarGrupo = (partidosDelGrupo, clasificados) => ({
        partidos: partidosDelGrupo,
        tabla: partidosDelGrupo.length ? calcularTabla(partidosDelGrupo) : [],
        clasificados: fase1Terminada ? clasificados : [],
        definido: fase1Terminada,
        campeon: campeonDeGrupo(partidosDelGrupo),
    });

    return {
        fase1,
        tablaFase1,
        fase1Terminada,
        grupoA: armarGrupo(grupoA, division.grupoA),
        grupoB: armarGrupo(grupoB, division.grupoB),
        final,
        superCampeon: ganadorDeFinal(final),
    };
};

// En qué etapa está parado el torneo hoy: 1, 2 o 3. Sirve para encender el
// paso que corresponde en la tira de etapas.
export const etapaActual = (fases) => {
    if (fases.final) return 3;
    if (fases.grupoA.partidos.length || fases.grupoB.partidos.length) return 2;
    return 1;
};
