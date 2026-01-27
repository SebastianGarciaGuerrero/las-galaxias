import { useState } from 'react';

const Partidos = () => {
    const [selectedMatch, setSelectedMatch] = useState(null);

    // Base de datos de partidos con categorías
    const matches = [
        // --- SENIORS (+35) ---
        {
            id: 1,
            category: "seniors",
            home: "Galaxias Sr",
            away: "Viejos Cracks",
            date: "28 Oct",
            time: "21:30",
            status: "Próximo",
            stadium: "Cancha 3, Complejo Deportivo",
            address: "Av. El Deporte 1234, Comuna",
            indications: "Entrada por el estacionamiento norte. Camarín 4.",
            competition: "Liga Senior"
        },
        {
            id: 2,
            category: "seniors",
            home: "Unión Veteranos",
            away: "Galaxias Sr",
            date: "04 Nov",
            time: "20:00",
            status: "Próximo",
            stadium: "Estadio Municipal",
            address: "Calle Principal 500, Centro",
            indications: "Llevar camiseta alternativa (Blanca).",
            competition: "Copa Amistad"
        },
        // --- TODO COMPETIDOR ---
        {
            id: 3,
            category: "tc",
            home: "Galaxias TC",
            away: "Huracán FC",
            date: "29 Oct",
            time: "10:00",
            status: "Próximo",
            stadium: "Estadio Galáctico",
            address: "Calle La Luna 88, Barrio Alto",
            indications: "Partido clave por el liderato. Llegar 45 min antes.",
            competition: "SuperLiga Viernes"
        },
        {
            id: 4,
            category: "tc",
            home: "Dep. Cosmos",
            away: "Galaxias TC",
            date: "21 Oct",
            score: "3 - 1",
            status: "Finalizado",
            stadium: "Arena Lunar",
            address: "Sector Industrial, Lote 4",
            indications: "",
            competition: "SuperLiga Viernes"
        },
    ];

    // Filtramos por categoría
    const seniorsMatches = matches.filter(m => m.category === "seniors");
    const tcMatches = matches.filter(m => m.category === "tc");

    // Componente reutilizable para la tarjeta del partido (Para no repetir código)
    const MatchCard = ({ match }) => (
        <div
            onClick={() => setSelectedMatch(match)}
            className="cursor-pointer group flex flex-col md:flex-row items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary hover:shadow-md hover:-translate-y-1 transition-all duration-300"
        >
            {/* Date Info */}
            <div className="flex md:flex-col items-center gap-2 md:w-24 mb-4 md:mb-0">
                <span className="font-black text-2xl text-slate-300 dark:text-slate-600 uppercase">{match.date.split(" ")[0]}</span>
                <span className="text-xs font-bold uppercase text-primary bg-primary/10 px-2 py-1 rounded">{match.date.split(" ")[1]}</span>
            </div>

            {/* Matchup */}
            <div className="flex flex-1 w-full justify-between items-center md:px-10">
                <div className="text-right flex-1">
                    <span className="font-black uppercase text-lg md:text-xl dark:text-white group-hover:text-primary transition-colors">{match.home}</span>
                </div>

                <div className="px-6 flex flex-col items-center">
                    {match.status === "Finalizado" ? (
                        <span className="bg-slate-900 dark:bg-white text-white dark:text-black font-black text-xl px-4 py-2 rounded-lg">{match.score}</span>
                    ) : (
                        <span className="font-bold text-slate-400 text-xl group-hover:scale-125 transition-transform">VS</span>
                    )}
                </div>

                <div className="text-left flex-1">
                    <span className="font-black uppercase text-lg md:text-xl dark:text-white group-hover:text-primary transition-colors">{match.away}</span>
                </div>
            </div>

            {/* Meta Info */}
            <div className="md:w-40 text-center md:text-right mt-4 md:mt-0 flex flex-col items-center md:items-end gap-1">
                {match.status === "Próximo" && (
                    <span className="flex items-center gap-1 text-sm font-bold text-slate-600 dark:text-slate-300">
                        <span className="material-symbols-outlined text-sm">schedule</span> {match.time}
                    </span>
                )}
                <span className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase">
                    <span className="material-symbols-outlined text-sm">stadium</span> {match.stadium}
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${match.status === 'Finalizado' ? 'border-slate-200 text-slate-400' : 'border-primary text-primary'}`}>
                    {match.status}
                </span>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-[1280px] mx-auto px-4 py-12 relative">

            {/* Header General */}
            <div className="mb-10 border-l-4 border-primary pl-4">
                <h1 className="text-4xl font-black uppercase text-slate-900 dark:text-white">Calendario de Partidos</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Temporada 2023-2024</p>
            </div>

            {/* SECCIÓN SENIORS */}
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                    <span className="bg-slate-900 text-white px-3 py-1 rounded text-sm font-black uppercase tracking-wider">Seniors +35</span>
                    <div className="h-[1px] bg-slate-200 dark:bg-slate-800 flex-1"></div>
                </div>
                <div className="grid gap-4">
                    {seniorsMatches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                </div>
            </div>

            {/* SECCIÓN TODO COMPETIDOR */}
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                    <span className="bg-primary text-white px-3 py-1 rounded text-sm font-black uppercase tracking-wider">Todo Competidor</span>
                    <div className="h-[1px] bg-slate-200 dark:bg-slate-800 flex-1"></div>
                </div>
                <div className="grid gap-4">
                    {tcMatches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                </div>
            </div>

            {/* MODAL / POPUP DE DETALLE */}
            {selectedMatch && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
                    onClick={() => setSelectedMatch(null)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-up"
                        onClick={(e) => e.stopPropagation()} // Evita que se cierre al hacer click dentro
                    >
                        {/* Header del Modal */}
                        <div className="bg-primary p-6 text-white flex justify-between items-start">
                            <div>
                                <span className="text-xs font-black uppercase bg-black/20 px-2 py-1 rounded mb-2 inline-block">
                                    {selectedMatch.competition}
                                </span>
                                <h2 className="text-2xl font-black uppercase italic leading-none">
                                    {selectedMatch.home} <span className="text-white/70 text-lg">vs</span> {selectedMatch.away}
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedMatch(null)}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Contenido del Modal */}
                        <div className="p-6 space-y-6">

                            {/* Info Principal */}
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined">calendar_today</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Fecha</p>
                                        <p className="font-bold dark:text-white">{selectedMatch.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-right">
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Hora</p>
                                        <p className="font-bold dark:text-white">{selectedMatch.time} hrs</p>
                                    </div>
                                    <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined">schedule</span>
                                    </div>
                                </div>
                            </div>

                            {/* Ubicación y Mapa */}
                            <div>
                                <h3 className="font-black uppercase text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">location_on</span> Ubicación
                                </h3>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <p className="font-bold text-slate-900 dark:text-white mb-1">{selectedMatch.stadium}</p>
                                    <p className="text-sm text-slate-500 mb-4">{selectedMatch.address}</p>

                                    {/* Botón dinámico a Google Maps */}
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedMatch.stadium + " " + selectedMatch.address)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white font-bold py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-red-500">map</span> Ver en Google Maps
                                    </a>
                                </div>
                            </div>

                            {/* Indicaciones Extra */}
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