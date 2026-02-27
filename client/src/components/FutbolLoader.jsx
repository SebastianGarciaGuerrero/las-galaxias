const FutbolLoader = ({ texto = "Entrando a la cancha..." }) => {
    return (
        // Quitamos el bg sólido y el min-h-screen. 
        // Usamos h-[50vh] para que tome una altura prudente sin romper el diseño.
        <div className="flex flex-col items-center justify-center w-full h-[50vh] min-h-[300px] gap-4 animate-fade-in">
            <span className="material-symbols-outlined text-6xl text-primary animate-spin">
                sports_soccer
            </span>
            <span className="text-slate-400 font-black uppercase tracking-widest text-sm animate-pulse">
                {texto}
            </span>
        </div>
    );
};

export default FutbolLoader;