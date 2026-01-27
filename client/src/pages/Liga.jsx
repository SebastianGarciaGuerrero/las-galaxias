import { useState, useEffect } from 'react';

// 👇 ASEGÚRATE DE QUE ESTE ID SEA EL QUE COPIASTE DE SUPABASE
const MARTES_LEAGUE_ID = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22';

const Liga = () => {
    const [selectedLeague, setSelectedLeague] = useState(null); // 'martes' | 'viernes'
    const [loading, setLoading] = useState(false);
    const [leagueData, setLeagueData] = useState(null);
    const [showAllScorers, setShowAllScorers] = useState(false); // Estado para el botón "Ver más"

    // Función para obtener datos del backend
    // Función para obtener datos del backend
    const fetchLeagueData = async (leagueId) => {
        setLoading(true);
        try {
            // 👇 MAGIA AQUÍ:
            // Si existe la variable de Vercel, usa esa. Si no, usa localhost (para cuando trabajas en tu PC).
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            console.log("Conectando a:", API_URL); // Esto te ayudará a ver en consola a dónde está yendo

            // Usamos la variable API_URL en lugar de escribir la dirección fija
            const response = await fetch(`${API_URL}/api/leagues/${leagueId}/summary`);

            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            const data = await response.json();
            setLeagueData(data);
        } catch (error) {
            console.error("Error cargando la liga:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedLeague === 'martes') {
            fetchLeagueData(MARTES_LEAGUE_ID);
        }
    }, [selectedLeague]);

    const handleBack = () => {
        setSelectedLeague(null);
        setLeagueData(null);
        setShowAllScorers(false); // Resetear el botón al salir
    };

    // --- LÓGICA DE GOLEADORES ---
    const scorers = leagueData?.scorers || [];
    const paddedScorers = [...scorers];
    // Rellenamos el podio con datos vacíos si hay menos de 3 jugadores para no romper el diseño
    while (paddedScorers.length < 3) {
        paddedScorers.push({ id: `placeholder-${paddedScorers.length}`, name: '---', team: '---', goals: 0, img: null });
    }

    const firstPlace = paddedScorers[0];
    const secondPlace = paddedScorers[1];
    const thirdPlace = paddedScorers[2];

    // Lógica para la lista lateral (Del 4to lugar en adelante)
    const allRestScorers = scorers.slice(3);
    // Si showAllScorers es true mostramos todos, si no, solo los primeros 7
    const visibleScorers = showAllScorers ? allRestScorers : allRestScorers.slice(0, 7);


    // --- 1. VISTA DE SELECCIÓN ---
    if (!selectedLeague) {
        return (
            <div className="w-full max-w-[1280px] mx-auto px-4 py-20 animate-fade-in">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black uppercase text-slate-900 dark:text-white mb-4">Selecciona tu Competición</h1>
                    <p className="text-slate-500 dark:text-slate-400">Elige la liga para ver tablas, resultados y estadísticas.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Card Martes */}
                    <button
                        onClick={() => setSelectedLeague('martes')}
                        className="group relative h-80 w-full overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-primary transition-all duration-300 text-left shadow-lg"
                    >
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                        <div className="relative z-10 flex h-full flex-col justify-end p-8">
                            <span className="mb-2 inline-block rounded bg-primary px-3 py-1 text-xs font-black uppercase tracking-widest text-white">
                                Liga de los Martes
                            </span>
                            <h2 className="text-3xl font-black uppercase text-white">Bosque Esclerófilo</h2>
                            <p className="mt-2 text-sm text-slate-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                Ver tabla de posiciones oficial.
                            </p>
                        </div>
                    </button>

                    {/* Card Viernes */}
                    <button
                        onClick={() => setSelectedLeague('viernes')}
                        className="group relative h-80 w-full overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-primary transition-all duration-300 text-left shadow-lg grayscale hover:grayscale-0"
                    >
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                        <div className="relative z-10 flex h-full flex-col justify-end p-8">
                            <span className="mb-2 inline-block rounded bg-white text-slate-900 px-3 py-1 text-xs font-black uppercase tracking-widest">
                                Liga de los Viernes
                            </span>
                            <h2 className="text-3xl font-black uppercase text-white">SuperLiga</h2>
                            <p className="mt-2 text-sm text-slate-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                Próximamente...
                            </p>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    // --- 2. VISTA DE CARGA ---
    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    // --- 3. VISTA DE DETALLE (TABLA + GOLEADORES) ---
    return (
        <div className="w-full max-w-[1280px] mx-auto px-4 py-8 animate-fade-in">

            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-primary font-black uppercase tracking-widest text-xs">Liga Oficial</span>
                    </div>
                    <h1 className="text-4xl font-black uppercase text-slate-900 dark:text-white leading-none">
                        {selectedLeague === 'martes' ? 'Bosque Esclerófilo' : 'SuperLiga'}
                    </h1>
                </div>
                <button onClick={handleBack} className="flex items-center gap-2 text-sm font-bold uppercase text-slate-500 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span> Volver
                </button>
            </div>

            {!leagueData ? (
                <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 text-red-600 rounded-lg text-center">
                    <p className="font-bold">Error al cargar datos.</p>
                    <p className="text-sm">Asegúrate de que el servidor esté corriendo en el puerto 3001.</p>
                </div>
            ) : (
                <>
                    {/* TABLA DE POSICIONES */}
                    <div className="mb-16">
                        <h3 className="text-2xl font-black uppercase text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">table_chart</span> Tabla General
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-900 dark:bg-black border-b border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4">Pos</th>
                                        <th className="px-6 py-4">Equipo</th>
                                        <th className="px-6 py-4 text-center text-white font-black">PTS</th>
                                        <th className="px-6 py-4 text-center">PJ</th>
                                        <th className="px-6 py-4 text-center hidden sm:table-cell">PG</th>
                                        <th className="px-6 py-4 text-center hidden sm:table-cell">PE</th>
                                        <th className="px-6 py-4 text-center hidden sm:table-cell">PP</th>
                                        <th className="px-6 py-4 text-center text-slate-300">GF</th>
                                        <th className="px-6 py-4 text-center text-slate-300">GC</th>
                                        <th className="px-6 py-4 text-center text-white font-bold">DIF</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {leagueData.standings.map((team, index) => (
                                        <tr key={team.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={`flex size-6 items-center justify-center rounded text-xs font-bold ${index < 3 ? 'bg-primary text-white' : 'text-slate-500'}`}>
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                                <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                                    {team.shield_url ? (
                                                        <img src={team.shield_url} alt="escudo" className="w-full h-full object-cover rounded-full" />
                                                    ) : (
                                                        <span className="text-[10px] font-black text-slate-500">{team.name.substring(0, 1)}</span>
                                                    )}
                                                </div>
                                                {team.name}
                                            </td>
                                            <td className="px-6 py-4 text-center font-black text-lg text-primary">{team.points}</td>
                                            <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">{team.played}</td>
                                            <td className="px-6 py-4 text-center hidden sm:table-cell text-slate-600 dark:text-slate-400">{team.won}</td>
                                            <td className="px-6 py-4 text-center hidden sm:table-cell text-slate-600 dark:text-slate-400">{team.drawn}</td>
                                            <td className="px-6 py-4 text-center hidden sm:table-cell text-slate-600 dark:text-slate-400">{team.lost}</td>
                                            <td className="px-6 py-4 text-center font-medium text-slate-700 dark:text-slate-300">{team.goals_for}</td>
                                            <td className="px-6 py-4 text-center font-medium text-slate-700 dark:text-slate-300">{team.goals_against}</td>
                                            <td className="px-6 py-4 text-center font-black text-slate-900 dark:text-white">
                                                {team.goals_for - team.goals_against}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* SECCIÓN GOLEADORES (PODIO + LISTA) */}
                    {scorers.length > 0 && (
                        <div className="mb-16">
                            <h3 className="text-2xl font-black uppercase text-slate-900 dark:text-white mb-8 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">sports_soccer</span> Goleadores
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* El Podio (Columna Izquierda Ancha) */}
                                <div className="lg:col-span-2 bg-slate-100 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 flex items-end justify-center gap-2 md:gap-4 h-[400px]">

                                    {/* 2do Lugar (Plata) */}
                                    <div className="flex flex-col items-center w-1/3">
                                        <div className="mb-2 size-16 md:size-20 rounded-full overflow-hidden border-4 border-slate-300 shadow-lg bg-white flex items-center justify-center">
                                            {secondPlace.img ? <img src={secondPlace.img} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-slate-400">person</span>}
                                        </div>
                                        <div className="w-full bg-slate-300 dark:bg-slate-700 h-32 rounded-t-lg flex flex-col items-center justify-start pt-4 relative">
                                            <span className="font-black text-4xl text-slate-400/50 absolute bottom-2">2</span>
                                            <span className="font-bold text-slate-900 dark:text-white text-sm md:text-base text-center px-1">{secondPlace.name}</span>
                                            <span className="text-xs uppercase text-slate-500">{secondPlace.team}</span>
                                            <div className="mt-2 bg-slate-800 text-white px-2 py-0.5 rounded text-xs font-bold">{secondPlace.goals} Goles</div>
                                        </div>
                                    </div>

                                    {/* 1er Lugar (Oro - Más alto) */}
                                    <div className="flex flex-col items-center w-1/3 z-10">
                                        <div className="mb-2 size-20 md:size-24 rounded-full overflow-hidden border-4 border-yellow-400 shadow-xl shadow-yellow-400/20 bg-white flex items-center justify-center">
                                            {firstPlace.img ? <img src={firstPlace.img} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-yellow-500">emoji_events</span>}
                                        </div>
                                        <div className="w-full bg-yellow-400 h-44 rounded-t-lg flex flex-col items-center justify-start pt-6 relative shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                                            <span className="font-black text-5xl text-yellow-600/30 absolute bottom-2">1</span>
                                            <span className="font-black text-slate-900 text-base md:text-lg text-center px-1 leading-tight">{firstPlace.name}</span>
                                            <span className="text-xs uppercase text-yellow-800 font-bold">{firstPlace.team}</span>
                                            <div className="mt-2 bg-slate-900 text-white px-3 py-1 rounded text-sm font-bold">{firstPlace.goals} Goles</div>
                                        </div>
                                    </div>

                                    {/* 3er Lugar (Bronce) */}
                                    <div className="flex flex-col items-center w-1/3">
                                        <div className="mb-2 size-16 md:size-20 rounded-full overflow-hidden border-4 border-orange-300 shadow-lg bg-white flex items-center justify-center">
                                            {thirdPlace.img ? <img src={thirdPlace.img} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-orange-300">person</span>}
                                        </div>
                                        <div className="w-full bg-orange-300 dark:bg-orange-700/80 h-24 rounded-t-lg flex flex-col items-center justify-start pt-4 relative">
                                            <span className="font-black text-4xl text-orange-900/20 absolute bottom-2">3</span>
                                            <span className="font-bold text-slate-900 dark:text-white text-sm md:text-base text-center px-1">{thirdPlace.name}</span>
                                            <span className="text-xs uppercase text-slate-600 dark:text-orange-200">{thirdPlace.team}</span>
                                            <div className="mt-2 bg-slate-800 text-white px-2 py-0.5 rounded text-xs font-bold">{thirdPlace.goals} Goles</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Lista Restante (Columna Derecha) */}
                                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col h-[400px]">

                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 sticky top-0 bg-white dark:bg-slate-900 py-2 z-10">
                                        Top 4 - {showAllScorers ? allRestScorers.length + 3 : Math.min(10, allRestScorers.length + 3)}
                                    </h4>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                        <div className="flex flex-col gap-2">
                                            {visibleScorers.length > 0 ? visibleScorers.map((scorer, idx) => (
                                                <div key={scorer.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 shrink-0">
                                                    <div className="flex items-center gap-3">
                                                        {/* El índice real es idx + 4 */}
                                                        <span className="text-slate-300 font-black text-lg w-6 text-center">{idx + 4}</span>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-900 dark:text-white text-sm">{scorer.name}</span>
                                                            <span className="text-[10px] uppercase text-slate-500">{scorer.team}</span>
                                                        </div>
                                                    </div>
                                                    <span className="font-black text-primary">{scorer.goals}</span>
                                                </div>
                                            )) : (
                                                <p className="text-sm text-slate-500 text-center py-4">No hay más goleadores registrados.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* BOTÓN VER MÁS / VER MENOS */}
                                    {allRestScorers.length > 7 && (
                                        <button
                                            onClick={() => setShowAllScorers(!showAllScorers)}
                                            className="w-full mt-4 py-2 text-xs font-black uppercase tracking-widest text-primary border border-primary/20 rounded hover:bg-primary hover:text-white transition-all"
                                        >
                                            {showAllScorers ? 'Ver Menos' : 'Ver Todos'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN EDUCATIVA: BOSQUE ESCLERÓFILO */}
                    <div className="bg-slate-900 dark:bg-black rounded-2xl p-8 md:p-12 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-5">
                            <span className="material-symbols-outlined text-[300px]">forest</span>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-3xl font-black uppercase text-white mb-2">Conoce tu Liga</h3>
                            <p className="text-slate-400 mb-8 max-w-2xl">
                                Cada equipo representa una especie nativa. Aprende sobre el escudo que defiendes.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {leagueData.standings.map((team) => (
                                    team.bio_title && (
                                        <div key={team.id} className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700 hover:border-primary transition-colors">
                                            <h4 className="text-primary font-black uppercase text-lg mb-2">{team.bio_title}</h4>
                                            <span className="text-[10px] uppercase font-bold text-slate-500 mb-3 block tracking-widest">{team.name}</span>
                                            <p className="text-slate-300 text-sm leading-relaxed line-clamp-4">
                                                {team.bio_description}
                                            </p>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    </div>

                </>
            )}
        </div>
    );
};

export default Liga;