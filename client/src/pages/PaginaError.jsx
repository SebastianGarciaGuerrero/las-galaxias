import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

// Página de error del sitio. Por defecto es el 404, pero recibe código,
// título y mensaje por props para poder reutilizarla en otros errores.
//
// La animación es un tiro que se va por arriba del travesaño: la pelota
// sale desde abajo a la izquierda, cruza por encima del arco y se pierde.
// La trayectoria vive en tailwind.config.js (keyframe tiroFallado) y va en
// porcentajes, así escala con el ancho del contenedor.

const ArcoYPelota = () => (
    <div
        className="relative w-full max-w-lg mx-auto aspect-[16/10]"
        role="img"
        aria-label="Un balón sale disparado y se va por encima del arco"
    >
        {/* Arco */}
        <svg
            viewBox="0 0 200 120"
            preserveAspectRatio="none"
            className="absolute left-[48%] right-[4%] top-[30%] bottom-[22%] w-[48%] h-[48%] text-slate-300 dark:text-slate-700"
            aria-hidden="true"
        >
            {/* Red: solo líneas rectas, porque el SVG se estira y las diagonales
                se deformarían. */}
            <g stroke="currentColor" strokeWidth="1" opacity="0.55">
                {[20, 40, 60, 80, 100, 120, 140, 160, 180].map(x => (
                    <line key={`v${x}`} x1={x} y1="6" x2={x} y2="120" />
                ))}
                {[24, 48, 72, 96].map(y => (
                    <line key={`h${y}`} x1="6" y1={y} x2="194" y2={y} />
                ))}
            </g>
            {/* Palos y travesaño */}
            <g fill="currentColor">
                <rect x="0" y="0" width="200" height="7" rx="3" />
                <rect x="0" y="0" width="7" height="120" rx="3" />
                <rect x="193" y="0" width="7" height="120" rx="3" />
            </g>
        </svg>

        {/* Suelo */}
        <div className="absolute left-0 right-0 bottom-[22%] h-px bg-slate-200 dark:bg-slate-800" />

        {/* Pelota */}
        {/* La posición base es el punto de partida: si el usuario pidió menos
            movimiento, la animación se apaga y la pelota queda ahí quieta. */}
        <div className="absolute size-[7%] left-[4%] top-[80%] -translate-x-1/2 -translate-y-1/2 animate-tiroFallado motion-reduce:animate-none">
            <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-md" aria-hidden="true">
                <circle cx="16" cy="16" r="15" className="fill-white" />
                <circle cx="16" cy="16" r="15" className="fill-none stroke-slate-900" strokeWidth="1.5" />
                <path
                    d="M16 7l5 3.6-1.9 5.9h-6.2L11 10.6z M16 7V2 M21 10.6l4.8-1.6 M19.1 16.5l3 4.1 M12.9 16.5l-3 4.1 M11 10.6L6.2 9"
                    className="fill-slate-900 stroke-slate-900"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    </div>
);

const PaginaError = ({
    codigo = '404',
    titulo = 'La tiraste afuera.',
    mensaje = 'Esta página no existe, o se fue por encima del travesaño. Puede que el enlace esté viejo o que la dirección tenga un error de tipeo.',
}) => (
    <>
        <SEO
            title="Página no encontrada"
            description="La página que buscas no existe en el sitio del Club Deportivo Las Galaxias."
            url="https://lasgalaxias.cl"
        />
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center px-5 sm:px-6 lg:px-8 pt-24 pb-16">
            <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                <div className="order-2 lg:order-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary block mb-4">
                        Error {codigo}
                    </span>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.05] mb-5">
                        {titulo}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed max-w-md mb-8">
                        {mensaje}
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 bg-primary text-white text-[11px] font-black uppercase tracking-[0.15em] px-6 py-3 rounded-full hover:scale-105 transition-transform"
                        >
                            <span className="material-symbols-outlined text-base">home</span>
                            Volver al inicio
                        </Link>
                        <Link
                            to="/liga"
                            className="inline-flex items-center gap-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-black uppercase tracking-[0.15em] px-6 py-3 rounded-full hover:border-primary hover:text-primary transition-colors"
                        >
                            Ver las ligas
                        </Link>
                    </div>
                </div>

                <div className="order-1 lg:order-2">
                    <ArcoYPelota />
                    <p className="text-center text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 mt-2">
                        Afuera por poco
                    </p>
                </div>

            </div>
        </div>
    </>
);

export default PaginaError;
