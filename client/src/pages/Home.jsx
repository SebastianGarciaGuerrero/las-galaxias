import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col items-center flex-1 w-full animate-fade-in">

            {/* Hero Section */}
            <div className="w-full max-w-[1280px] p-4 md:p-8">
                <div
                    className="flex min-h-[520px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-center justify-center p-8 text-center relative overflow-hidden group"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=2560&auto=format&fit=crop")' }}
                >
                    {/* Overlay manual para asegurar legibilidad */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 z-0"></div>

                    <div className="relative z-10 flex flex-col gap-4 max-w-2xl">
                        <span className="bg-primary px-3 py-1 rounded text-white text-xs font-bold w-fit mx-auto tracking-widest uppercase shadow-lg shadow-primary/50">Sitio Oficial</span>
                        <h1 className="text-white text-5xl md:text-7xl font-black leading-tight tracking-tighter uppercase italic drop-shadow-lg">
                            Pasión por el Juego
                        </h1>
                        <p className="text-slate-200 text-lg md:text-xl font-light">
                            Bienvenidos al Club Deportivo Las Galaxias. Forjando leyendas desde el barrio para el mundo.
                        </p>
                    </div>
                    <div className="relative z-10 flex flex-wrap gap-4 justify-center mt-4">
                        <Link to="/partidos" className="flex min-w-[160px] items-center justify-center rounded-lg h-12 px-6 bg-primary text-white text-base font-black uppercase tracking-wider hover:bg-red-700 transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1">
                            Entradas
                        </Link>
                        <button className="flex min-w-[160px] items-center justify-center rounded-lg h-12 px-6 bg-white text-slate-900 text-base font-black uppercase tracking-wider hover:bg-slate-200 transition-colors">
                            Tienda
                        </button>
                    </div>
                </div>
            </div>

            {/* Match Countdown Section */}
            <div className="w-full max-w-[960px] px-4 py-8">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-900 dark:bg-black p-4 flex justify-between items-center text-white border-b border-slate-800">
                        <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">event</span> Próximo Encuentro
                        </h2>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estadio Galáctico</span>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-around py-8 px-6 gap-8">
                        {/* Team A */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-primary">
                                <span className="material-symbols-outlined text-4xl text-primary">auto_awesome</span>
                            </div>
                            <span className="font-black uppercase tracking-tighter text-lg dark:text-white">Galaxias</span>
                        </div>
                        <div className="text-2xl font-black italic text-slate-300">VS</div>
                        {/* Team B */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-300 dark:border-slate-600">
                                <span className="material-symbols-outlined text-4xl text-slate-500">shield</span>
                            </div>
                            <span className="font-black uppercase tracking-tighter text-lg dark:text-white">Rival CF</span>
                        </div>
                        {/* Timer Mockup */}
                        <div className="flex gap-3 md:border-l dark:border-slate-800 md:pl-10">
                            {['03 Días', '14 Horas', '25 Min'].map((time, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-1">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-800 text-white font-bold text-xl border border-slate-700">
                                        {time.split(' ')[0]}
                                    </div>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase">{time.split(' ')[1]}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Latest News Section */}
            <div className="w-full max-w-[1280px] px-4 md:px-8 py-10">
                <div className="flex items-center justify-between mb-8 px-4 border-l-4 border-primary">
                    <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Últimas Noticias</h2>
                    <Link to="/noticias" className="text-primary font-bold uppercase text-sm flex items-center gap-1 hover:underline">
                        Ver todo <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card Mockup Function */}
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-xl transition-all hover:border-primary/50">
                            <div className="relative h-48 w-full overflow-hidden">
                                <div className="h-full w-full bg-slate-300 dark:bg-slate-800 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-400">image</span>
                                </div>
                                <div className="absolute top-4 left-4">
                                    <span className="bg-primary text-white text-[10px] font-black uppercase px-2 py-1 rounded">Equipo</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-slate-500 text-xs font-bold mb-2">22 OCT, 2023</p>
                                <h3 className="text-xl font-black uppercase mb-3 text-slate-900 dark:text-white group-hover:text-primary transition-colors">Triunfo Histórico</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4">
                                    Las Galaxias dominaron el encuentro de principio a fin, asegurando tres puntos vitales...
                                </p>
                                <button className="text-primary font-black uppercase text-xs tracking-widest hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                    Leer Más <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;