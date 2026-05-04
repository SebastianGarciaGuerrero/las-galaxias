import { Link } from 'react-router-dom';
import logoColor from '../assets/logoLGColor.svg';
import logoClaro from '../assets/logo.svg';

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
            <div className="bg-white dark:bg-black px-8 md:px-14 lg:px-20 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-10 border-t border-slate-100 dark:border-white/10">

                {/* Izquierda: logo + tagline + descripción */}
                <div className="flex flex-col gap-1">
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
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mt-0.5">
                        Pasión, disciplina y familia.<br />
                        Formando deportistas y personas de bien desde <strong className="text-slate-800 dark:text-slate-200">2017.</strong>
                    </p>
                </div>

                {/* Centro: navegación */}
                <nav className="flex items-center gap-8 md:gap-12">
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
                    >
                        <svg viewBox="0 0 24 24" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
                                    <stop offset="0%" stopColor="#fdf497" />
                                    <stop offset="5%" stopColor="#fdf497" />
                                    <stop offset="45%" stopColor="#fd5949" />
                                    <stop offset="60%" stopColor="#d6249f" />
                                    <stop offset="90%" stopColor="#285AEB" />
                                </radialGradient>
                            </defs>
                            <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
                            <path fill="white" d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 1 0 12 7.2Zm0 7.92A3.12 3.12 0 1 1 12 8.88 3.12 3.12 0 0 1 12 15.12Zm4.992-8.16a1.12 1.12 0 1 1-2.24 0 1.12 1.12 0 0 1 2.24 0Zm3.18 1.137c-.071-1.496-.413-2.821-1.508-3.912C17.579 3.097 16.254 2.755 14.758 2.68c-1.541-.088-6.16-.088-7.702 0C5.562 2.751 4.237 3.093 3.143 4.184 2.048 5.275 1.71 6.6 1.635 8.096c-.088 1.541-.088 6.16 0 7.701.075 1.497.413 2.821 1.508 3.912 1.095 1.091 2.419 1.433 3.915 1.508 1.541.088 6.16.088 7.701 0 1.497-.075 2.822-.413 3.912-1.508 1.091-1.091 1.433-2.415 1.508-3.912.088-1.541.088-6.156 0-7.697Zm-2.002 9.35a3.16 3.16 0 0 1-1.781 1.781c-1.233.489-4.159.376-5.52.376s-4.292.108-5.52-.376a3.16 3.16 0 0 1-1.782-1.78c-.489-1.233-.376-4.159-.376-5.52s-.108-4.292.376-5.52A3.16 3.16 0 0 1 6.349 4.77c1.233-.489 4.159-.376 5.52-.376s4.292-.108 5.52.376a3.16 3.16 0 0 1 1.781 1.78c.489 1.233.376 4.159.376 5.52s.113 4.292-.376 5.52Z"/>
                        </svg>
                    </a>

                    {/* YouTube */}
                    <a
                        href="https://www.youtube.com/@CDGalaxias"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="YouTube"
                    >
                        <svg viewBox="0 0 24 24" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                            <rect width="24" height="24" rx="6" fill="#FF0000" />
                            <path fill="white" d="M19.59 7.13a2.01 2.01 0 0 0-1.41-1.42C16.76 5.4 12 5.4 12 5.4s-4.76 0-6.18.34A2.01 2.01 0 0 0 4.41 7.13 21.1 21.1 0 0 0 4.07 12a21.1 21.1 0 0 0 .34 4.87 2.01 2.01 0 0 0 1.41 1.41C7.24 18.6 12 18.6 12 18.6s4.76 0 6.18-.34a2.01 2.01 0 0 0 1.41-1.41A21.1 21.1 0 0 0 19.93 12a21.1 21.1 0 0 0-.34-4.87ZM10.18 14.72V9.28L14.91 12l-4.73 2.72Z"/>
                        </svg>
                    </a>
                </div>
            </div>

            {/* ── Barra inferior ── */}
            <div className="bg-primary px-8 md:px-14 lg:px-20 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                    © {currentYear} Club Deportivo Las Galaxias.
                </p>
                <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em]">
                    Desarrollado X{' '}
                    <a
                        href="https://sebastiangarcia.cl"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:underline"
                    >
                        SebastianGarcia.cl
                    </a>
                </p>
            </div>

        </footer>
    );
};

export default Footer;
