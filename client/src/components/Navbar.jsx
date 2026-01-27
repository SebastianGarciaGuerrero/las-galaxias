import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
    // Estado para el tema oscuro/claro
    const [theme, setTheme] = useState(() => {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    // Estado para el menú móvil (abierto/cerrado)
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Función para cerrar el menú al hacer clic en un enlace
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-20 lg:px-40 py-3 transition-colors duration-300">
            <div className="flex items-center justify-between max-w-[1280px] mx-auto whitespace-nowrap relative">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-4 text-primary group z-50" onClick={closeMenu}>
                    <div className="size-8 group-hover:scale-110 transition-transform">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fillRule="evenodd"></path>
                        </svg>
                    </div>
                    <h2 className="text-slate-900 dark:text-white text-xl font-black leading-tight tracking-[-0.015em] uppercase hidden md:block">CD Las Galaxias</h2>
                </Link>

                {/* Navigation (Desktop) - Se oculta en móvil */}
                <nav className="hidden md:flex flex-1 justify-center gap-8">
                    <Link to="/partidos" className="text-slate-900 dark:text-slate-200 text-sm font-bold uppercase hover:text-primary transition-colors">Partidos</Link>
                    <Link to="/liga" className="text-slate-900 dark:text-slate-200 text-sm font-bold uppercase hover:text-primary transition-colors">Liga</Link>
                    <Link to="/noticias" className="text-slate-900 dark:text-slate-200 text-sm font-bold uppercase hover:text-primary transition-colors">Noticias</Link>
                    <Link to="/sobre-nosotros" className="text-slate-900 dark:text-slate-200 text-sm font-bold uppercase hover:text-primary transition-colors">Sobre Nosotros</Link>
                </nav>

                {/* Actions & Theme Toggle & Mobile Menu Button */}
                <div className="flex gap-2 z-50">
                    <button onClick={toggleTheme} className="flex size-10 cursor-pointer items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white transition-all">
                        <span className="material-symbols-outlined text-[20px]">
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>

                    {/* Botón Hamburguesa (Visible solo en móvil 'md:hidden') */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden flex size-10 cursor-pointer items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white transition-all"
                    >
                        <span className="material-symbols-outlined text-[24px]">
                            {isMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Menú Desplegable (Móvil) */}
            {/* Se muestra solo si isMenuOpen es true y estamos en móvil */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl md:hidden animate-fade-in z-40">
                    <nav className="flex flex-col p-4 space-y-4">
                        <Link
                            to="/partidos"
                            onClick={closeMenu}
                            className="text-slate-900 dark:text-white text-lg font-black uppercase tracking-wide hover:text-primary p-2 border-b border-slate-100 dark:border-slate-800"
                        >
                            Partidos
                        </Link>
                        <Link
                            to="/liga"
                            onClick={closeMenu}
                            className="text-slate-900 dark:text-white text-lg font-black uppercase tracking-wide hover:text-primary p-2 border-b border-slate-100 dark:border-slate-800"
                        >
                            Liga
                        </Link>
                        <Link
                            to="/noticias"
                            onClick={closeMenu}
                            className="text-slate-900 dark:text-white text-lg font-black uppercase tracking-wide hover:text-primary p-2 border-b border-slate-100 dark:border-slate-800"
                        >
                            Noticias
                        </Link>
                        <Link
                            to="/sobre-nosotros"
                            onClick={closeMenu}
                            className="text-slate-900 dark:text-white text-lg font-black uppercase tracking-wide hover:text-primary p-2"
                        >
                            Sobre Nosotros
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Navbar;