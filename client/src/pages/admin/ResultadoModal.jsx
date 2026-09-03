import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiFetch } from '../../config/api';

// Formulario para anotar el resultado de un partido y quién hizo los goles.
//
// Vive en su propio archivo y no adentro de LeagueManager por una razón
// concreta: cuando un componente se define dentro de otro, cada render del
// padre crea una función nueva, React la trata como un componente distinto y
// desmonta y vuelve a montar todo lo que hay adentro. Eso es lo que hacía que
// al sumarle un gol a alguien la lista se rearmara entera y el scroll saltara
// al principio. Con los equipos de los martes, que llegan a diez jugadores,
// era insoportable.

// Fila de un jugador. También va acá afuera, por lo mismo de arriba.
const FilaJugador = ({ jugador, goles, onCambiar }) => {
    const cantidad = goles[jugador.id] || 0;

    return (
        <div className={`flex items-center justify-between gap-2 rounded-lg py-2 pl-3 pr-2 transition-colors ${
            cantidad > 0 ? 'bg-primary/5' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'
        }`}>
            <span className="flex-1 truncate text-sm font-bold text-slate-800 dark:text-white">
                {jugador.name}
            </span>
            <div className="flex shrink-0 items-center gap-1.5">
                <button
                    type="button"
                    onClick={() => onCambiar(jugador.id, -1)}
                    disabled={cantidad === 0}
                    aria-label={`Quitarle un gol a ${jugador.name}`}
                    className="flex size-8 items-center justify-center rounded-full bg-slate-200 text-lg font-black leading-none text-slate-700 transition-colors hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-slate-200 disabled:hover:text-slate-700 dark:bg-slate-600 dark:text-white dark:disabled:hover:bg-slate-600"
                >
                    −
                </button>
                <span className={`w-7 text-center text-lg font-black tabular-nums ${
                    cantidad > 0 ? 'text-primary' : 'text-slate-300 dark:text-slate-600'
                }`}>
                    {cantidad}
                </span>
                <button
                    type="button"
                    onClick={() => onCambiar(jugador.id, 1)}
                    aria-label={`Sumarle un gol a ${jugador.name}`}
                    className="flex size-8 items-center justify-center rounded-full bg-slate-200 text-lg font-black leading-none text-slate-700 transition-colors hover:bg-primary hover:text-white dark:bg-slate-600 dark:text-white"
                >
                    +
                </button>
            </div>
        </div>
    );
};

