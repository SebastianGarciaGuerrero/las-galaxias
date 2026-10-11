import { useState, useEffect } from 'react';
import TeamBadge from './TeamBadge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Botón de la Liga de los Viernes que despliega, para la jornada que se está
// viendo, los goleadores de esa noche y las nóminas de los equipos que
// jugaron, cada jugador con los goles que hizo.
//
// No hay registro de asistencia: la nómina es el plantel inscrito del equipo,
// haya ido o no esa noche.
//
// Se pide recién al abrir y se guarda por jornada, así que moverse entre
// jornadas con el panel abierto no vuelve a pedir las que ya se vieron.
const NominasJornada = ({ leagueId, round }) => {
    const [abierto, setAbierto] = useState(false);
    const [porJornada, setPorJornada] = useState({});
    const [jornadaConError, setJornadaConError] = useState(null);

    const equipos = porJornada[round];
    const error = jornadaConError === round;

    useEffect(() => {
        if (!abierto || equipos || error) return;
        let cancelado = false;
        fetch(`${API_URL}/api/leagues/${leagueId}/rounds/${round}/players`)
            .then(res => {
                if (!res.ok) throw new Error('Error del servidor');
                return res.json();
            })
            .then(data => {
                if (!cancelado) setPorJornada(prev => ({ ...prev, [round]: data.teams || [] }));
            })
            .catch(err => {
                console.error("Error cargando las nóminas de la jornada:", err);
                if (!cancelado) setJornadaConError(round);
            });
        return () => { cancelado = true; };
    }, [abierto, equipos, error, leagueId, round]);

    const toggle = () => {
        setAbierto(a => !a);
        setJornadaConError(null); // cerrar y abrir de nuevo es el reintento
    };

    const goleadores = (equipos || [])
        .flatMap(t => t.players.filter(p => p.goals > 0).map(p => ({ ...p, team: t.name })))
        .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name, 'es'));

    return (
        <div className="border-t border-slate-100 dark:border-slate-800">
            <button
                onClick={toggle}
                aria-expanded={abierto}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors"
            >
                <span className="material-symbols-outlined text-base">groups</span>
                Goles y nóminas de la noche
                <span className={`material-symbols-outlined text-base transition-transform duration-300 ${abierto ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            {abierto && (
                <div className="px-4 pb-5 animate-fade-in">
                    {error ? (
                        <p className="py-4 text-center text-sm text-red-500">
                            No se pudieron cargar las nóminas. Cierra y vuelve a abrir para reintentar.
                        </p>
                    ) : !equipos ? (
                        <p className="py-4 text-center text-sm text-slate-500">Cargando nóminas...</p>
                    ) : equipos.length === 0 ? (
                        <p className="py-4 text-center text-sm text-slate-500">No hay equipos cargados para esta jornada.</p>
                    ) : (
                        <>
                            {/* GOLEADORES DE LA NOCHE */}
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                Goleadores de la noche
                            </h4>
                            {goleadores.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {goleadores.map(g => (
                                        <span
                                            key={`${g.team}-${g.id}`}
                                            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs"
                                        >
                                            <span className="font-bold text-slate-900 dark:text-white">{g.name}</span>
                                            <span className="text-[10px] uppercase text-slate-500">{g.team}</span>
                                            <span className="font-black text-primary tabular-nums">{g.goals}</span>
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 mb-6">Todavía no hay goles cargados para esta jornada.</p>
                            )}

                            {/* NÓMINAS: una por equipo, con los goles de cada uno */}
                            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                Nóminas
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {equipos.map(equipo => (
                                    <div key={equipo.id} className="rounded-lg border border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                                            <TeamBadge name={equipo.name} shieldUrl={equipo.logo_url} size={20} />
                                            <span className="flex-1 text-sm font-black text-slate-900 dark:text-white">{equipo.name}</span>
                                            <span className="text-[10px] font-bold uppercase text-slate-400">{equipo.players.length} jug.</span>
                                        </div>
                                        {equipo.players.length > 0 ? (
                                            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {equipo.players.map(p => (
                                                    <li key={p.id} className="flex items-center gap-2 px-3 py-1.5">
                                                        <span className={`flex-1 text-sm ${p.goals > 0 ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                                            {p.name}
                                                            {/* El amistoso no suma a la tabla de
                                                                goleadores: se avisa en amarillo,
                                                                igual que en el partido. */}
                                                            {p.friendly_goals > 0 && (
                                                                <span className="ml-2 text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                                                                    {p.friendly_goals} en amistoso
                                                                </span>
                                                            )}
                                                        </span>
                                                        {p.goals > 0 ? (
                                                            <span className="inline-flex items-center gap-0.5 font-black text-primary tabular-nums">
                                                                <span className="material-symbols-outlined text-sm">sports_soccer</span>
                                                                {p.goals}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-300 dark:text-slate-700">–</span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="px-3 py-2 text-xs text-slate-500">Sin nómina cargada.</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default NominasJornada;
