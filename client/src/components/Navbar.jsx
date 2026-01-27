import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const [theme, setTheme] = useState(() => {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

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

    return (
        <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-20 lg:px-40 py-3 transition-colors duration-300">
            <div className="flex items-center justify-between max-w-[1280px] mx-auto whitespace-nowrap">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-4 text-primary group">
                    <div className="size-8 group-hover:scale-110 transition-transform">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fillRule="evenodd"></path>
                        </svg>
                    </div>
                    <h2 className="text-slate-900 dark:text-white text-xl font-black leading-tight tracking-[-0.015em] uppercase hidden md:block">CD Las Galaxias</h2>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex flex-1 justify-center gap-8">
                    <Link to="/partidos" className="text-slate-900 dark:text-slate-200 text-sm font-bold uppercase hover:text-primary transition-colors">Partidos</Link>
                    <Link to="/liga" className="text-slate-900 dark:text-slate-200 text-sm font-bold uppercase hover:text-primary transition-colors">Liga</Link>
                    <Link to="/noticias" className="text-slate-900 dark:text-slate-200 text-sm font-bold uppercase hover:text-primary transition-colors">Noticias</Link>
                    <Link to="/sobre-nosotros" className="text-slate-900 dark:text-slate-200 text-sm font-bold uppercase hover:text-primary transition-colors">Sobre Nosotros</Link>
                </nav>

                {/* Actions & Theme Toggle */}
                <div className="flex gap-2">
                    <button onClick={toggleTheme} className="flex size-10 cursor-pointer items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white transition-all">
                        <span className="material-symbols-outlined text-[20px]">
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
                    <button className="hidden md:flex size-10 cursor-pointer items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white transition-all">
                        <span className="material-symbols-outlined text-[20px]">public</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;