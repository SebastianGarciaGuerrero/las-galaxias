import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import FutbolLoader from '../components/FutbolLoader'; // Tu súper componente

const NoticiaDetalle = () => {
    const { id } = useParams(); // Saca el ID de la URL (ej: /noticias/5)
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch(`${API_URL}/api/news/${id}`);
                if (!res.ok) throw new Error('Noticia no encontrada');
                const data = await res.json();
                setNews(data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [id]);

    // ==========================================
    // EL TRUCO DE MAGIA PARA LAS FOTOS INTERMEDIAS
    // ==========================================
    const renderizarContenido = (texto) => {
        if (!texto) return null;

        // Separa el texto por cada salto de línea (Enter)
        return texto.split('\n').map((parrafo, index) => {
            const textoLimpio = parrafo.trim();

            // Si el párrafo es una etiqueta de imagen nuestra...
            if (textoLimpio.startsWith('[IMG]') && textoLimpio.endsWith('[/IMG]')) {
                // Extraemos solo el link de Cloudinary
                const url = textoLimpio.replace('[IMG]', '').replace('[/IMG]', '').trim();
                return (
                    <img
                        key={index}
                        src={url}
                        alt="Imagen adjunta"
                        className="w-full max-h-[500px] object-cover rounded-2xl shadow-lg my-8 hover:scale-[1.02] transition-transform duration-500"
                    />
                );
            }

            // Si el párrafo está vacío (doble enter), hacemos un espacio
            if (textoLimpio === '') {
                return <br key={index} />;
            }

            // Si es texto normal, lo mostramos como párrafo
            return (
                <p key={index} className="text-lg text-slate-700 dark:text-slate-300 mb-6 leading-relaxed font-medium">
                    {textoLimpio}
                </p>
            );
        });
    };

    if (loading) return <FutbolLoader texto="Buscando la nota..." />;

    if (!news) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
                <span className="material-symbols-outlined text-6xl text-slate-400 mb-4">newspaper</span>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase">Noticia no encontrada</h2>
                <Link to="/" className="mt-4 text-primary font-bold hover:underline">Volver al inicio</Link>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-20 animate-fade-in">

            {/* Cabecera (Hero de la noticia) */}
            <div className="relative h-[50vh] min-h-[400px] flex items-end pb-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-10"></div>
                <img
                    src={news.image_url || 'https://via.placeholder.com/1200x600'}
                    alt={news.title}
                    className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="relative z-20 max-w-[900px] mx-auto px-4 w-full">
                    <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 text-sm font-bold uppercase tracking-widest transition-colors">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Volver
                    </Link>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-primary text-white text-xs font-black uppercase px-3 py-1 rounded-full tracking-widest">
                            {news.category}
                        </span>
                        <span className="text-white/80 text-sm font-bold">
                            {new Date(news.publish_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight uppercase">
                        {news.title}
                    </h1>
                </div>
            </div>

            {/* Contenido de la noticia */}
            <div className="max-w-[900px] mx-auto px-4 py-12">

                {/* Resumen en negrita */}
                {news.summary && (
                    <div className="mb-10 p-6 bg-white dark:bg-slate-800 rounded-2xl border-l-4 border-primary shadow-sm">
                        <p className="text-xl font-black text-slate-800 dark:text-white italic">
                            "{news.summary}"
                        </p>
                    </div>
                )}

                {/* Cuerpo principal donde ocurre la magia de las imágenes */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                    {renderizarContenido(news.content)}
                </div>

                {/* Footer del artículo */}
                <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">edit_document</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Escrito por</p>
                            <p className="font-black text-slate-900 dark:text-white">Club Las Galaxias</p>
                        </div>
                    </div>

                    {/* Botones de compartir (simulados) */}
                    <div className="flex gap-2">
                        <button className="size-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-sm">share</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoticiaDetalle;