import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FutbolLoader from '../components/FutbolLoader';
import TeamBadge from '../components/TeamBadge';
import ShareStandings from '../components/ShareStandings';
import ShareScorers from '../components/ShareScorers';
import ShareResults from '../components/ShareResults';
import ChampionCelebration from '../components/ChampionCelebration';
import FasesTorneo from '../components/FasesTorneo';
import SEO from '../components/SEO';
import { horaChile, fechaChile } from '../utils/fecha';
import { tieneFases, leerFases, nombreDeEtapa, ETAPAS } from '../utils/fases';

// Agrupa los partidos por jornada. Se usa tanto para elegir qué jornada
// mostrar al entrar como para pintarla.
const agruparPorJornada = (partidos) => {
    const porJornada = {};
    for (const m of partidos) {
        const r = m.round || 1;
        if (!porJornada[r]) porJornada[r] = [];
        porJornada[r].push(m);
    }
    return porJornada;
};

// La jornada que viene: la primera que tenga algún partido sin jugar. Si ya
// se jugaron todas, la última.
const proximaJornada = (porJornada, numeros) =>
    numeros.find(n => porJornada[n].some(m => m.status !== 'finished')) ?? numeros[numeros.length - 1];

// Los tres partidos de una fecha son el mismo día, así que alcanza con el
// más temprano para fechar la jornada entera.
const fechaDeJornada = (partidos) => {
    const inicio = partidos.reduce(
        (min, m) => (m.match_date && m.match_date < min ? m.match_date : min),
        partidos[0]?.match_date,
    );
    return inicio ? fechaChile(inicio, { weekday: 'short', day: 'numeric', month: 'short' }) : null;
};

const LIGA_SEO = (
    <SEO
        title="Competiciones"
        description="Tablas de posiciones, goleadores y resultados de las ligas de fútbol del Club Deportivo Las Galaxias en Valparaíso."
        url="https://lasgalaxias.cl/liga"
    />
);

