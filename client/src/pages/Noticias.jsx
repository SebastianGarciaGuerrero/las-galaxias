import { useState } from 'react';
import { Link } from 'react-router-dom';

const Noticias = () => {
    // CATEGORÍAS PARA FILTRAR
    const [filter, setFilter] = useState('Todas');
    const categories = ['Todas', 'Primer Equipo', 'Liga Martes', 'Liga Viernes', 'Social'];

    // BASE DE DATOS MOCK DE NOTICIAS
    const newsData = [
        {
            id: 1,
            title: "Gran Final: Galaxias vs Cosmos este Sábado",
            category: "Primer Equipo",
            date: "26 Oct, 2023",
            excerpt: "Se define el campeonato en una jornada que promete ser histórica. El estadio abrirá sus puertas desde las 17:00 hrs.",
            image: "https://images.unsplash.com/photo-1574629810360-7efbbe4384d4?q=80&w=2660&auto=format&fit=crop",
            author: "Prensa Galáctica",
            featured: true // Esta es la noticia principal
        },
        {
            id: 2,
            title: "Conoce a los Peumos: Guardianes del Bosque",
            category: "Liga Martes",
            date: "24 Oct, 2023",
            excerpt: "En nuestra sección educativa, profundizamos en la importancia del Peumo en la quebrada de la zona central.",
            image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop",
            author: "Comité Ambiental",
            featured: false
        },
        {
            id: 3,
            title: "Resultados Fecha 5: SuperLiga de Viernes",
            category: "Liga Viernes",
            date: "22 Oct, 2023",
            excerpt: "Nebula Utd da la sorpresa y baja al puntero. Revisa todos los marcadores y la tabla actualizada.",
            image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=2560&auto=format&fit=crop",
            author: "Estadísticas CDLG",
            featured: false
        },
        {
            id: 4,
            title: "Campaña de Invierno: Éxito Total",
            category: "Social",
            date: "20 Oct, 2023",
            excerpt: "Gracias a los socios, logramos reunir más de 500 prendas para los vecinos del barrio.",
            image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop",
            author: "Directiva",
            featured: false
        },
        {
            id: 5,
            title: "Entrenamiento a Puertas Abiertas",
            category: "Primer Equipo",
            date: "18 Oct, 2023",
            excerpt: "Ven a apoyar al plantel antes del clásico. Habrá firma de autógrafos y sorteos.",
            image: "https://images.unsplash.com/photo-1518605348400-437731db680b?q=80&w=2070&auto=format&fit=crop",
            author: "Prensa Galáctica",
            featured: false
        },
    ];

    // Lógica de Filtrado
    const filteredNews = filter === 'Todas'
        ? newsData
        : newsData.filter(n => n.category === filter);

    // Separar la destacada del resto (solo si estamos en 'Todas', si no, mostramos lista normal)
    const featuredArticle = newsData.find(n => n.featured);
    const listArticles = filter === 'Todas'
        ? filteredNews.filter(n => !n.featured)
        : filteredNews;

    return (
        <div className="w-full animate-fade-in pb-20">

            {/* HEADER DE SECCIÓN */}
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

                {/* NOTICIA DESTACADA (HERO) - Solo se ve si el filtro es "Todas" */}
                {filter === 'Todas' && featuredArticle && (
                    <div className="mb-12 group relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-2xl shadow-2xl cursor-pointer">
                        <img
                            src={featuredArticle.image}
                            alt={featuredArticle.title}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full md:w-2/3">
                            <span className="bg-primary text-white text-xs font-black uppercase px-2 py-1 rounded mb-3 inline-block">
                                {featuredArticle.category}
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black text-white uppercase leading-tight mb-4 drop-shadow-lg">
                                {featuredArticle.title}
                            </h2>
                            <p className="text-slate-200 text-lg line-clamp-2 mb-6 hidden md:block">
                                {featuredArticle.excerpt}
                            </p>
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <span>{featuredArticle.date}</span>
                                <span>•</span>
                                <span>Por {featuredArticle.author}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* GRILLA DE NOTICIAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {listArticles.map((news) => (
                        <article key={news.id} className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all duration-300">
                            {/* Imagen Card */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={news.image}
                                    alt={news.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-slate-900 text-white text-[10px] font-black uppercase px-2 py-1 rounded">
                                        {news.category}
                                    </span>
                                </div>
                            </div>

                            {/* Contenido Card */}
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase mb-3">
                                    <span className="material-symbols-outlined text-sm">calendar_month</span> {news.date}
                                </div>
                                <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-primary transition-colors">
                                    {news.title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 flex-1">
                                    {news.excerpt}
                                </p>
                                <Link
                                    to="#"
                                    className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-primary hover:translate-x-1 transition-transform"
                                >
                                    Leer Noticia <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Noticias;