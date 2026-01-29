import { useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { useNavigate } from 'react-router-dom';

import NewsManager from './NewsManager';

const Dashboard = () => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('summary');

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin');
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex">
            {/* Sidebar (Menú Lateral) */}
            <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden md:block">
                <div className="p-6">
                    <h2 className="font-black uppercase text-xl text-primary">Panel Admin</h2>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <button className="w-full text-left px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-lg font-bold text-slate-900 dark:text-white">
                        📊 Resumen
                    </button>
                    <button onClick={() => setActiveTab('news')} className={`w-full text-left px-4 py-3 rounded-lg font-bold transition-colors ${activeTab === 'news' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                        📰 Noticias
                    </button>
                    <button className="w-full text-left px-4 py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors font-medium">
                        🏆 Liga & Goleadores
                    </button>
                    <button className="w-full text-left px-4 py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors font-medium">
                        ⚽ Partidos
                    </button>
                </nav>
                <div className="absolute bottom-0 w-64 p-4 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-bold text-sm">
                        <span className="material-symbols-outlined">logout</span> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 p-8 overflow-y-auto h-screen">
                {/* Renderizado Condicional */}
                {activeTab === 'summary' && (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-black text-slate-300">Bienvenido al Panel</h2>
                        <p>Selecciona una opción a la izquierda.</p>
                    </div>
                )}

                {activeTab === 'news' && <NewsManager />}

            </main>
        </div>
    );
};

export default Dashboard;