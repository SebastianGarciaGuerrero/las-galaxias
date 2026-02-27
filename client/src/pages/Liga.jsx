import { useState, useEffect } from 'react';
import FutbolLoader from '../components/FutbolLoader';

const Liga = () => {
    const [leaguesList, setLeaguesList] = useState([]);
    const [loadingLeagues, setLoadingLeagues] = useState(true);

    const [selectedLeague, setSelectedLeague] = useState(null);
    const [leagueData, setLeagueData] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [showAllScorers, setShowAllScorers] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // 1. Cargar torneos al entrar
    useEffect(() => {
        const fetchAllLeagues = async () => {
            try {
                const res = await fetch(`${API_URL}/api/leagues`);
                if (res.ok) {
                    const data = await res.json();
                    setLeaguesList(data);
                }
            } catch (error) {
                console.error("Error cargando la lista de torneos:", error);
            } finally {
                setLoadingLeagues(false);
            }
        };
        fetchAllLeagues();
    }, []);

    // 2. Cargar detalle de un torneo específico
    const fetchLeagueData = async (league) => {
        if (league.status === 'upcoming') {
            setLeagueData(null);
            return;
        }

        setLoadingDetails(true);
        try {
            const response = await fetch(`${API_URL}/api/leagues/${league.id}/summary`);
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            const data = await response.json();
            setLeagueData(data);
        } catch (error) {
            console.error("Error cargando el torneo:", error);
            setLeagueData(null);
        } finally {
            setLoadingDetails(false);
        }
    };

    useEffect(() => {
        if (selectedLeague) {
            fetchLeagueData(selectedLeague);
        }
    }, [selectedLeague]);

    const handleBack = () => {
        setSelectedLeague(null);
        setLeagueData(null);
        setShowAllScorers(false);
    };

    // --- FILTRADO ---
    const activeLeagues = leaguesList.filter(l => l.status === 'active' || l.status === 'upcoming');
    const pastLeagues = leaguesList.filter(l => l.status === 'past');

    // --- LÓGICA DE GOLEADORES ---
    const scorers = leagueData?.scorers || [];
    const paddedScorers = [...scorers];
    while (paddedScorers.length < 3) {
        paddedScorers.push({ id: `placeholder-${paddedScorers.length}`, name: '---', team: '---', goals: 0, img: null });
    }

    const firstPlace = paddedScorers[0];
    const secondPlace = paddedScorers[1];
    const thirdPlace = paddedScorers[2];
    const allRestScorers = scorers.slice(3);
    const visibleScorers = showAllScorers ? allRestScorers : allRestScorers.slice(0, 7);

    // --- COMPONENTE DE TARJETA ---
    const LeagueCard = ({ league }) => {
        const isUpcoming = league.status === 'upcoming';
        const isPast = league.status === 'past';

        return (
            <button
                onClick={() => setSelectedLeague(league)}
                className="group relative h-80 w-full overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-primary transition-all duration-300 text-left shadow-lg"
            >
                <div
                    className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 ${isPast ? 'grayscale group-hover:grayscale-0' : ''}`}
                    style={{ backgroundImage: `url(${league.image_url || 'https://images.unsplash.com/photo-1518605348400-437731db680b?q=80&w=2070&auto=format&fit=crop'})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent"></div>

                <div className="relative z-10 flex h-full flex-col justify-end p-8">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-block rounded px-3 py-1 text-xs font-black uppercase tracking-widest ${!isPast ? 'bg-primary text-white' : 'bg-white text-slate-900'}`}>
                            {league.day_label || 'Competición'}
                        </span>
                        {isUpcoming && (
                            <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-[10px] font-black uppercase animate-pulse">
                                Próximamente
                            </span>
                        )}
                    </div>

                    <h2 className="text-3xl font-black uppercase text-white leading-tight">{league.name}</h2>
                    <p className="text-primary font-bold text-sm mt-1 mb-2">{league.season}</p>

                    <p className="mt-2 text-sm text-slate-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        {isUpcoming ? 'Ver detalles de inicio' : 'Ver estadísticas oficiales'}
                    </p>
                </div>
            </button>
        );
    }

    // ==========================================
    // VISTA DE CARGA INICIAL (Usando el nuevo componente)
    // ==========================================
    if (loadingLeagues) {
        return <FutbolLoader texto="Cargando Competiciones..." />;
    }

    // ==========================================
    // 1. VISTA DE SELECCIÓN
    // ==========================================
    if (!selectedLeague) {
        return (
            <div className="w-full max-w-[1280px] mx-auto px-4 py-20 animate-fade-in min-h-screen">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black uppercase text-slate-900 dark:text-white mb-4">Competiciones</h1>
                    <p className="text-slate-500 dark:text-slate-400">Selecciona un torneo para ver las tablas, resultados y estadísticas.</p>
                </div>

                {leaguesList.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
                        <p className="text-slate-500 font-bold">No hay torneos registrados en la base de datos.</p>
                    </div>
                )}

                {activeLeagues.length > 0 && (
                    <div className="mb-20">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-3 bg-primary rounded-full animate-pulse"></div>
                            <h2 className="text-2xl font-black uppercase tracking-widest text-slate-800 dark:text-white">En Juego / Próximas</h2>
                            <div className="h-[1px] bg-slate-200 dark:bg-slate-800 flex-1"></div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {activeLeagues.map(league => <LeagueCard key={league.id} league={league} />)}
                        </div>
                    </div>
                )}

                {pastLeagues.length > 0 && (
                    <div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-3 bg-slate-400 rounded-full"></div>
                            <h2 className="text-2xl font-black uppercase tracking-widest text-slate-800 dark:text-white">Torneos Anteriores</h2>
                            <div className="h-[1px] bg-slate-200 dark:bg-slate-800 flex-1"></div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {pastLeagues.map(league => <LeagueCard key={league.id} league={league} />)}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ==========================================
    // 2. VISTA DE CARGA DE DETALLE (Usando el nuevo componente)
    // ==========================================
    if (loadingDetails) {
        return <FutbolLoader texto="Entrando a la liga..." />;
    }

    // ==========================================
    // 3. VISTA DE DETALLE
    // ==========================================
    return (
        <div className="w-full max-w-[1280px] mx-auto px-4 py-12 animate-fade-in min-h-screen">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-primary font-black uppercase tracking-widest text-xs">{selectedLeague.day_label || 'Competición'}</span>
                        <span className="text-slate-400 text-xs font-bold">• {selectedLeague.season}</span>
                    </div>
                    <h1 className="text-4xl font-black uppercase text-slate-900 dark:text-white leading-none">
                        {selectedLeague.name}
                    </h1>
                </div>
                <button onClick={handleBack} className="flex items-center gap-2 text-sm font-bold uppercase text-slate-500 hover:text-primary transition-colors bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg">
                    <span className="material-symbols-outlined">arrow_back</span> Volver
                </button>
            </div>

            {selectedLeague.status === 'upcoming' ? (
                <div className="py-20 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center px-4">
                    <span className="material-symbols-outlined text-6xl text-primary mb-4">hourglass_top</span>
                    <h3 className="text-2xl font-black uppercase text-slate-900 dark:text-white mb-2">¡Preparando los motores!</h3>
                    <p className="text-slate-500 max-w-md">
                        Esta competición arranca pronto. Las tablas y estadísticas estarán habilitadas una vez que ruede el balón.
                    </p>
                </div>
            ) : !leagueData || (!leagueData.standings?.length && !leagueData.scorers?.length) ? (
                <div className="py-20 p-4 bg-red-50 dark:bg-red-900/10 border-2 border-dashed border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-center">
                    <span className="material-symbols-outlined text-5xl mb-2">warning</span>
                    <p className="font-bold text-xl uppercase mb-1">Datos no disponibles</p>
                    <p className="text-sm">Aún no hay equipos ni resultados cargados para este torneo.</p>
                </div>
            ) : (
                <>
                    {/* TABLA DE POSICIONES */}
                    {leagueData.standings?.length > 0 && (
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
                    )}

                    {/* SECCIÓN GOLEADORES */}
                    {scorers.length > 0 && (
                        <div className="mb-16">
                            <h3 className="text-2xl font-black uppercase text-slate-900 dark:text-white mb-8 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">sports_soccer</span> Goleadores
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-slate-100 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 flex items-end justify-center gap-2 md:gap-4 h-[400px]">
                                    <div className="flex flex-col items-center w-1/3">
                                        <div className="mb-2 size-16 md:size-20 rounded-full overflow-hidden border-4 border-slate-300 shadow-lg bg-white flex items-center justify-center">
                                            {secondPlace.img ? <img src={secondPlace.img} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-slate-400">person</span>}
                                        </div>
                                        <div className="w-full bg-slate-300 dark:bg-slate-700 h-32 rounded-t-lg flex flex-col items-center justify-start pt-4 relative">
                                            <span className="font-black text-4xl text-slate-400/50 absolute bottom-2">2</span>
                                            <span className="font-bold text-slate-900 dark:text-white text-sm md:text-base text-center px-1 truncate w-full">{secondPlace.name}</span>
                                            <span className="text-xs uppercase text-slate-500 truncate w-full px-1 text-center">{secondPlace.team}</span>
                                            <div className="mt-2 bg-slate-800 text-white px-2 py-0.5 rounded text-xs font-bold">{secondPlace.goals} Goles</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center w-1/3 z-10">
                                        <div className="mb-2 size-20 md:size-24 rounded-full overflow-hidden border-4 border-yellow-400 shadow-xl shadow-yellow-400/20 bg-white flex items-center justify-center">
                                            {firstPlace.img ? <img src={firstPlace.img} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-yellow-500">emoji_events</span>}
                                        </div>
                                        <div className="w-full bg-yellow-400 h-44 rounded-t-lg flex flex-col items-center justify-start pt-6 relative shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                                            <span className="font-black text-5xl text-yellow-600/30 absolute bottom-2">1</span>
                                            <span className="font-black text-slate-900 text-base md:text-lg text-center px-1 leading-tight truncate w-full">{firstPlace.name}</span>
                                            <span className="text-xs uppercase text-yellow-800 font-bold truncate w-full px-1 text-center">{firstPlace.team}</span>
                                            <div className="mt-2 bg-slate-900 text-white px-3 py-1 rounded text-sm font-bold">{firstPlace.goals} Goles</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center w-1/3">
                                        <div className="mb-2 size-16 md:size-20 rounded-full overflow-hidden border-4 border-orange-300 shadow-lg bg-white flex items-center justify-center">
                                            {thirdPlace.img ? <img src={thirdPlace.img} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-orange-300">person</span>}
                                        </div>
                                        <div className="w-full bg-orange-300 dark:bg-orange-700/80 h-24 rounded-t-lg flex flex-col items-center justify-start pt-4 relative">
                                            <span className="font-black text-4xl text-orange-900/20 absolute bottom-2">3</span>
                                            <span className="font-bold text-slate-900 dark:text-white text-sm md:text-base text-center px-1 truncate w-full">{thirdPlace.name}</span>
                                            <span className="text-xs uppercase text-slate-600 dark:text-orange-200 truncate w-full px-1 text-center">{thirdPlace.team}</span>
                                            <div className="mt-2 bg-slate-800 text-white px-2 py-0.5 rounded text-xs font-bold">{thirdPlace.goals} Goles</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col h-[400px]">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 sticky top-0 bg-white dark:bg-slate-900 py-2 z-10">
                                        Top 4 - {showAllScorers ? allRestScorers.length + 3 : Math.min(10, allRestScorers.length + 3)}
                                    </h4>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                        <div className="flex flex-col gap-2">
                                            {visibleScorers.length > 0 ? visibleScorers.map((scorer, idx) => (
                                                <div key={scorer.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 shrink-0">
                                                    <div className="flex items-center gap-3">
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

                    {/* SECCIÓN EDUCATIVA */}
                    {leagueData.standings?.some(t => t.bio_title) && (
                        <div className="bg-slate-900 dark:bg-black rounded-2xl p-8 md:p-12 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-5">
                                <span className="material-symbols-outlined text-[300px]">forest</span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black uppercase text-white mb-2">Conoce tu Liga</h3>
                                <p className="text-slate-400 mb-8 max-w-2xl">
                                    Aprende más sobre los equipos que conforman este campeonato.
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
                    )}
                </>
            )}
        </div>
    );
};

export default Liga;