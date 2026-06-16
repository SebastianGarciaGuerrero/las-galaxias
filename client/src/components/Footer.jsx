import { Link } from 'react-router-dom';
import logoColor from '../assets/logoLGColor.svg';
import logoClaro from '../assets/logo.svg';
import Instagram from './icons/Instagram';
import Youtube from './icons/Youtube';

const NAV_LINKS = [
    { label: 'Nosotros', to: '/sobre-nosotros' },
    { label: 'Ligas',    to: '/liga' },
    { label: 'Academia', to: '/academia' },
    { label: 'Colabora', to: '/sobre-nosotros' },
];

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer>

            {/* ── Área principal ── */}
            <div className="bg-white dark:bg-black px-8 md:px-14 lg:px-20 py-10 flex flex-col items-center md:flex-row md:items-center justify-between gap-10">

                {/* Izquierda: logo + tagline + descripción */}
                <div className="flex flex-col items-center md:items-start gap-1">
                    <Link to="/">
                        <img
                            src={logoColor}
                            alt="CD Las Galaxias"
                            className="h-10 w-auto object-contain block dark:hidden"
                        />
                        <img
                            src={logoClaro}
                            alt="CD Las Galaxias"
                            className="h-10 w-auto object-contain hidden dark:block"
                        />
                    </Link>
                    <span className="text-primary text-sm font-medium mt-1">Fútbol &amp; Conciencia</span>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mt-0.5 text-center md:text-left">
                        Pasión, disciplina y familia.<br />
                        Formando deportistas y personas de bien desde <strong className="text-slate-800 dark:text-slate-200">2017.</strong>
                    </p>
                </div>

                {/* Centro: navegación */}
                <nav className="flex flex-col md:flex-row items-center gap-3 md:gap-12">
                    {NAV_LINKS.map(({ label, to }) => (
                        <Link
                            key={to}
                            to={to}
                            className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-800 dark:text-white hover:text-primary dark:hover:text-primary transition-colors"
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* Derecha: redes sociales */}
                <div className="flex items-center gap-4">
                    {/* Instagram */}
                    <a
                        href="https://www.instagram.com/cdgalaxias/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="grayscale hover:grayscale-0 hover:scale-110 transition-all"
                    >
                        <Instagram size={24} />
                    </a>

                    {/* YouTube */}
                    <a
                        href="https://www.youtube.com/@CDGalaxias"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="YouTube"
                        className="grayscale hover:grayscale-0 hover:scale-110 transition-all"
                    >
                        <Youtube size={24} />
                    </a>
                </div>
            </div>

            {/* ── Barra inferior ── */}
            <div className="bg-white dark:bg-zinc-900 px-8 md:px-14 lg:px-20 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="text-black dark:text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                    © {currentYear} Club Deportivo Las Galaxias.
                </p>
                <p className="text-black dark:text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                    Desarrollado X{' '}
                    <a
                        href="https://sebastiangarcia.cl"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                    >
                        SebastianGarcia.cl
                    </a>
                </p>
            </div>

        </footer>
    );
};

export default Footer;
