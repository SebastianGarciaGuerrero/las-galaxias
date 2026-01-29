import { useState, useEffect } from 'react';

const NewsManager = () => {
    const [news, setNews] = useState([]);
    const [form, setForm] = useState({ title: '', summary: '', content: '', image_url: '' });
    const [uploading, setUploading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Cargar noticias al iniciar
    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        const res = await fetch(`${API_URL}/api/news`);
        const data = await res.json();
        setNews(data);
    };

    // Subir imagen a Cloudinary
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            // Guardamos la URL que nos devuelve Cloudinary en el formulario
            setForm({ ...form, image_url: data.url });
        } catch (error) {
            console.error("Error subiendo imagen:", error);
            alert("Error al subir imagen");
        } finally {
            setUploading(false);
        }
    };

    // Guardar Noticia
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/news`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                alert("¡Noticia Creada!");
                setForm({ title: '', summary: '', content: '', image_url: '' }); // Limpiar form
                fetchNews(); // Recargar lista
            }
        } catch (error) {
            alert("Error guardando noticia");
        }
    };

    // Borrar Noticia
    const handleDelete = async (id) => {
        if (!confirm("¿Seguro que quieres borrar esta noticia?")) return;

        await fetch(`${API_URL}/api/news/${id}`, { method: 'DELETE' });
        fetchNews();
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-black uppercase text-slate-800 dark:text-white">Gestor de Noticias</h2>

            {/* FORMULARIO DE CREACIÓN */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg">
                <h3 className="font-bold mb-4 dark:text-white">Nueva Noticia</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Título"
                        className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        required
                    />
                    <textarea
                        placeholder="Resumen corto (para la tarjeta)"
                        className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        value={form.summary}
                        onChange={e => setForm({ ...form, summary: e.target.value })}
                    />
                    <textarea
                        placeholder="Contenido completo..."
                        rows="5"
                        className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        value={form.content}
                        onChange={e => setForm({ ...form, content: e.target.value })}
                        required
                    />

                    {/* INPUT DE IMAGEN */}
                    <div className="flex items-center gap-4">
                        <input type="file" onChange={handleImageUpload} className="text-sm dark:text-slate-300" />
                        {uploading && <span className="text-primary font-bold text-xs">Subiendo...</span>}
                        {form.image_url && <img src={form.image_url} alt="Preview" className="h-12 w-12 object-cover rounded" />}
                    </div>

                    <button disabled={uploading} className="bg-primary text-white px-6 py-2 rounded font-black uppercase hover:bg-red-700 transition-colors w-full">
                        {uploading ? 'Espere...' : 'Publicar Noticia'}
                    </button>
                </form>
            </div>

            {/* LISTA DE NOTICIAS EXISTENTES */}
            <div className="grid gap-4">
                {news.map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg flex justify-between items-center border border-slate-200 dark:border-slate-700">
                        <div className="flex gap-4 items-center">
                            {item.image_url && <img src={item.image_url} className="size-12 rounded object-cover" />}
                            <div>
                                <h4 className="font-bold dark:text-white">{item.title}</h4>
                                <span className="text-xs text-slate-500">{new Date(item.publish_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                            <span className="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewsManager;