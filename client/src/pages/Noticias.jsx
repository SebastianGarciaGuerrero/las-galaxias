import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FutbolLoader from '../components/FutbolLoader';

const Noticias = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Todas');

    // Categorías del filtro
    const categories = ['Todas', 'Primer Equipo', 'Liga Martes', 'Liga Viernes', 'Social'];

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // 1. Cargar noticias desde el Backend
    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch(`${API_URL}/api/news`);
                const data = await res.json();

                // Ordenamos por fecha (la más nueva primero)
                // Aseguramos que data sea un array antes de ordenar
                if (Array.isArray(data)) {
                    const sortedNews = data.sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));
                    setNews(sortedNews);
                }
            } catch (error) {
                console.error("Error cargando noticias:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    // 2. Lógica de Filtrado (Solo backend)
    const filteredNews = filter === 'Todas'
        ? news
        : news.filter(item => item.category === filter);

    // 3. Separar: La más nueva es "Featured", el resto son lista
    // Si hay filtro activo, no mostramos featured gigante, mostramos todo en grilla
    const featuredArticle = filter === 'Todas' && filteredNews.length > 0 ? filteredNews[0] : null;

    const listArticles = filter === 'Todas'
        ? filteredNews.slice(1) // Si es 'Todas', saltamos la primera (porque ya sale gigante)
        : filteredNews; // Si hay filtro, mostramos todas las que coincidan en la grilla

    return (
        <div className="w-full animate-fade-in pb-20">

            {/* HEADER */}
            <div className="bg-slate-900 dark:bg-black py-12 px-4 text-center border-b border-slate-800">
                <span className="text-primary font-black uppercase tracking-widest text-xs mb-2 block">Actualidad</span>
                <h1 className="text-4xl md:text-6xl font-black uppercase text-white mb-4">Noticias del Club</h1>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Mantente informado sobre los resultados, actividades sociales y novedades de nuestras ligas.
                </p>
            </div>

            <div className="max-w-[1280px] mx-auto px-4 mt-8">

                {/* FILTROS */}
                <div className="flex flex-wrap gap-2 justify-center mb-10">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-bold uppercase transition-all ${filter === cat
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <FutbolLoader texto="Preparando las noticias..." />
                ) : (
                    <>
                        {/* NOTICIA DESTACADA (Solo la más reciente) */}
                        {featuredArticle && (
                            <Link to={`/noticias/${featuredArticle.id}`} className="mb-12 group relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-2xl shadow-2xl cursor-pointer block">
                                <img
                                    src={featuredArticle.image_url}
                                    alt={featuredArticle.title}
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full md:w-2/3">
                                    <span className="bg-primary text-white text-xs font-black uppercase px-2 py-1 rounded mb-3 inline-block">
                                        {featuredArticle.category || 'General'}
                                    </span>
                                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase leading-tight mb-4 drop-shadow-lg">
                                        {featuredArticle.title}
                                    </h2>
                                    <p className="text-slate-200 text-lg line-clamp-2 mb-6 hidden md:block">
                                        {featuredArticle.summary}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <span>{new Date(featuredArticle.publish_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {/* GRILLA DE NOTICIAS + TARJETA FIJA DE LIGA */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                            {/* Mapeo de noticias reales */}
                            {listArticles.map((news) => (
                                <Link
                                    to={`/noticias/${news.id}`}
                                    key={news.id}
                                    className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 transition-all duration-300"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={news.image_url}
                                            alt={news.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-slate-900 text-white text-[10px] font-black uppercase px-2 py-1 rounded">
                                                {news.category || 'General'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase mb-3">
                                            <span className="material-symbols-outlined text-sm">calendar_month</span>
                                            {new Date(news.publish_date).toLocaleDateString()}
                                        </div>
                                        <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-primary transition-colors">
                                            {news.title}
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 flex-1">
                                            {news.summary}
                                        </p>
                                        <button className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-primary hover:translate-x-1 transition-transform self-start">
                                            Leer Noticia <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </button>
                                    </div>
                                </Link>
                            ))}

                            {/* --- TARJETA FIJA / ESTATICA DE LA LIGA (Siempre visible) --- */}
                            {/* Solo se muestra si no se está filtrando algo que la excluya, o siempre si quieres */}
                            {(filter === 'Todas' || filter === 'Liga Martes') && (
                                <Link to="/liga" className="group flex flex-col bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden hover:border-primary hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 relative">
                                    <div className="relative h-48 overflow-hidden flex items-center justify-center bg-slate-200 dark:bg-slate-900 group-hover:bg-slate-100 transition-colors">
                                        <span className="material-symbols-outlined text-6xl text-slate-400 group-hover:text-primary transition-colors">emoji_events</span>
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-primary text-white text-[10px] font-black uppercase px-2 py-1 rounded">
                                                Martes
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase mb-3">
                                            <span className="material-symbols-outlined text-sm">update</span> Siempre Actualizado
                                        </div>
                                        <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-primary transition-colors">
                                            Tablas de Posiciones
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 flex-1">
                                            Revisa los puntajes, goleadores y programación de la Liga de los Martes.
                                        </p>
                                        <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-primary hover:translate-x-1 transition-transform">
                                            Ver Tablas <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </span>
                                    </div>
                                </Link>
                            )}

                            {(filter === 'Todas' || filter === 'Liga Viernes') && (
                                <Link to="/liga" className="group flex flex-col bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden hover:border-primary hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 relative">
                                    <div className="relative h-48 overflow-hidden flex items-center justify-center bg-slate-200 dark:bg-slate-900 group-hover:bg-slate-100 transition-colors">
                                        <span className="material-symbols-outlined text-6xl text-slate-400 group-hover:text-primary transition-colors">emoji_events</span>
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-primary text-white text-[10px] font-black uppercase px-2 py-1 rounded">
                                                Viernes
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase mb-3">
                                            <span className="material-symbols-outlined text-sm">update</span> Siempre Actualizado
                                        </div>
                                        <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-primary transition-colors">
                                            Tablas de Posiciones
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 flex-1">
                                            Revisa los puntajes, goleadores y programación de la Super Liga de los Viernes.
                                        </p>
                                        <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-primary hover:translate-x-1 transition-transform">
                                            Ver Tablas <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </span>
                                    </div>
                                </Link>
                            )}

                            {/* MENSAJE SI NO HAY NOTICIAS REALES */}
                            {news.length === 0 && (
                                <div className="col-span-full py-10 text-center bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200">
                                    <p className="text-slate-500 font-bold">No hay noticias publicadas aún.</p>
                                    <p className="text-xs text-slate-400 mt-1">Pronto estaremos actualizando nuevo contenido.</p>
                                </div>
                            )}

                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Noticias;