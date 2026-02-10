import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-950 text-white py-12 px-4 md:px-8 mt-auto border-t border-slate-900 relative overflow-hidden">
            {/* Decoración de fondo sutil */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

                {/* 1. IDENTIDAD DEL CLUB */}
                <div className="col-span-1">
                    <div className="flex items-center gap-3 mb-6 group cursor-default">
                        <div className="size-10 text-primary transition-transform duration-500 group-hover:rotate-180">
                            {/* Logo SVG */}
                            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"></path>
                            </svg>
                        </div>
                        <div>
                            <span className="font-black uppercase tracking-tighter text-2xl text-white block leading-none">Las Galaxias</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">Club Deportivo</span>
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                        Pasión, disciplina y familia. Formando deportistas y personas de bien desde <strong className="text-white">2017</strong>. El club del barrio, el club de tu vida.
                    </p>
                </div>

                {/* 2. ENLACES RÁPIDOS */}
                <div className="flex flex-col md:items-center">
                    <div>
                        <h4 className="font-black uppercase mb-6 tracking-widest text-primary text-xs border-b border-slate-800 pb-2 inline-block">Navegación</h4>
                        <ul className="flex flex-col gap-3 text-sm text-slate-300">
                            <li><Link to="/" className="hover:text-primary transition-colors hover:translate-x-1 inline-block duration-200">Inicio</Link></li>
                            <li><Link to="/noticias" className="hover:text-primary transition-colors hover:translate-x-1 inline-block duration-200">Noticias</Link></li>
                            <li><Link to="/partidos" className="hover:text-primary transition-colors hover:translate-x-1 inline-block duration-200">Partidos y Resultados</Link></li>
                            <li><Link to="/liga" className="hover:text-primary transition-colors hover:translate-x-1 inline-block duration-200">Tabla de Posiciones</Link></li>
                        </ul>
                    </div>
                </div>

                {/* 3. REDES SOCIALES */}
                <div>
                    <h4 className="font-black uppercase mb-6 tracking-widest text-primary text-xs border-b border-slate-800 pb-2 inline-block">Síguenos</h4>
                    <p className="text-slate-400 text-sm mb-4">Únete a nuestra comunidad digital.</p>

                    <div className="flex gap-4">

                        {/* INSTAGRAM (Corregido) */}
                        <a href="https://www.instagram.com/cdgalaxias/" target="_blank" rel="noopener noreferrer"
                            className="size-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white hover:bg-gradient-to-br hover:from-purple-600 hover:to-orange-500 hover:border-transparent hover:-translate-y-1 transition-all duration-300 shadow-lg group">
                            <svg className="size-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </a>

                        {/* FACEBOOK (Nuevo) */}
                        <a href="https://www.facebook.com/CDLasGalaxias/" target="_blank" rel="noopener noreferrer"
                            className="size-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white hover:bg-blue-600 hover:border-transparent hover:-translate-y-1 transition-all duration-300 shadow-lg group">
                            <svg className="size-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </a>

                        {/* YOUTUBE */}
                        <a href="https://www.youtube.com/@CDGalaxias" target="_blank" rel="noopener noreferrer"
                            className="size-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white hover:bg-red-600 hover:border-transparent hover:-translate-y-1 transition-all duration-300 shadow-lg group">
                            <svg className="size-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                        </a>
                    </div>
                </div>

            </div>

            {/* COPYRIGHT & CRÉDITOS */}
            <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                    © {currentYear} Club Deportivo Las Galaxias.
                </p>

                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Desarrollado con <span className="text-red-500 mx-1">❤</span> por <a href="https://sebastiangarcia.cl" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-0.5">sebastiangarcia.cl</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;