import { useState, useEffect, useCallback } from 'react';
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

// Columna de un equipo: su lista de jugadores y el alta rápida del que no
// estaba en la nómina. En los martes las nóminas rotan fecha a fecha, así que
// que aparezca alguien nuevo en la cancha es lo normal, no la excepción.
const ColumnaEquipo = ({ equipo, jugadores, goles, onCambiar, onJugadorNuevo, tournamentId }) => {
    const [nombre, setNombre] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const agregar = async () => {
        const limpio = nombre.trim();
        if (!limpio) return;
        setGuardando(true);
        setError('');
        try {
            const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/league-admin/players`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: limpio, team_id: equipo.id, tournament_id: tournamentId }),
            });
            if (!res.ok) {
                const cuerpo = await res.json().catch(() => ({}));
                throw new Error(cuerpo.error || 'No se pudo agregar');
            }
            setNombre('');
            await onJugadorNuevo();
        } catch (e) {
            setError(e.message);
        } finally {
            setGuardando(false);
        }
    };

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
                    <input
                        type="text"
                        value={nombre}
                        placeholder="¿Jugó alguien más?"
                        onChange={e => setNombre(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregar(); } }}
                        className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                    <button
                        type="button"
                        onClick={agregar}
                        disabled={guardando || !nombre.trim()}
                        className="shrink-0 rounded-lg bg-slate-800 px-3 py-2 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-primary disabled:opacity-30 dark:bg-slate-600"
                    >
                        {guardando ? '...' : 'Sumar'}
                    </button>
                </div>
                {error && <p className="mt-2 text-xs font-bold text-red-500">{error}</p>}
            </div>
        </div>
    );
};

const ResultadoModal = ({ partido, jugadores, tournamentId, onCerrar, onGuardado, onRecargarJugadores }) => {
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
                        />
                        <ColumnaEquipo
                            equipo={partido.away}
                            jugadores={jugadoresVisita}
                            goles={golesVisita}
                            onCambiar={cambiarVisita}
                            onJugadorNuevo={onRecargarJugadores}
                            tournamentId={tournamentId}
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