const Liga = () => {
    const [leaguesList, setLeaguesList] = useState([]);
    const [loadingLeagues, setLoadingLeagues] = useState(true);
    const [expandedBios, setExpandedBios] = useState({});

    const [selectedLeague, setSelectedLeague] = useState(null);
    const [leagueData, setLeagueData] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [showAllScorers, setShowAllScorers] = useState(false);
    const [leagueMatches, setLeagueMatches] = useState([]);
    const [jornadaVista, setJornadaVista] = useState(null);
    const [byeWeeks, setByeWeeks] = useState([]);
    const [celebration, setCelebration] = useState(null); // { champion, key } al entrar a una liga finalizada
    const [searchParams, setSearchParams] = useSearchParams();

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
            setLeagueMatches([]);
            return;
        }
        setLoadingDetails(true);
        try {
            const [resSummary, resMatches] = await Promise.all([
                fetch(`${API_URL}/api/leagues/${league.id}/summary`),
                fetch(`${API_URL}/api/leagues/${league.id}/matches`)
            ]);
            if (!resSummary.ok || !resMatches.ok) throw new Error('Error del servidor');
            const data = await resSummary.json();
            const matchesData = await resMatches.json();
            setLeagueData(data);
            setLeagueMatches(Array.isArray(matchesData) ? matchesData : []);
        } catch (error) {
            console.error("Error:", error);
            setLeagueData(null);
            setLeagueMatches([]);
        } finally {
            setLoadingDetails(false);
        }
        const [resSummary, resMatches, resByes] = await Promise.all([
            fetch(`${API_URL}/api/leagues/${league.id}/summary`),
            fetch(`${API_URL}/api/leagues/${league.id}/matches`),
            fetch(`${API_URL}/api/leagues/${league.id}/byes`)
        ]);
        const data = await resSummary.json();
        const matchesData = await resMatches.json();
        const byesData = await resByes.json();
        setLeagueData(data);
        setLeagueMatches(Array.isArray(matchesData) ? matchesData : []);
        setByeWeeks(Array.isArray(byesData) ? byesData : []);
    };

    useEffect(() => {
        if (selectedLeague) {
            fetchLeagueData(selectedLeague);
        }
    }, [selectedLeague]);

    // El fixture arranca parado en la jornada que viene, no en la primera:
    // lo que casi siempre se busca es cuándo se juega la próxima.
    useEffect(() => {
        if (leagueMatches.length === 0) {
            setJornadaVista(null);
            return;
        }
        const porJornada = agruparPorJornada(leagueMatches);
        const numeros = Object.keys(porJornada).map(Number).sort((a, b) => a - b);
        setJornadaVista(proximaJornada(porJornada, numeros));
    }, [leagueMatches]);

    // Celebración del campeón al entrar a una liga ya finalizada. En las ligas
    // por etapas el campeón no es el primero de la tabla sino el que ganó la
    // final, así que hay que ir a buscarlo ahí.
    useEffect(() => {
        if (selectedLeague?.status !== 'past') {
            setCelebration(null);
            return;
        }
        const campeon = tieneFases(leagueMatches)
            ? leerFases(leagueMatches, selectedLeague.points_per_win).superCampeon
            : leagueData?.standings?.[0];
        setCelebration(campeon ? { champion: campeon, key: Date.now() } : null);
    }, [leagueData, leagueMatches, selectedLeague]);

    // Sacar el ?id de la URL alcanza para volver al listado: el efecto de abajo
    // se encarga de deseleccionar. El resto es limpieza de lo que quedó cargado.
    const handleBack = () => {
        setSearchParams({});
        setLeagueData(null);
        setLeagueMatches([]);
        setByeWeeks([]);
        setShowAllScorers(false);
        setCelebration(null);
    };

    // Qué liga se está viendo lo decide la URL, no el estado. Antes la elección
    // vivía solo en memoria y por eso apretar "Ligas" en el menú estando dentro
    // de una liga no hacía nada: la ruta ya era /liga y no cambiaba nada.
    // Ahora entrar a una liga escribe ?id=N, así que volver a /liga sin
    // parámetros muestra el listado. De paso, cada liga queda con su propio
    // enlace para compartir.
    useEffect(() => {
        if (leaguesList.length === 0) return;

        const idFromUrl = searchParams.get('id');
        const categoryFromUrl = searchParams.get('category');

        if (idFromUrl) {
            setSelectedLeague(leaguesList.find(l => String(l.id) === String(idFromUrl)) || null);
            return;
        }

        if (categoryFromUrl) {
            // La liga en juego de esa categoría. Si no hay ninguna activa, cae
            // en el listado.
            const activeLeague = leaguesList.find(l =>
                l.status === 'active' && l.category === categoryFromUrl
            );
            setSelectedLeague(activeLeague || null);
            return;
        }

        setSelectedLeague(null);
    }, [leaguesList, searchParams]);

    // --- FILTRADO ---
    const activeLeagues = leaguesList.filter(l => l.status === 'active' || l.status === 'upcoming');
    const pastLeagues = leaguesList.filter(l => l.status === 'past');

    // --- FORMATO POR ETAPAS ---
    // Solo lo usan los torneos cuyos partidos declaran etapa (Liga de los
    // Martes 2026). En el resto queda en null y la página muestra la tabla
    // general de siempre.
    //
    // Cuánto vale ganar sale del torneo: los martes pagan 2 puntos y el resto
    // 3. Si la columna todavía no existe en la base, leerFases cae en 3.
    const fases = tieneFases(leagueMatches)
        ? leerFases(leagueMatches, selectedLeague?.points_per_win)
        : null;

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

    // Puntito verde latiendo, el de "esto está pasando ahora".
    const PuntoEnVivo = ({ className = '' }) => (
        <span className={`relative flex size-2 shrink-0 ${className}`}>
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
            <span className="relative inline-flex size-2 rounded-full bg-green-500" />
        </span>
    );

    // --- COMPONENTE DE TARJETA ---
    const LeagueCard = ({ league }) => {
        const isUpcoming = league.status === 'upcoming';
        const isPast = league.status === 'past';
        const enJuego = league.status === 'active';

        return (
            <button
                onClick={() => setSearchParams({ id: league.id })}
                className="group relative h-80 w-full overflow-hidden rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-primary transition-all duration-300 text-left shadow-lg"
            >
                {/* Las pasadas ya no van en blanco y negro: quedaban apagadas y
                    feas. La distinción la hace la sección donde están y el
                    sello de abajo. */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${league.image_url || 'https://images.unsplash.com/photo-1518605348400-437731db680b?q=80&w=2070&auto=format&fit=crop'})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent"></div>

                <div className="relative z-10 flex h-full flex-col justify-end p-8">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`inline-block rounded px-3 py-1 text-xs font-black uppercase tracking-widest ${
                            isPast ? 'bg-white/15 text-white/80 backdrop-blur-sm' : 'bg-primary text-white'
                        }`}>
                            {league.day_label || 'Competición'}
                        </span>

                        {enJuego && (
                            <span className="inline-flex items-center gap-1.5 rounded border border-green-400/40 bg-black/50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-green-400 backdrop-blur-sm">
                                <PuntoEnVivo />
                                En juego
                            </span>
                        )}

                        {isUpcoming && (
                            <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-[10px] font-black uppercase animate-pulse">
                                Próximamente
                            </span>
                        )}

                        {isPast && (
                            <span className="inline-flex items-center gap-1.5 rounded border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white/60 backdrop-blur-sm">
                                <span className="size-2 shrink-0 rounded-full bg-slate-400" />
                                Finalizada
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

    const toggleBio = (teamId) => {
        setExpandedBios(prev => ({
            ...prev,
            [teamId]: !prev[teamId]
        }));
    };
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
            <>
            {LIGA_SEO}
            <div className="w-full max-w-[1280px] mx-auto px-4 pt-28 pb-20 animate-fade-in min-h-screen">
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
                            {/* Verde latiendo solo si de verdad hay una liga en
                                juego. Si están todas por empezar, el punto del
                                club sin animación. */}
                            {activeLeagues.some(l => l.status === 'active')
                                ? <PuntoEnVivo />
                                : <div className="size-2 bg-primary rounded-full" />}
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
                            <div className="size-2 bg-slate-400 rounded-full"></div>
                            <h2 className="text-2xl font-black uppercase tracking-widest text-slate-800 dark:text-white">Torneos Anteriores</h2>
                            <div className="h-[1px] bg-slate-200 dark:bg-slate-800 flex-1"></div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {pastLeagues.map(league => <LeagueCard key={league.id} league={league} />)}
                        </div>
                    </div>
                )}
            </div>
            </>
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
    // pt-28 y no py-12: el navbar es fixed y mide 64-72px, así que con menos
    // padding la cabecera de la liga quedaba tapada por el menú. Es el mismo
    // margen que usa Academia.
    return (
        <div className="w-full max-w-[1280px] mx-auto px-4 pt-28 pb-16 animate-fade-in min-h-screen">
            {LIGA_SEO}
            {celebration && (
                <ChampionCelebration key={celebration.key} champion={celebration.champion} />
            )}
            <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
                {/* Volver arriba del título y alineado a la izquierda. Antes era
                    un botón gris flotando a la derecha, a la altura del título:
                    competía con el nombre de la liga y encima quedaba cortado. */}
                <button
                    onClick={handleBack}
                    className="mb-5 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors"
                >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Todas las competiciones
                </button>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-primary font-black uppercase tracking-widest text-xs">{selectedLeague.day_label || 'Competición'}</span>
                    <span className="text-slate-400 text-xs font-bold">• {selectedLeague.season}</span>
                </div>
                <h1 className="text-4xl font-black uppercase text-slate-900 dark:text-white leading-none">
                    {selectedLeague.name}
                </h1>
            </div>

            {selectedLeague.status === 'upcoming' ? (
                <div className="py-20 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center px-4">
                    <span className="material-symbols-outlined text-6xl text-primary mb-4">hourglass_top</span>
                    <h3 className="text-2xl font-black uppercase text-slate-900 dark:text-white mb-2">¡Preparando los motores!</h3>
                    <p className="text-slate-500 max-w-md">
                        Esta competición arranca pronto. Las tablas y estadísticas estarán habilitadas una vez que ruede el balón.
                    </p>
                </div>
            ) : (!leagueData || (!leagueData.standings?.length && !leagueData.scorers?.length)) && leagueMatches.length === 0 ? (
                <div className="py-20 p-4 bg-red-50 dark:bg-red-900/10 border-2 border-dashed border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-center">
                    <span className="material-symbols-outlined text-5xl mb-2">warning</span>
                    <p className="font-bold text-xl uppercase mb-1">Datos no disponibles</p>
                    <p className="text-sm">Aún no hay equipos ni resultados cargados para este torneo.</p>
                </div>
            ) : (
                <>
                    {/* FORMATO POR ETAPAS ── reemplaza a la tabla general en las
                        ligas de tres etapas: una sola tabla mezclaría la primera
                        fase con los grupos, que arrancan de cero. */}
                    {fases && <FasesTorneo league={selectedLeague} fases={fases} />}

                    {/* TABLA DE POSICIONES */}
                    {!fases && leagueData?.standings?.length > 0 && (
                        <div className="mb-16">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <h3 className="text-2xl font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">table_chart</span> Tabla General
                                </h3>
                                <ShareStandings league={selectedLeague} standings={leagueData.standings} />
                            </div>
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
                                                    <TeamBadge name={team.name} shieldUrl={team.shield_url} size={24} />
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
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                <h3 className="text-2xl font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">sports_soccer</span> Goleadores
                                </h3>
                                <ShareScorers league={selectedLeague} scorers={scorers} />
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-slate-100 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 flex items-end justify-center gap-2 md:gap-4 h-[400px]">
                                    <div className="flex flex-col items-center w-1/3">
                                        <div className="mb-2 size-16 md:size-20 rounded-full border-4 border-slate-300 shadow-lg bg-slate-200 flex items-center justify-center">
                                            <span className="text-3xl">🥈</span>
                                        </div>
                                        <div className="w-full bg-slate-300 dark:bg-slate-700 h-32 rounded-t-lg flex flex-col items-center justify-start pt-4 relative">
                                            <span className="font-black text-4xl text-slate-400/50 absolute bottom-2">2</span>
                                            <span className="font-bold text-slate-900 dark:text-white text-sm md:text-base text-center px-1 truncate w-full">{secondPlace.name}</span>
                                            <span className="text-xs uppercase text-slate-500 truncate w-full px-1 text-center">{secondPlace.team}</span>
                                            <div className="mt-2 bg-slate-800 text-white px-2 py-0.5 rounded text-xs font-bold">{secondPlace.goals} Goles</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center w-1/3 z-10">
                                        <div className="mb-2 size-20 md:size-24 rounded-full border-4 border-yellow-400 shadow-xl shadow-yellow-400/20 bg-yellow-400 flex items-center justify-center">
                                            <span className="text-4xl">🥇</span>
                                        </div>
                                        <div className="w-full bg-yellow-400 h-44 rounded-t-lg flex flex-col items-center justify-start pt-6 relative shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                                            <span className="font-black text-5xl text-yellow-600/30 absolute bottom-2">1</span>
                                            <span className="font-black text-slate-900 text-base md:text-lg text-center px-1 leading-tight truncate w-full">{firstPlace.name}</span>
                                            <span className="text-xs uppercase text-yellow-800 font-bold truncate w-full px-1 text-center">{firstPlace.team}</span>
                                            <div className="mt-2 bg-slate-900 text-white px-3 py-1 rounded text-sm font-bold">{firstPlace.goals} Goles</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center w-1/3">
                                        <div className="mb-2 size-16 md:size-20 rounded-full border-4 border-orange-300 shadow-lg bg-orange-100 flex items-center justify-center">
                                            <span className="text-3xl">🥉</span>
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

                    {/* SECCIÓN FIXTURE ── una jornada a la vez, con selector.
                        Antes eran 14 acordeones cerrados que solo decían
                        "Jornada N": había que abrirlos a ciegas para saber
                        cuándo se jugaba cada uno. */}
                    {leagueMatches.length > 0 && jornadaVista !== null && (() => {
                        const porJornada = agruparPorJornada(leagueMatches);
                        const numeros = Object.keys(porJornada).map(Number).sort((a, b) => a - b);
                        const proxima = proximaJornada(porJornada, numeros);

                        const actual = porJornada[jornadaVista] || [];
                        const idx = numeros.indexOf(jornadaVista);
                        const anterior = idx > 0 ? numeros[idx - 1] : null;
                        const siguiente = idx < numeros.length - 1 ? numeros[idx + 1] : null;

                        const fecha = fechaDeJornada(actual);
                        const jugada = actual.every(m => m.status === 'finished');
                        const sinJugar = actual.every(m => m.status === 'scheduled');
                        const descansa = byeWeeks.find(b => Number(b.round) === Number(jornadaVista))?.team?.name;
                        const algoJugado = leagueMatches.some(m => m.status === 'finished');

                        // A qué etapa pertenece la jornada. En la segunda fase la
                        // misma noche tiene partidos de los dos grupos, así que la
                        // cabecera dice "Segunda Fase" y cada partido lleva el suyo.
                        const etapas = [...new Set(actual.map(m => m.stage).filter(Boolean))];
                        const etapaDeJornada = etapas.length === 1
                            ? nombreDeEtapa(etapas[0])
                            : etapas.length > 1 ? 'Segunda Fase' : null;

                        return (
                            <div className="mb-16">
                                <h3 className="text-2xl font-black uppercase text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">format_list_numbered</span>
                                    {algoJugado ? 'Resultados' : 'Fixture'}
                                </h3>

                                {/* Tira de jornadas: acceso directo a cualquiera.
                                    Las jugadas van apagadas. */}
                                <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3 -mx-1 px-1">
                                    {numeros.map(n => {
                                        const esta = n === jornadaVista;
                                        const lista = porJornada[n].every(m => m.status === 'finished');
                                        return (
                                            <button
                                                key={n}
                                                onClick={() => setJornadaVista(n)}
                                                aria-current={esta ? 'true' : undefined}
                                                className={`shrink-0 w-9 h-9 rounded-lg text-xs font-black transition-colors ${
                                                    esta
                                                        ? 'bg-primary text-white'
                                                        : lista
                                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                {n}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">

                                    {/* CABECERA: flechas, jornada y fecha */}
                                    <div className="flex items-center gap-2 p-4 border-b border-slate-100 dark:border-slate-800">
                                        <button
                                            onClick={() => anterior !== null && setJornadaVista(anterior)}
                                            disabled={anterior === null}
                                            aria-label="Jornada anterior"
                                            className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-xl">chevron_left</span>
                                        </button>

                                        <div className="flex-1 min-w-0 text-center">
                                            <div className="flex items-center justify-center gap-2 flex-wrap">
                                                <span className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                                                    Jornada {jornadaVista}
                                                </span>
                                                {etapaDeJornada && (
                                                    <span className="rounded border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                                        {etapaDeJornada}
                                                    </span>
                                                )}
                                                {jornadaVista === proxima && !jugada && (
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-white bg-primary px-2 py-0.5 rounded">
                                                        Próxima
                                                    </span>
                                                )}
                                            </div>
                                            {fecha && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                                    {fecha}
                                                    {jugada && ' · Completada'}
                                                    {!jugada && !sinJugar && ' · En curso'}
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => siguiente !== null && setJornadaVista(siguiente)}
                                            disabled={siguiente === null}
                                            aria-label="Jornada siguiente"
                                            className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-xl">chevron_right</span>
                                        </button>

                                        <ShareResults league={selectedLeague} round={jornadaVista} matches={actual} bye={descansa} />
                                    </div>

                                    {/* PARTIDOS: local y visita apilados, como en la
                                        app del marcador. Entra mejor en celular que
                                        ponerlos enfrentados. */}
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {actual.map(match => {
                                            const listo = match.status === 'finished';
                                            const ganaLocal = listo && match.home_score > match.away_score;
                                            const ganaVisita = listo && match.away_score > match.home_score;

                                            return (
                                                <div key={match.id} className="p-4">
                                                    <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                                                        {horaChile(match.match_date)}
                                                        {match.stage && match.stage !== ETAPAS.FASE1 && (
                                                            <span className="ml-2 text-primary">{nombreDeEtapa(match.stage)}</span>
                                                        )}
                                                        {!listo && <span className="ml-2 text-slate-300 dark:text-slate-600">Sin jugar</span>}
                                                    </div>

                                                    {[
                                                        { equipo: match.home, goles: match.home_score, gana: ganaLocal },
                                                        { equipo: match.away, goles: match.away_score, gana: ganaVisita },
                                                    ].map(({ equipo, goles, gana }, i) => (
                                                        <div key={i} className="flex items-center gap-3 py-1">
                                                            <TeamBadge name={equipo?.name || ''} shieldUrl={equipo?.logo_url} size={24} />
                                                            {/* Sin truncate: en celular los nombres largos
                                                                de los martes salían cortados con puntos
                                                                suspensivos. Prefiere bajar de línea. */}
                                                            <span className={`flex-1 text-sm md:text-base ${
                                                                gana ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-600 dark:text-slate-300'
                                                            }`}>
                                                                {equipo?.name}
                                                            </span>
                                                            <span className={`shrink-0 tabular-nums text-base ${
                                                                listo
                                                                    ? gana ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-500'
                                                                    : 'text-slate-300 dark:text-slate-700'
                                                            }`}>
                                                                {listo ? goles : '–'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}

                                        {/* Quién descansa. Apagado a propósito: es contexto,
                                            no tiene que competir con los resultados. */}
                                        {descansa && (
                                            <div className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-primary/70">
                                                Descansa {descansa}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="text-center text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-3">
                                    Jornada {jornadaVista} de {numeros.length}
                                </p>
                            </div>
                        );
                    })()}

                    {/* SECCIÓN EDUCATIVA */}
                    {leagueData?.standings?.some(t => t.bio_title) && (
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
                                    {leagueData.standings.map((team) => {
                                        // Si el equipo no tiene historia, no dibujamos la tarjeta
                                        if (!team.bio_title) return null;

                                        // Verificamos si la historia es lo suficientemente larga para necesitar el botón
                                        const isLongText = team.bio_description && team.bio_description.length > 120;
                                        // Verificamos si ESTA tarjeta en específico está expandida
                                        const isExpanded = expandedBios[team.id];

                                        return (
                                            <div key={team.id} className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700 hover:border-primary transition-colors flex flex-col">
                                                <h4 className="text-primary font-black uppercase text-lg mb-2">{team.bio_title}</h4>
                                                <span className="text-[10px] uppercase font-bold text-slate-500 mb-3 block tracking-widest">{team.name}</span>

                                                {/* Aquí ocurre la magia del truncado: si no está expandido, aplica line-clamp-4 */}
                                                <p className={`text-slate-300 text-sm leading-relaxed transition-all duration-300 ${!isExpanded ? 'line-clamp-4' : ''}`}>
                                                    {team.bio_description}
                                                </p>

                                                {/* Renderizamos el botón solo si el texto es largo */}
                                                {isLongText && (
                                                    <button
                                                        onClick={() => toggleBio(team.id)}
                                                        className="mt-4 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors self-start border border-primary/20 px-3 py-1.5 rounded-full hover:bg-primary"
                                                    >
                                                        {isExpanded ? 'Ver menos' : 'Leer más'}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
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