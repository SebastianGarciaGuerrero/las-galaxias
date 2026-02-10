import { useState, useEffect } from 'react';

const MatchesManager = () => {
    const [matches, setMatches] = useState([]);
    const [form, setForm] = useState({
        category: 'tc',
        rival: '',
        is_local: true,
        date: '',
        location: '',
        address: '',
        indications: '',
        status: 'Próximo',
        competition: '',     // NUEVO
        home_score: 0,       // NUEVO
        away_score: 0        // NUEVO
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => { fetchMatches(); }, []);

    const fetchMatches = async () => {
        try {
            const res = await fetch(`${API_URL}/api/matches`);
            const data = await res.json();
            setMatches(data);
        } catch (error) { console.error(error); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/matches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                alert("⚽ Partido guardado!");
                setForm({ ...form, rival: '', location: '', address: '', indications: '', home_score: 0, away_score: 0 });
                fetchMatches();
            }
        } catch (error) { alert("Error al guardar"); }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Borrar?")) return;
        await fetch(`${API_URL}/api/matches/${id}`, { method: 'DELETE' });
        fetchMatches();
    };

    return (
        <div className="space-y-8 pb-20">
            <h2 className="text-2xl font-black uppercase text-slate-800 dark:text-white">Administrar Partidos</h2>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* FILA 1: Categoría y Estado */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Categoría</label>
                            <select className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white font-bold"
                                value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                <option value="tc">Todo Competidor</option>
                                <option value="seniors">Seniors +35</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Estado del Partido</label>
                            <select className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white font-bold bg-yellow-50 dark:bg-yellow-900/20"
                                value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                <option value="Próximo">Próximo (Por Jugar)</option>
                                <option value="Finalizado">Finalizado (Ya se jugó)</option>
                                <option value="Suspendido">Suspendido</option>
                            </select>
                        </div>
                    </div>

                    {/* FILA 2: Competición y Rival */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Competición (Ej: Amistoso, Copa de Oro)"
                            className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            value={form.competition} onChange={e => setForm({ ...form, competition: e.target.value })} />

                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-500">RIVAL:</span>
                            <input type="text" placeholder="Nombre del Equipo Rival"
                                className="flex-1 p-2 rounded border dark:bg-slate-800 dark:border-slate-700 dark:text-white font-bold"
                                value={form.rival} onChange={e => setForm({ ...form, rival: e.target.value })} required />
                        </div>
                    </div>

                    {/* ZONA DE MARCADOR (SOLO APARECE SI ESTÁ FINALIZADO) */}
                    {form.status === 'Finalizado' && (
                        <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg border-2 border-slate-300 dark:border-slate-600 animate-fade-in">
                            <p className="text-center text-xs font-black uppercase text-slate-500 mb-2">Ingresar Resultado Final</p>
                            <div className="flex justify-center items-center gap-4">
                                <div className="text-center">
                                    <p className="text-xs font-bold mb-1">{form.is_local ? 'GALAXIAS' : form.rival}</p>
                                    <input type="number" className="w-16 h-12 text-center text-2xl font-black rounded border dark:bg-slate-800 dark:text-white"
                                        value={form.home_score} onChange={e => setForm({ ...form, home_score: e.target.value })} />
                                </div>
                                <span className="text-2xl font-black text-slate-400">-</span>
                                <div className="text-center">
                                    <p className="text-xs font-bold mb-1">{form.is_local ? form.rival : 'GALAXIAS'}</p>
                                    <input type="number" className="w-16 h-12 text-center text-2xl font-black rounded border dark:bg-slate-800 dark:text-white"
                                        value={form.away_score} onChange={e => setForm({ ...form, away_score: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Resto del formulario (Localía, Fecha, Lugar) */}
                    <div className="flex justify-center gap-6 text-sm py-2">
                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={form.is_local} onChange={() => setForm({ ...form, is_local: true })} /> Somos Local</label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={!form.is_local} onChange={() => setForm({ ...form, is_local: false })} /> Somos Visita</label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="datetime-local" className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                        <input type="text" placeholder="Lugar / Estadio" className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                            value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
                    </div>

                    <input type="text" placeholder="Dirección exacta" className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />

                    <textarea placeholder="Indicaciones DT..." className="w-full p-2 rounded border dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                        value={form.indications} onChange={e => setForm({ ...form, indications: e.target.value })} />

                    <button className="w-full bg-primary text-white py-3 rounded-lg font-black uppercase hover:bg-red-700 transition-colors shadow-md">
                        {form.status === 'Finalizado' ? 'Guardar Resultado' : 'Programar Partido'}
                    </button>
                </form>
            </div>

            {/* Lista simple abajo */}
            <div className="space-y-2">
                {matches.map(m => (
                    <div key={m.id} className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded border">
                        <span className="text-sm font-bold dark:text-white">
                            {m.is_local ? 'GALAXIAS' : m.rival} vs {m.is_local ? m.rival : 'GALAXIAS'}
                            <span className="text-slate-400 font-normal ml-2">({m.status})</span>
                        </span>
                        <button onClick={() => handleDelete(m.id)} className="text-red-500 material-symbols-outlined">delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MatchesManager;