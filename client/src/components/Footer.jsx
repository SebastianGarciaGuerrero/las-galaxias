


const Footer = () => (
    <footer className="bg-slate-900 dark:bg-black text-white py-12 px-4 md:px-20 lg:px-40 mt-auto border-t border-slate-800">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
                <div className="flex items-center gap-2 mb-6 text-primary">
                    <div className="size-8">
                        <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"></path>
                        </svg>
                    </div>
                    <span className="font-black uppercase tracking-tight text-xl text-white">Galaxias</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                    Formando deportistas y personas desde 1985. El club del barrio, el club de tu vida.
                </p>
            </div>
            {/* Links Sections... (Simplificado para brevedad, sigue el mismo patrón) */}
            <div>
                <h4 className="font-black uppercase mb-6 tracking-widest text-primary text-xs">Club</h4>
                <ul className="flex flex-col gap-3 text-sm text-slate-300">
                    <li><a href="#" className="hover:text-white transition-colors">Historia</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-black uppercase mb-6 tracking-widest text-primary text-xs">Redes</h4>
                <div className="flex gap-4">
                    <a className="size-10 rounded bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors" href="#"><span className="material-symbols-outlined">thumb_up</span></a>
                    <a className="size-10 rounded bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors" href="#"><span className="material-symbols-outlined">share</span></a>
                </div>
            </div>
        </div>
        <div className="max-w-[1280px] mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            <p>© 2023 Club Deportivo Las Galaxias.</p>
        </div>
    </footer>
);

export default Footer;