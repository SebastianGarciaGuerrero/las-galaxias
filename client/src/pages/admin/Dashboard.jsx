import { useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { useNavigate } from 'react-router-dom';

import NewsManager from './NewsManager';
import MatchesManager from './MatchesManager';
import LeagueManager from './LeagueManager';

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

                    {/* Botón Resumen */}
                    <button
                        onClick={() => setActiveTab('summary')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-2 ${activeTab === 'summary'
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary border-r-4 border-primary'
                                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                            }`}
                    >
                        📊 Resumen
                    </button>

                    {/* Botón Noticias */}
                    <button
                        onClick={() => setActiveTab('news')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-2 ${activeTab === 'news'
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary border-r-4 border-primary'
                                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                            }`}
                    >
                        📰 Noticias
                    </button>

                    {/* Botón Liga & Goleadores */}
                    <button
                        onClick={() => setActiveTab('league')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-2 ${activeTab === 'league'
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary border-r-4 border-primary'
                                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                            }`}
                    >
                        🏆 Liga & Goleadores
                    </button>

                    {/* Botón Partidos */}
                    <button
                        onClick={() => setActiveTab('matches')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-2 ${activeTab === 'matches'
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary border-r-4 border-primary'
                                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                            }`}
                    >
                        ⚽ Partidos
                    </button>

                </nav>
                <div className="absolute bottom-0 w-64 p-4 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-bold text-sm w-full hover:bg-red-50 dark:hover:bg-red-900/10 p-2 rounded transition-colors">
                        <span className="material-symbols-outlined">logout</span> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 p-8 overflow-y-auto h-screen">
                {/* Renderizado Condicional */}
                {activeTab === 'summary' && (
                    <div className="text-center py-20 flex flex-col items-center justify-center h-full">
                        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">admin_panel_settings</span>
                        <h2 className="text-3xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Bienvenido al Panel</h2>
                        <p className="text-slate-500 mt-2">Selecciona una opción en el menú izquierdo para comenzar a administrar.</p>
                    </div>
                )}

                {activeTab === 'news' && <NewsManager />}
                {activeTab === 'matches' && <MatchesManager />}
                {activeTab === 'league' && <LeagueManager />}

            </main>
        </div>
    );
};

export default Dashboard;