// Para comparar nombres escritos a mano contra los de la base: sin tildes, sin
// mayúsculas y sin espacios de sobra. "cristobal", "Cristóbal" y " CRISTOBAL "
// tienen que ser la misma persona.
const normalizar = (texto) => (texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

// Columna de un equipo: su lista de jugadores y el alta rápida del que no
// estaba en la nómina. En los martes las nóminas rotan fecha a fecha, así que
// que aparezca alguien nuevo en la cancha es lo normal, no la excepción.
//
// El alta va con buscador y no con un campo de texto pelado. Escribir el
// nombre a ciegas es lo que venía partiendo el historial de la gente: si en la
// base decía "Cristobal" y en la cancha se anotaba "cristóbal", se creaba un
// jugador nuevo y los goles quedaban repartidos entre dos personas que en
// realidad eran una. Ahora, a medida que se escribe, van saliendo los que ya
// están en la base y se elige de ahí; crear a alguien nuevo sigue siendo
// posible, pero es una decisión explícita y no un accidente de tipeo.
const ColumnaEquipo = ({ equipo, jugadores, goles, onCambiar, onJugadorNuevo, tournamentId, todosLosJugadores, jugadoresDelTorneo }) => {
    const [nombre, setNombre] = useState('');
    // El jugador que se eligió de la lista. Mientras esté puesto, el alta viaja
    // con su id y el nombre escrito deja de importar.
    const [elegido, setElegido] = useState(null);
    const [abierto, setAbierto] = useState(false);
    const [resaltado, setResaltado] = useState(-1);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const buscado = normalizar(nombre);

    // Los que ya están en la columna no se sugieren: están a la vista arriba.
    const yaEnLaColumna = useMemo(() => new Set(jugadores.map(j => j.id)), [jugadores]);

    // Con qué equipos de esta misma liga ya juega cada uno. Es el dato que
    // sirve para distinguir dos apodos parecidos sin salir del formulario.
    const equiposPorJugador = useMemo(() => {
        const mapa = new Map();
        for (const j of jugadoresDelTorneo || []) {
            if (!j.teams?.name) continue;
            const nombres = mapa.get(j.id) || [];
            if (!nombres.includes(j.teams.name)) nombres.push(j.teams.name);
            mapa.set(j.id, nombres);
        }
        return mapa;
    }, [jugadoresDelTorneo]);

    // Primero los que empiezan con lo escrito y después los que lo tienen en el
    // medio, que es el orden en que uno los busca. Ocho alcanzan: si hay más,
    // conviene escribir una letra más que ponerse a scrollear.
    const sugerencias = useMemo(() => {
        if (!buscado) return [];
        const encontrados = [];
        for (const p of todosLosJugadores || []) {
            if (yaEnLaColumna.has(p.id)) continue;
            const donde = normalizar(p.name).indexOf(buscado);
            if (donde === -1) continue;
            encontrados.push({ jugador: p, empiezaAsi: donde === 0 });
        }
        encontrados.sort((a, b) =>
            (a.empiezaAsi === b.empiezaAsi ? 0 : a.empiezaAsi ? -1 : 1) ||
            a.jugador.name.localeCompare(b.jugador.name, 'es')
        );
        return encontrados.slice(0, 8).map(e => e.jugador);
    }, [buscado, todosLosJugadores, yaEnLaColumna]);

    // Si lo escrito es tal cual el nombre de alguien de la base, se da por
    // elegido aunque no lo hayan tocado en la lista. Es el caso de siempre:
    // se escribe el nombre completo y se aprieta enter.
    //
    // Salvo que haya más de uno que dé lo mismo, que hoy pasa de verdad: en la
    // base conviven "Cristobal" y "Cristóbal", y "Seba bob" y "Sebabob". Ahí
    // el formulario no elige por su cuenta ni ofrece crear un tercero: pide
    // que se diga cuál de los dos es.
    const exactos = useMemo(
        () => (buscado ? (todosLosJugadores || []).filter(p => normalizar(p.name) === buscado) : []),
        [buscado, todosLosJugadores]
    );
    const exacto = exactos.length === 1 ? exactos[0] : null;
    const ambiguo = !elegido && exactos.length > 1;

    const jugadorAUsar = elegido || exacto || null;
    const yaEstaEnLaColumna = jugadorAUsar ? yaEnLaColumna.has(jugadorAUsar.id) : false;
    const seVaACrear = Boolean(buscado) && !jugadorAUsar && !ambiguo;

    // Las opciones de la lista: los que ya existen y, al final, la de crearlo.
    const opciones = useMemo(() => {
        const filas = sugerencias.map(j => ({ tipo: 'existente', jugador: j }));
        if (buscado && !exacto && !ambiguo) filas.push({ tipo: 'nuevo' });
        return filas;
    }, [sugerencias, buscado, exacto, ambiguo]);

    const escribir = (valor) => {
        setNombre(valor);
        setElegido(null);
        setResaltado(-1);
        setAbierto(true);
        setError('');
    };

    const elegirOpcion = (opcion) => {
        if (!opcion) return;
        if (opcion.tipo === 'existente') {
            setElegido(opcion.jugador);
            setNombre(opcion.jugador.name);
        } else {
            setElegido(null);
        }
        setResaltado(-1);
        setAbierto(false);
    };

    const enTecla = (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            if (!opciones.length) return;
            e.preventDefault();
            setAbierto(true);
            setResaltado(prev => {
                const paso = e.key === 'ArrowDown' ? 1 : -1;
                const siguiente = prev + paso;
                if (siguiente < 0) return opciones.length - 1;
                if (siguiente >= opciones.length) return 0;
                return siguiente;
            });
            return;
        }
        if (e.key === 'Escape') {
            setAbierto(false);
            setResaltado(-1);
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            // Enter con una opción marcada la elige; recién el siguiente enter
            // la suma. Así nunca se agrega a alguien de un teclazo.
            if (abierto && resaltado >= 0) elegirOpcion(opciones[resaltado]);
            else agregar();
        }
    };

    const agregar = async () => {
        const limpio = nombre.trim();
        if (!limpio) return;
        if (ambiguo) {
            setError('Hay más de uno con ese nombre. Elegí cuál de la lista.');
            return;
        }
        if (yaEstaEnLaColumna) {
            setError(`${jugadorAUsar.name} ya está en la lista de arriba`);
            return;
        }
        setGuardando(true);
        setError('');
        try {
            const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/league-admin/players`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // Con player_id el backend no tiene que adivinar por nombre.
                    player_id: jugadorAUsar?.id ?? null,
                    name: jugadorAUsar?.name ?? limpio,
                    team_id: equipo.id,
                    tournament_id: tournamentId,
                }),
            });
            if (!res.ok) {
                const cuerpo = await res.json().catch(() => ({}));
                throw new Error(cuerpo.error || 'No se pudo agregar');
            }
            setNombre('');
            setElegido(null);
            setAbierto(false);
            setResaltado(-1);
            await onJugadorNuevo();
        } catch (e) {
            setError(e.message);
        } finally {
            setGuardando(false);
        }
    };

    const idLista = `sugerencias-${equipo?.id}`;

    return (
        <div className="flex min-h-0 flex-col rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
            <h4 className="shrink-0 border-b border-slate-200 px-4 py-3 text-center font-black uppercase text-slate-900 dark:border-slate-700 dark:text-white">
                {equipo?.name}
            </h4>

            {/* El scroll es de esta lista y no de la ventana entera: así el
                resto del formulario queda quieto mientras se cargan los goles. */}
            <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
                {jugadores.length === 0 ? (
                    <p className="py-4 text-center text-sm text-slate-400">Sin jugadores inscritos</p>
                ) : (
                    jugadores.map(j => (
                        <FilaJugador key={j.id} jugador={j} goles={goles} onCambiar={onCambiar} />
                    ))
                )}
            </div>

            <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-700">
                <div className="flex gap-2">
                    <div className="relative min-w-0 flex-1">
                        <input
                            type="text"
                            value={nombre}
                            placeholder="¿Jugó alguien más?"
                            role="combobox"
                            aria-expanded={abierto && opciones.length > 0}
                            aria-controls={idLista}
                            aria-autocomplete="list"
                            aria-activedescendant={resaltado >= 0 ? `${idLista}-${resaltado}` : undefined}
                            autoComplete="off"
                            onChange={e => escribir(e.target.value)}
                            onFocus={() => { if (nombre.trim()) setAbierto(true); }}
                            onBlur={() => setAbierto(false)}
                            onKeyDown={enTecla}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />

                        {/* La lista se abre hacia arriba: el campo vive abajo de
                            todo y hacia abajo se saldría de la ventana.
                            onMouseDown con preventDefault para que el clic no
                            dispare el blur del input antes de tiempo. */}
                        {abierto && opciones.length > 0 && (
                            <ul
                                id={idLista}
                                role="listbox"
                                onMouseDown={e => e.preventDefault()}
                                className="absolute bottom-full left-0 z-20 mb-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-600 dark:bg-slate-800"
                            >
                                {opciones.map((opcion, i) => {
                                    const marcada = i === resaltado;
                                    const claseFila = `w-full cursor-pointer px-3 py-2 text-left text-sm ${
                                        marcada ? 'bg-primary/10' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`;

                                    if (opcion.tipo === 'nuevo') {
                                        return (
                                            <li
                                                key="nuevo"
                                                id={`${idLista}-${i}`}
                                                role="option"
                                                aria-selected={marcada}
                                                onClick={() => elegirOpcion(opcion)}
                                                onMouseEnter={() => setResaltado(i)}
                                                className={`${claseFila} border-t border-slate-100 dark:border-slate-700`}
                                            >
                                                <span className="font-bold text-slate-500 dark:text-slate-400">
                                                    Crear a &laquo;{nombre.trim()}&raquo; como jugador nuevo
                                                </span>
                                            </li>
                                        );
                                    }

                                    const equiposDelJugador = equiposPorJugador.get(opcion.jugador.id) || [];
                                    return (
                                        <li
                                            key={opcion.jugador.id}
                                            id={`${idLista}-${i}`}
                                            role="option"
                                            aria-selected={marcada}
                                            onClick={() => elegirOpcion(opcion)}
                                            onMouseEnter={() => setResaltado(i)}
                                            className={claseFila}
                                        >
                                            <span className="block font-bold text-slate-900 dark:text-white">
                                                {opcion.jugador.name}
                                            </span>
                                            <span className="block text-xs text-slate-400">
                                                {equiposDelJugador.length > 0
                                                    ? `En esta liga juega en ${equiposDelJugador.join(' y ')}`
                                                    : 'Todavía no juega esta liga'}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={agregar}
                        disabled={guardando || !nombre.trim() || ambiguo || yaEstaEnLaColumna}
                        className="shrink-0 rounded-lg bg-slate-800 px-3 py-2 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-primary disabled:opacity-30 dark:bg-slate-600"
                    >
                        {guardando ? '...' : seVaACrear ? 'Crear' : 'Sumar'}
                    </button>
                </div>

                {/* Que quede dicho, antes de apretar, si esto suma a alguien que
                    ya existe o si crea a una persona nueva en la base. */}
                {!error && jugadorAUsar && !yaEstaEnLaColumna && (
                    <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                        Se suma a {jugadorAUsar.name}, el que ya está en la base
                    </p>
                )}
                {!error && jugadorAUsar && yaEstaEnLaColumna && (
                    <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                        {jugadorAUsar.name} ya está en la lista de arriba
                    </p>
                )}
                {!error && ambiguo && (
                    <p className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-500">
                        Hay {exactos.length} jugadores con ese nombre: elegí de la lista cuál es
                    </p>
                )}
                {!error && seVaACrear && (
                    <p className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-500">
                        No hay nadie con ese nombre: se va a crear un jugador nuevo
                    </p>
                )}
                {error && <p className="mt-2 text-xs font-bold text-red-500">{error}</p>}
            </div>
        </div>
    );
};

const ResultadoModal = ({ partido, jugadores, todosLosJugadores, tournamentId, onCerrar, onGuardado, onRecargarJugadores }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const [golesLocal, setGolesLocal] = useState({});
    const [golesVisita, setGolesVisita] = useState({});
    const [cargando, setCargando] = useState(partido.status === 'finished');
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const jugadoresLocal = jugadores.filter(j => j.team_id === partido.home_team_id);
    const jugadoresVisita = jugadores.filter(j => j.team_id === partido.away_team_id);

    // Al corregir un partido ya cargado, el formulario abre con los goles que
    // tiene puestos. Antes abría en cero y guardar volvía a sumarlos.
    useEffect(() => {
        if (partido.status !== 'finished') return;
        let vigente = true;
        (async () => {
            try {
                const res = await apiFetch(`${API_URL}/api/league-admin/match/${partido.id}/goals`);
                if (!res.ok) throw new Error('No se pudieron leer los goles');
                const filas = await res.json();
                if (!vigente) return;
                const local = {}, visita = {};
                for (const fila of filas) {
                    if (fila.team_id === partido.home_team_id) local[fila.player_id] = fila.count;
                    else visita[fila.player_id] = fila.count;
                }
                setGolesLocal(local);
                setGolesVisita(visita);
            } catch (e) {
                if (vigente) setError(e.message);
            } finally {
                if (vigente) setCargando(false);
            }
        })();
        return () => { vigente = false; };
    }, [partido.id, partido.status, partido.home_team_id, API_URL]);

    const marcadorLocal = Object.values(golesLocal).reduce((a, b) => a + b, 0);
    const marcadorVisita = Object.values(golesVisita).reduce((a, b) => a + b, 0);

    // useCallback para que la identidad no cambie en cada render y las filas no
    // se vuelvan a montar al tocar un botón.
    const cambiarLocal = useCallback((jugadorId, delta) => {
        setGolesLocal(prev => ({ ...prev, [jugadorId]: Math.max(0, (prev[jugadorId] || 0) + delta) }));
    }, []);
    const cambiarVisita = useCallback((jugadorId, delta) => {
        setGolesVisita(prev => ({ ...prev, [jugadorId]: Math.max(0, (prev[jugadorId] || 0) + delta) }));
    }, []);

    const guardar = async (e) => {
        e.preventDefault();
        setGuardando(true);
        setError('');

        const goles = [];
        const acumular = (mapa, teamId) => {
            for (const [playerId, cantidad] of Object.entries(mapa)) {
                for (let i = 0; i < cantidad; i++) goles.push({ player_id: playerId, team_id: teamId });
            }
        };
        acumular(golesLocal, partido.home_team_id);
        acumular(golesVisita, partido.away_team_id);

        try {
            const res = await apiFetch(`${API_URL}/api/league-admin/match/${partido.id}/result`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ home_score: marcadorLocal, away_score: marcadorVisita, goals: goles }),
            });
            if (!res.ok) throw new Error('El servidor rechazó el resultado');
            onGuardado();
        } catch (e) {
            setError(e.message);
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <form
                onSubmit={guardar}
                className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
                {/* Marcador en vivo */}
                <div className="shrink-0 border-b border-slate-100 px-6 pb-4 pt-6 text-center dark:border-slate-800">
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-primary">
                        {partido.status === 'finished' ? 'Corregir resultado' : 'Anotar resultado'}
                    </span>
                    <div className="mt-4 flex items-center justify-center gap-4 md:gap-6">
                        <span className="max-w-[140px] truncate text-lg font-black text-slate-900 dark:text-white">
                            {partido.home?.name}
                        </span>
                        <div className="min-w-[110px] rounded-xl bg-slate-900 px-5 py-2 text-center text-3xl font-black tabular-nums text-white dark:bg-white dark:text-slate-900">
                            {marcadorLocal} - {marcadorVisita}
                        </div>
                        <span className="max-w-[140px] truncate text-lg font-black text-slate-900 dark:text-white">
                            {partido.away?.name}
                        </span>
                    </div>
                    <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                        El marcador se arma solo con los goles que le cargues a cada jugador
                    </p>
                </div>

                {cargando ? (
                    <p className="flex-1 py-16 text-center font-bold text-slate-400">Cargando los goles ya anotados...</p>
                ) : (
                    <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 md:grid-cols-2 md:overflow-hidden md:p-6">
                        <ColumnaEquipo
                            equipo={partido.home}
                            jugadores={jugadoresLocal}
                            goles={golesLocal}
                            onCambiar={cambiarLocal}
                            onJugadorNuevo={onRecargarJugadores}
                            tournamentId={tournamentId}
                            todosLosJugadores={todosLosJugadores}
                            jugadoresDelTorneo={jugadores}
                        />
                        <ColumnaEquipo
                            equipo={partido.away}
                            jugadores={jugadoresVisita}
                            goles={golesVisita}
                            onCambiar={cambiarVisita}
                            onJugadorNuevo={onRecargarJugadores}
                            tournamentId={tournamentId}
                            todosLosJugadores={todosLosJugadores}
                            jugadoresDelTorneo={jugadores}
                        />
                    </div>
                )}

                <div className="shrink-0 border-t border-slate-100 p-4 dark:border-slate-800 md:px-6">
                    {error && <p className="mb-3 text-center text-sm font-bold text-red-500">{error}</p>}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onCerrar}
                            className="flex-1 rounded-xl bg-slate-200 py-3.5 font-bold uppercase tracking-wider text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-800 dark:text-white"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={guardando || cargando}
                            className="flex-1 rounded-xl bg-primary py-3.5 font-black uppercase tracking-wider text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            {guardando ? 'Guardando...' : 'Guardar resultado'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ResultadoModal;
