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

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 5);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                scrolled || !isHome
                    ? 'bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-slate-200/60 dark:border-white/10'
                    : 'bg-transparent'
            }`}
        >
            <div className="max-w-6xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16 md:h-18">

                {/* Logo */}
                <Link to="/" className="flex-shrink-0">
                    <img
                        src={scrolled ? logoColor : logoColor}
                        alt="CD Las Galaxias"
                        className="h-10 w-auto object-contain block dark:hidden"
                    />
                    <img
                        src={logoClaro}
                        alt="CD Las Galaxias"
                        className="h-10 w-auto object-contain hidden dark:block"
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
                        className={`w-6 h-6 md:w-8 md:h-8 rounded-sm flex items-center justify-center transition-all active:scale-90 hover:opacity-80 ${
                            theme === 'dark' ? 'bg-primary' : 'bg-amber-400'
                        }`}
                    >
                        <span className="material-symbols-outlined text-white text-[13px] md:text-[16px] leading-none">
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>

                    {/* Hamburguesa móvil */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`md:hidden flex items-center justify-center w-7 h-7 transition-colors ${
                            scrolled || !isHome
                                ? 'text-black dark:text-white'
                                : 'text-white'
                        }`}
                        aria-label="Menú"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {isMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Menú móvil desplegable */}
            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-black border-t border-slate-100 dark:border-white/10">
                    <nav className="flex flex-col px-6 py-4 gap-1">
                        {NAV_LINKS.map(({ label, to }) => (
                            <Link
                                key={to}
                                to={to}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-slate-900 dark:text-white text-base font-black uppercase tracking-widest py-3 border-b border-slate-100 dark:border-white/10 hover:text-primary transition-colors"
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Navbar;
