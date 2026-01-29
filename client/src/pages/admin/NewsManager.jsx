import { useState, useEffect } from 'react';

const NewsManager = () => {
    const [news, setNews] = useState([]);
    // Estado inicial del formulario
    const initialForm = { title: '', summary: '', content: '', image_url: '' };
    const [form, setForm] = useState(initialForm);

    // Estados de carga
    const [uploadingImage, setUploadingImage] = useState(false);
    const [submitting, setSubmitting] = useState(false); // Para el botón de "Publicar"

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const res = await fetch(`${API_URL}/api/news`);
            if (res.ok) {
                const data = await res.json();
                setNews(data);
            }
        } catch (error) {
            console.error("Error cargando noticias:", error);
        }
    };

    // 1. Manejo de Subida de Imagen con Feedback
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Error al subir imagen al servidor');

            const data = await res.json();
            setForm({ ...form, image_url: data.url }); // Guardamos la URL
        } catch (error) {
            console.error(error);
            alert("❌ Error subiendo la imagen: " + error.message);
        } finally {
            setUploadingImage(false);
        }
    };

    // 2. Manejo de Publicación (Con estados de carga y errores)
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación previa
        if (!form.image_url) {
            return alert("⚠️ Debes subir una imagen obligatoriamente.");
        }

        setSubmitting(true); // Activar "Cargando..."

        try {
            const res = await fetch(`${API_URL}/api/news`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (!res.ok) {
                // Si el servidor responde con error (ej: 500), lanzamos el mensaje
                throw new Error(data.error || 'Error desconocido en el servidor');
            }

            // ÉXITO
            alert("✅ ¡Noticia publicada correctamente!");
            setForm(initialForm); // Limpiar formulario
            fetchNews(); // Actualizar lista

        } catch (error) {
            console.error("Error al publicar:", error);
            // Mostrar el mensaje real del error
            alert("❌ No se pudo publicar: " + error.message);
        } finally {
            setSubmitting(false); // Desactivar "Cargando..." pase lo que pase
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Seguro que quieres borrar esta noticia?")) return;
        try {
            await fetch(`${API_URL}/api/news/${id}`, { method: 'DELETE' });
            fetchNews();
        } catch (error) {
            alert("Error al eliminar");
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <h2 className="text-2xl font-black uppercase text-slate-800 dark:text-white">Gestor de Noticias</h2>

            {/* FORMULARIO */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg">
                <h3 className="font-bold mb-4 dark:text-white">Nueva Noticia</h3>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        type="text"
                        placeholder="Título Principal"
                        className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        required
                    />

                    <textarea
                        placeholder="Resumen corto (lo que se ve en la tarjeta)"
                        className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        value={form.summary}
                        onChange={e => setForm({ ...form, summary: e.target.value })}
                    />

                    <textarea
                        placeholder="Contenido completo de la noticia..."
                        rows="5"
                        className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        value={form.content}
                        onChange={e => setForm({ ...form, content: e.target.value })}
                        required
                    />

                    {/* SECCIÓN IMAGEN */}
                    <div className="border border-dashed border-slate-300 dark:border-slate-600 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                        <label className="block text-xs font-bold uppercase mb-2 text-slate-500">Imagen de portada (Obligatoria)</label>

                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <input
                                type="file"
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="text-sm dark:text-slate-300 w-full"
                            />

                            {uploadingImage && <span className="text-blue-500 font-bold text-sm animate-pulse">Subiendo... ⏳</span>}

                            {form.image_url && !uploadingImage && (
                                <div className="relative">
                                    <img src={form.image_url} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-slate-200 shadow-sm" />
                                    <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 text-xs shadow">✔</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* BOTÓN DE PUBLICAR */}
                    <button
                        disabled={submitting || uploadingImage}
                        className={`w-full py-3 px-6 rounded-lg font-black uppercase text-white transition-all transform hover:scale-[1.01] 
                            ${(submitting || uploadingImage)
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-primary hover:bg-red-700 shadow-md hover:shadow-lg'
                            }`}
                    >
                        {submitting ? 'Publicando...' : 'Publicar Noticia'}
                    </button>
                </form>
            </div>

            {/* LISTA (Igual que antes) */}
            <div className="grid gap-4">
                {news.map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg flex justify-between items-center border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex gap-4 items-center">
                            {item.image_url && <img src={item.image_url} className="size-16 rounded-md object-cover" />}
                            <div>
                                <h4 className="font-bold dark:text-white text-lg">{item.title}</h4>
                                <span className="text-xs text-slate-500 block mt-1">📅 {new Date(item.publish_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors" title="Borrar">
                            <span className="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewsManager;