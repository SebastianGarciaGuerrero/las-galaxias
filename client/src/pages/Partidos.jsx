import { useState, useEffect } from 'react';

// --- 1. COMPONENTE DE CUENTA REGRESIVA (Reloj) ---
const Countdown = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                d: Math.floor(difference / (1000 * 60 * 60 * 24)),
                h: Math.floor((difference / (1000 * 60 * 60)) % 24),
                m: Math.floor((difference / 1000 / 60) % 60),
            };
        }
        return timeLeft;
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000);
        return () => clearTimeout(timer);
    });

    if (Object.keys(timeLeft).length === 0) {
        return <span className="text-red-500 font-black animate-pulse">¡EN JUEGO!</span>;
    }

    return (
        <div className="flex gap-2 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-sm">timer</span>
            <span>Faltan: <span className="text-primary font-black">{timeLeft.d}d {timeLeft.h}h {timeLeft.m}m</span></span>
        </div>
    );
};

// --- 2. PÁGINA PRINCIPAL ---
const Partidos = () => {
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await fetch(`${API_URL}/api/matches`);
                const data = await res.json();

                const formattedData = data.map(m => {
                    // CAMBIO: Ahora usamos match_date
                    const dateObj = new Date(m.match_date);
                    return {
                        ...m,
                        home: m.is_local ? (m.category === 'seniors' ? 'Galaxias Sr' : 'Galaxias TC') : m.rival,
                        away: m.is_local ? m.rival : (m.category === 'seniors' ? 'Galaxias Sr' : 'Galaxias TC'),
                        dayDisplay: dateObj.getDate(),
                        monthDisplay: dateObj.toLocaleString('es-ES', { month: 'short' }).replace('.', ''),
                        timeDisplay: dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                        fullDate: m.match_date, // CAMBIO: match_date
                        competition: m.competition || (m.category === 'seniors' ? 'Liga Seniors' : 'Campeonato'),
                        // CAMBIO: Adaptamos el status en inglés de la base de datos al español para tu UI
                        statusUI: m.status === 'finished' ? 'Finalizado' : 'Próximo'
                    };
                });
                setMatches(formattedData);
            } catch (error) { console.error("Error:", error); }
            finally { setLoading(false); }
        };
        fetchMatches();
    }, []);

    const seniorsMatches = matches.filter(m => m.category === "seniors");
    const tcMatches = matches.filter(m => m.category === "tc");

    // --- 3. TARJETA DE PARTIDO (MatchCard) ---
    const MatchCard = ({ match }) => (
        <div onClick={() => setSelectedMatch(match)}
            className="cursor-pointer group flex flex-col md:flex-row items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
        >
            {/* ETIQUETA COMPETICIÓN */}
            <div className="absolute top-0 left-0 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase px-3 py-1 rounded-br-lg text-slate-500 tracking-wider">
                {match.competition}
            </div>

            {/* FECHA */}
            <div className="flex md:flex-col items-center gap-2 md:w-24 mb-4 md:mb-0 mt-6 md:mt-0">
                <span className="font-black text-3xl text-slate-300 dark:text-slate-600 uppercase leading-none">{match.dayDisplay}</span>
                <span className="text-xs font-bold uppercase text-primary bg-primary/10 px-2 py-1 rounded">{match.monthDisplay}</span>
            </div>

            {/* ENFRENTAMIENTO */}
            <div className="flex flex-1 w-full justify-between items-center md:px-6">
                <div className="text-right flex-1 truncate px-2">
                    <span className={`font-black uppercase text-lg md:text-xl transition-colors ${match.home.includes('Galaxias') ? 'text-primary' : 'dark:text-white'}`}>
                        {match.home}
                    </span>
                </div>

                <div className="px-2 flex flex-col items-center min-w-[80px]">
                    {match.status === "Finalizado" ? (
                        <div className="flex flex-col items-center">
                            <span className="bg-slate-900 dark:bg-white text-white dark:text-black font-black text-xl px-4 py-1 rounded-lg shadow-lg">
                                {/* CORRECCIÓN GOLES: Si es null muestra 0 */}
                                {match.home_score || 0} - {match.away_score || 0}
                            </span>
                            <span className="text-[10px] font-bold uppercase text-slate-400 mt-1">Finalizado</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <span className="font-bold text-slate-400 text-xl group-hover:scale-125 transition-transform mb-1">VS</span>
                            <span className="text-[10px] font-bold uppercase text-primary border border-primary px-2 rounded-full">Próximo</span>
                        </div>
                    )}
                </div>

                <div className="text-left flex-1 truncate px-2">
                    <span className={`font-black uppercase text-lg md:text-xl transition-colors ${match.away.includes('Galaxias') ? 'text-primary' : 'dark:text-white'}`}>
                        {match.away}
                    </span>
                </div>
            </div>

            {/* INFO EXTRA / TIMER */}
            <div className="md:w-48 text-center md:text-right mt-4 md:mt-0 flex flex-col items-center md:items-end gap-2 pl-4 border-l border-slate-100 dark:border-slate-800">

                {match.status === "Próximo" ? (
                    <>
                        <span className="flex items-center gap-1 text-sm font-bold text-slate-600 dark:text-slate-300">
                            <span className="material-symbols-outlined text-sm">schedule</span> {match.timeDisplay}
                        </span>
                        <Countdown targetDate={match.fullDate} />
                    </>
                ) : (
                    <span className="text-xs font-bold text-slate-400 uppercase">Marcador Final</span>
                )}

                <span className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase text-center md:text-right whitespace-normal break-words leading-tight max-w-[150px]">
                    <span className="material-symbols-outlined text-sm shrink-0">stadium</span>
                    {match.location}
                </span>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-[1280px] mx-auto px-4 py-12 relative min-h-screen">
            <div className="mb-10 border-l-4 border-primary pl-4">
                <h1 className="text-4xl font-black uppercase text-slate-900 dark:text-white">Calendario de Partidos</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Temporada 2026</p>
            </div>

            {loading ? <div className="text-center py-20 text-slate-500">Cargando...</div> : (
                <>
                    {/* SECCIÓN SENIORS */}
                    {seniorsMatches.length > 0 && (
                        <div className="mb-12 animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="bg-slate-900 text-white px-3 py-1 rounded text-sm font-black uppercase tracking-wider">Seniors +35</span>
                                <div className="h-[1px] bg-slate-200 dark:bg-slate-800 flex-1"></div>
                            </div>
                            <div className="grid gap-4">{seniorsMatches.map(m => <MatchCard key={m.id} match={m} />)}</div>
                        </div>
                    )}
                    {/* SECCIÓN TC */}
                    {tcMatches.length > 0 && (
                        <div className="mb-12 animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="bg-primary text-white px-3 py-1 rounded text-sm font-black uppercase tracking-wider">Todo Competidor</span>
                                <div className="h-[1px] bg-slate-200 dark:bg-slate-800 flex-1"></div>
                            </div>
                            <div className="grid gap-4">{tcMatches.map(m => <MatchCard key={m.id} match={m} />)}</div>
                        </div>
                    )}
                    {matches.length === 0 && <div className="text-center py-20">No hay partidos.</div>}
                </>
            )}

            {/* --- 4. MODAL / POPUP DE DETALLE (AQUÍ ESTÁ LO QUE FALTABA) --- */}
            {selectedMatch && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedMatch(null)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-up" onClick={(e) => e.stopPropagation()}>

                        {/* Header del Modal */}
                        <div className="bg-primary p-6 text-white flex justify-between items-start">
                            <div>
                                <span className="text-xs font-black uppercase bg-black/20 px-2 py-1 rounded mb-2 inline-block">{selectedMatch.competition}</span>
                                <h2 className="text-2xl font-black uppercase italic leading-none">{selectedMatch.home} <span className="text-white/70 text-lg">vs</span> {selectedMatch.away}</h2>
                            </div>
                            <button onClick={() => setSelectedMatch(null)} className="p-1 hover:bg-white/20 rounded-full"><span className="material-symbols-outlined">close</span></button>
                        </div>

                        {/* Cuerpo del Modal */}
                        <div className="p-6 space-y-6">

                            {/* Fecha y Hora */}
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary"><span className="material-symbols-outlined">calendar_today</span></div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Fecha</p>
                                        <p className="font-bold dark:text-white">{selectedMatch.dayDisplay} de {selectedMatch.monthDisplay}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-right">
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Hora</p>
                                        <p className="font-bold dark:text-white">{selectedMatch.timeDisplay} hrs</p>
                                    </div>
                                    <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary"><span className="material-symbols-outlined">schedule</span></div>
                                </div>
                            </div>

                            {/* Ubicación y Mapa */}
                            <div>
                                <h3 className="font-black uppercase text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">location_on</span> Ubicación
                                </h3>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <p className="font-bold text-slate-900 dark:text-white mb-1">{selectedMatch.location}</p>
                                    {selectedMatch.address && (
                                        <>
                                            <p className="text-sm text-slate-500 mb-4">{selectedMatch.address}</p>
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedMatch.location + " " + selectedMatch.address)}`}
                                                target="_blank" rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white font-bold py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-red-500">map</span> Ver en Google Maps
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Indicaciones del DT (Solo si existen) */}
                            {selectedMatch.indications && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                                    <p className="text-xs font-black uppercase text-yellow-600 dark:text-yellow-500 mb-1">Indicaciones DT</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{selectedMatch.indications}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Partidos;