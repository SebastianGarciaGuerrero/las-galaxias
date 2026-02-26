import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    const [latestNews, setLatestNews] = useState([]);
    const [upcomingMatches, setUpcomingMatches] = useState([]);
    const [leagues, setLeagues] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                // Hacemos las 3 llamadas al mismo tiempo para que cargue rapidísimo
                const [resNews, resMatches, resLeagues] = await Promise.all([
                    fetch(`${API_URL}/api/news`),
                    fetch(`${API_URL}/api/matches`), // Trae TC y Seniors
                    fetch(`${API_URL}/api/leagues`)  // Trae Torneos
                ]);

                const newsData = await resNews.json();
                const matchesData = await resMatches.json();
                const leaguesData = await resLeagues.json();

                // Filtramos y ordenamos para mostrar solo lo más relevante
                // 1. Noticias: Las 3 más recientes
                setLatestNews(newsData.slice(0, 3));

                // 2. Partidos: Solo los que están 'scheduled' (Próximos) y tomamos los 4 primeros
                const futureMatches = matchesData.filter(m => m.status === 'scheduled').slice(0, 4);
                setUpcomingMatches(futureMatches);

                // 3. Ligas: Mostramos las activas o próximas
                setLeagues(leaguesData.filter(l => l.status !== 'past').slice(0, 2));

            } catch (error) {
                console.error("Error cargando el Home:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-20">

            {/* 1. HERO SECTION (Portada) */}
            <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/60 z-10"></div>
                {/* Puedes poner una foto de Valparaíso o del equipo de fondo con Cloudinary aquí */}
                <img
                    src="https://images.unsplash.com/photo-1518605348400-437731db680b?q=80&w=2070&auto=format&fit=crop"
                    alt="Club Deportivo Las Galaxias"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto animate-fade-in-up">
                    <span className="text-primary font-black tracking-widest uppercase text-sm md:text-base mb-4 block">El Orgullo del Puerto</span>
                    <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic leading-none mb-6">
                        Club Deportivo <br /><span className="text-primary">Las Galaxias</span>
                    </h1>
                    <p className="text-slate-300 text-lg md:text-xl font-medium mb-8 max-w-2xl mx-auto">
                        Más que un club, una familia. Sigue el día a día de nuestras series Todo Competidor, Seniors y nuestras ligas organizadas.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/partidos" className="bg-primary text-white px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg hover:-translate-y-1">
                            Ver Fixture
                        </Link>
                        <Link to="/liga" className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-white/20 transition-colors">
                            Nuestras Ligas
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-[1280px] mx-auto px-4 -mt-10 relative z-30">

                {/* 2. PRÓXIMOS PARTIDOS DEL CLUB (TC y Seniors) */}
                <section className="mb-20">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-black uppercase text-slate-900 dark:text-white border-l-4 border-primary pl-4 leading-tight">
                                Próximos <br />Desafíos
                            </h2>
                        </div>
                        <Link to="/partidos" className="text-sm font-bold text-primary hover:underline uppercase tracking-wider hidden sm:block">Ver Calendario Completo &rarr;</Link>
                    </div>

                    {upcomingMatches.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl text-center border border-slate-200 dark:border-slate-700 shadow-sm">
                            <p className="text-slate-500 font-bold">No hay partidos programados por el momento.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {upcomingMatches.map(match => {
                                const dateObj = new Date(match.match_date);
                                const isLocal = match.is_local;
                                const clubName = match.category === 'seniors' ? 'Galaxias Sr' : 'Galaxias TC';

                                return (
                                    <div key={match.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary transition-colors flex items-center justify-between group cursor-pointer">
                                        <div className="flex flex-col items-center text-center w-24">
                                            <span className="text-3xl font-black text-slate-300 dark:text-slate-600 leading-none">{dateObj.getDate()}</span>
                                            <span className="text-xs font-bold uppercase text-primary bg-primary/10 px-2 py-1 rounded mt-1">{dateObj.toLocaleString('es-ES', { month: 'short' }).replace('.', '')}</span>
                                        </div>

                                        <div className="flex-1 px-4 flex justify-between items-center">
                                            <span className={`font-black uppercase truncate text-right flex-1 ${isLocal ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{isLocal ? clubName : match.rival}</span>
                                            <span className="text-slate-400 font-black px-4 group-hover:scale-125 transition-transform">VS</span>
                                            <span className={`font-black uppercase truncate text-left flex-1 ${!isLocal ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{!isLocal ? clubName : match.rival}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* 3. ÚLTIMAS NOTICIAS */}
                    <section className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-black uppercase text-slate-900 dark:text-white border-l-4 border-primary pl-4">Actualidad</h2>
                            <Link to="/noticias" className="text-sm font-bold text-primary hover:underline uppercase tracking-wider">Ver Más</Link>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {latestNews.map((news, index) => (
                                <Link to={`/noticias/${news.id}`} key={news.id} className={`group ${index === 0 ? 'sm:col-span-2' : ''}`}>
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all h-full flex flex-col">
                                        <div className={`relative overflow-hidden ${index === 0 ? 'h-64 md:h-80' : 'h-48'}`}>
                                            <img src={news.image_url || 'https://via.placeholder.com/800x400'} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">{news.category}</div>
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <h3 className={`font-black uppercase text-slate-900 dark:text-white mb-2 line-clamp-2 ${index === 0 ? 'text-2xl' : 'text-lg'}`}>{news.title}</h3>
                                            <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">{news.summary}</p>
                                            <span className="text-xs font-bold text-primary uppercase tracking-wider">Leer Artículo &rarr;</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* 4. LIGAS ORGANIZADAS */}
                    <section>
                        <h2 className="text-3xl font-black uppercase text-slate-900 dark:text-white border-l-4 border-primary pl-4 mb-8">Nuestras Ligas</h2>

                        <div className="flex flex-col gap-6">
                            {leagues.map(league => (
                                <Link to={`/ligas?id=${league.id}`} key={league.id} className="group relative rounded-2xl overflow-hidden h-48 border border-slate-700 shadow-md">
                                    <img src={league.image_url || 'https://via.placeholder.com/400x300'} alt={league.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                                    <div className="absolute bottom-0 left-0 p-5 w-full">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                                            <span className="text-[10px] font-black uppercase text-green-400 tracking-widest">{league.status === 'active' ? 'En Juego' : 'Próximamente'}</span>
                                        </div>
                                        <h3 className="text-xl font-black uppercase text-white leading-tight">{league.name}</h3>
                                        <p className="text-slate-300 text-xs font-bold uppercase mt-1">{league.season}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default Home;