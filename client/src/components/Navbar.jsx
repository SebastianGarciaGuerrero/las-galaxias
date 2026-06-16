import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logoColor from '../assets/logoLGColor.svg';
import logoClaro from '../assets/logo.svg';

const NAV_LINKS = [
    { label: 'Nosotros', to: '/sobre-nosotros' },
    { label: 'Ligas',    to: '/liga' },
    { label: 'Academia', to: '/academia' },
    { label: 'Colabora', to: '/sobre-nosotros' },
];

const Navbar = () => {
    const { pathname } = useLocation();
    const isHome = pathname === '/';

    const [theme, setTheme] = useState(() =>
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 5);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    const openMenu = () => setIsMenuOpen(true);

    const closeMenu = () => {
            setIsClosing(true);
        setTimeout(() => {
            setIsMenuOpen(false);
            setIsClosing(false);
        }, 400);
    };

    return (
        <>
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled || !isHome
                    ? 'bg-white/95 dark:bg-black/95 backdrop-blur-md'
                    : 'bg-transparent'
            }`}
        >
            <div className="max-w-6xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16 md:h-18">

                {/* Logo */}
                <Link to="/" className="flex-shrink-0">
                    <img
                        src={scrolled ? logoColor : logoColor}
                        alt="CD Las Galaxias"
                        className="h-6 w-auto object-contain block dark:hidden"
                    />
                    <img
                        src={logoClaro}
                        alt="CD Las Galaxias"
                        className="h-6 w-auto object-contain hidden dark:block"
                    />
                </Link>

                {/* Nav desktop */}
                <nav className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map(({ label, to }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`text-[11px] font-bold uppercase tracking-[0.18em] transition-colors hover:text-primary ${
                                scrolled || !isHome
                                    ? 'text-black dark:text-white'
                                    : 'text-white'
                            }`}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* Acciones derecha */}
                <div className="flex items-center gap-2">
                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        aria-label="Cambiar tema"
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all active:scale-90 hover:opacity-80 ${
                            theme === 'dark' ? 'bg-primary' : 'bg-amber-400'
                        }`}
                    >
                        <span className="material-symbols-outlined text-white text-[16px] md:text-[20px] leading-none">
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>

                    {/* Hamburguesa móvil (solo cuando el menú está cerrado) */}
                    {!isMenuOpen && !isClosing && (
                        <button
                            onClick={openMenu}
                            className={`md:hidden flex flex-col items-center justify-center w-8 h-8 ${
                                scrolled || !isHome
                                    ? 'text-black dark:text-white'
                                    : 'text-white'
                            }`}
                            aria-label="Abrir menú"
                        >
                            <span className="block w-5 h-[2.5px] mb-[4px] bg-current rounded-sm" />
                            <span className="block w-5 h-[2.5px] mb-[4px] bg-current rounded-sm" />
                            <span className="block w-5 h-[2.5px] bg-current rounded-sm" />
                        </button>
                    )}
                </div>
            </div>

        </header>

            {/* Menú móvil desplegable */}
            {isMenuOpen && (
                <div className={`md:hidden fixed inset-0 bg-white dark:bg-black z-50 flex flex-col items-center justify-center ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
                    <button
                        onClick={closeMenu}
                        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center z-[60] text-black dark:text-white"
                        aria-label="Cerrar menú"
                    >
                        <span className="block w-6 h-[3px] bg-current rounded-sm absolute rotate-45" />
                        <span className="block w-6 h-[3px] bg-current rounded-sm absolute -rotate-45" />
                    </button>
                    <nav className="flex flex-col items-center gap-8">
                        {NAV_LINKS.map(({ label, to }, i) => (
                            <Link
                                key={to}
                                to={to}
                                onClick={closeMenu}
                                className={`text-slate-900 dark:text-white text-4xl font-black uppercase tracking-widest hover:text-primary transition-colors ${isClosing ? 'animate-slideDown' : 'opacity-0 translate-y-5 animate-slideUp'}`}
                                style={{ animationDelay: `${isClosing ? 0 : i * 0.2}s` }}
                            >
                                {label}
                            </Link>
                        ))}
                        <a
                            href="https://www.instagram.com/cdgalaxias/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`mt-10 ${isClosing ? 'animate-slideDown' : 'opacity-0 translate-y-5 animate-slideUp'}`}
                            style={{ animationDelay: `${isClosing ? 0 : NAV_LINKS.length * 0.2}s` }}
                        >
                            <img
                                src={logoColor}
                                alt="CD Las Galaxias"
                                className="h-5 w-auto object-contain block dark:hidden"
                            />
                            <img
                                src={logoColor}
                                alt="CD Las Galaxias"
                                className="h-5 w-auto object-contain hidden dark:block"
                            />
                        </a>
                    </nav>
                </div>
            )}
        </>
    );
};

export default Navbar;
