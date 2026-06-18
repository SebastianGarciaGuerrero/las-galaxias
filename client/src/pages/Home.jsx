import { Link } from 'react-router-dom';
import Mdl from '../components/icons/Mdl';
import Slv from '../components/icons/Slv';
import Shield from '../components/icons/Shield';
import shieldRed from '../assets/shieldRed.svg';
import Academia from '../components/icons/Acad';
import { useReveal } from '../hooks/useReveal';

const heroVideo = 'https://res.cloudinary.com/du4oddnjl/video/upload/q_auto/v1781823917/galaxiasDrone-web_t3te3m.mp4';

const martesFeatures = [
    { icon: 'person_add', title: 'Invita',   desc: 'Que compartas los valores' },
    { icon: 'group',      title: 'Juega',    desc: 'Tribute a los amistosos' },
    { icon: 'favorite',   title: 'Vivencia', desc: 'Que viva la experiencia' },
    { icon: 'groups',     title: 'Grupo',    desc: 'Cuando esté listo... se suma' },
];

const viernesFeatures = [
    { icon: 'bolt',         title: 'Dinámica', desc: 'Equipos rotativos cada fecha. Dispuestos a competir y aprender.' },
    { icon: 'schema',       title: 'Sistema',  desc: 'Equipos opcionales. Dispuestos a competir al máximo.' },
    { icon: 'emoji_events', title: 'Premios',  desc: 'Premio al campeón.' },
];

const academiaFeatures = [
    { icon: 'self_improvement', title: 'Formación',     desc: 'Fortalecemos valores fundamentales como el respeto, la amistad, el trabajo en equipo y la constancia. Aquí recuerda siempre forman personas.' },
    { icon: 'fitness_center',   title: 'Entrenamiento', desc: 'Clases dinámicas y adaptadas a distintas habilidades y niveles, para que nunca pierda el disfrute.' },
    { icon: 'sports_soccer',    title: 'Técnica',        desc: 'Trabajamos habilidades clave del fútbol: control de balón, pase, regate, disparo y comprensión del juego.' },
];

const Home = () => {
    // Animaciones de entrada (scroll reveal)
    const logoR       = useReveal('zoom',  100);
    const heroTextR   = useReveal('up',    500);
    const nosTopR     = useReveal('right', 0);
    const nosBottomR  = useReveal('up',    150);
    const nosPhotoR   = useReveal('right', 100);
    const ballR       = useReveal('fade',  0);
    const bannerTextR = useReveal('right', 150);
    const martesR     = useReveal('up',    0);
    const viernesR    = useReveal('up',    0);
    const academiaR   = useReveal('up',    0);

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen">

            {/* ── 1. HERO ── */}
            <section className="relative h-screen min-h-[600px] overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-black/20 z-10" />
                <video
                    src={heroVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="relative z-20 flex flex-col items-center text-center px-6">
                    <img ref={logoR.ref} style={logoR.style} src={shieldRed} alt="" aria-hidden="true" className={`${logoR.className} w-100 sm:w-56 md:w-[300px]`} />

                    <div ref={heroTextR.ref} style={heroTextR.style} className={`${heroTextR.className} mt-8 md:mt-[94px] flex flex-col items-center gap-4 md:gap-6`}>
                        <div>
                            <p className="text-white font-bold text-base md:text-lg lg:text-5xl">
                                Pasión, disciplina &amp; familia.
                            </p>
                            <p className="text-white/85 text-sm md:text-base lg:text-lg font-light">
                                Formando deportistas y personas de bien desde{' '}
                                <strong className="font-bold text-white">2017.</strong>
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-3 mt-1">
                            <Link
                                to="/sobre-nosotros"
                                className="text-white text-[11px] font-bold uppercase tracking-[0.3em] hover:text-white/70 transition-colors animate-pulse"
                            >
                                Saber Más
                            </Link>
                            <div className="w-6 h-10 rounded-full border border-white/40 flex items-start justify-center pt-2">
                                <div className="w-0.5 h-3 bg-white/60 rounded-full animate-scroll" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 2. NOSOTROS ── */}
            <section className="bg-white dark:bg-black overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:h-[744px]">

                    <div className="flex flex-col justify-between py-10 px-6 sm:px-8 md:px-14 lg:pl-[200px] lg:pr-16 lg:py-16 flex-1">
                        <div ref={nosTopR.ref} style={nosTopR.style} className={nosTopR.className}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-[0.25em]">
                                    [ Nosotros ]
                                </span>
                                <Shield className="text-primary w-24 h-24 md:w-28 md:h-28 shrink-0" aria-hidden="true" />
                            </div>
                            <h2 className="text-[56px] sm:text-[72px] md:text-[90px] lg:text-[120px] font-black text-primary leading-none">
                                *2017
                            </h2>
                        </div>

                        <div ref={nosBottomR.ref} style={nosBottomR.style} className={nosBottomR.className}>
                            <h3 className="text-4xl sm:text-5xl md:text-6xl font-black text-primary leading-tight mb-6 md:mb-8">
                                Fútbol &amp;<br />Conciencia.
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-md mb-4">
                                Fundado por un grupo de amigos en los cerros de Valparaíso,
                                el <strong className="text-slate-900 dark:text-slate-100 font-bold">Club Deportivo Las Galaxias</strong> nació
                                para ser más que un equipo: somos una plataforma social.
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-md">
                                Con experiencia en academias formativas, equipo en dos divisiones:
                                Senior +35 &amp; Honor (a portas del Super Senior +42).
                                Hoy nuestra casa está en el{' '}
                                <strong className="text-slate-900 dark:text-slate-100 font-bold">Estadio Bellavista.</strong>
                            </p>
                        </div>
                    </div>

                    <div ref={nosPhotoR.ref} style={nosPhotoR.style} className={`${nosPhotoR.className} h-[280px] sm:h-[360px] md:h-[440px] lg:h-full lg:w-[504px] flex-shrink-0`}>
                        <img
                            src="https://res.cloudinary.com/du4oddnjl/image/upload/v1777847307/camiseta_c3pgn5.jpg"
                            alt="Camiseta Las Galaxias"
                            className="w-full h-full object-cover object-center"
                        />
                    </div>
                </div>
            </section>

            {/* ── 3. BANNER FRASE ── */}
            <section className="relative h-[220px] sm:h-[280px] md:h-[400px] lg:h-[570px] overflow-hidden bg-primary">
                <img
                    ref={ballR.ref}
                    src="https://res.cloudinary.com/du4oddnjl/image/upload/v1777846739/f7bfe9e52016f30bdc4d9c1336dfd3bb6b795659_ewqlla.png"
                    alt=""
                    aria-hidden="true"
                    className={`${ballR.className} absolute inset-0 w-full h-full object-cover object-left mix-blend-lighten`}
                    style={{ transform: 'scaleX(-1)', ...ballR.style }}
                />
                <div className="absolute inset-0 bg-primary/55 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent from-40% via-primary/90 via-60% to-primary" />

                <div className="absolute inset-0 flex items-center justify-end px-5 sm:px-8 md:px-16 lg:px-28">
                    <div ref={bannerTextR.ref} style={bannerTextR.style} className={`${bannerTextR.className} max-w-[200px] sm:max-w-xs md:max-w-sm`}>
                        <p className="text-white text-lg sm:text-xl md:text-2xl lg:text-6xl font-light leading-snug mb-3 md:mb-5">
                            Jugamos por competir, sí...
                        </p>
                        <p className="text-white text-lg sm:text-xl md:text-2xl lg:text-4xl font-light leading-snug">
                            pero también por<br />
                            <strong className="font-black">encontrarnos.</strong>
                        </p>
                    </div>
                </div>
            </section>

            {/* ── 4. LIGA MARTES ── */}
            <section className="bg-white dark:bg-black py-12 md:py-20 px-5 sm:px-6 lg:px-20">
                <div ref={martesR.ref} style={martesR.style} className={`${martesR.className} max-w-6xl mx-auto`}>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 gap-2">
                        <div className="flex flex-col items-start md:flex-row md:items-center gap-2 md:gap-4">
                            <Mdl size={100} className="text-black dark:text-white shrink-0 md:hidden mb-10" />
                            <div className="text-left">
                                <span className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] block mb-1 md:mb-2">
                                    [ Liga ]
                                </span>
                                <h2 className="text-[48px] sm:text-[60px] md:text-[72px] lg:text-[88px] font-black text-primary leading-none">
                                    *Martes
                                </h2>
                            </div>
                        </div>
                        <Mdl size={120} className="text-black dark:text-white shrink-0 hidden md:block" />
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-2">
                        Más que jugar, buscamos <strong className="text-slate-800 dark:text-slate-200">generar conciencia.</strong>{' '}
                        Cada temporada la liga adopta una temática distinta para educar, visibilizar y conectar a través del fútbol.
                    </p>
                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Temática Actual:</p>

                    <div className="inline-flex items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-full px-4 py-2 mb-3">
                        <span className="text-base">🎵</span>
                        <span className="font-black text-slate-800 dark:text-slate-200 text-xs sm:text-sm tracking-wider uppercase">
                            Bailes Latinos
                        </span>
                    </div>

                    <p className="text-slate-400 text-xs mb-8 md:mb-10">La comunidad crece de forma orgánica.</p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 mb-10 md:mb-12">
                        {martesFeatures.map((f) => (
                            <div key={f.title} className="rounded-xl p-5 md:p-6 text-center hover:bg-red-200 hover:border-red-200 transition-all duration-300 hover:scale-105 cursor-pointer border border-1 border-zinc-900/10 dark:border-white/10">
                                <span className="material-symbols-outlined text-xl md:text-3xl text-primary mb-2 md:mb-3 block">{f.icon}</span>
                                <h4 className="font-black text-slate-900 dark:text-white text-md md:text-2xl uppercase tracking-wider mb-1">{f.title}</h4>
                                <p className="text-zinc-700 dark:text-slate-400 text-sm md:text-md leading-snug">{f.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 md:pt-8 border-t border-slate-100 dark:border-slate-100/10">
                        <p className="text-2xl sm:text-2xl md:text-3xl text-slate-900 dark:text-white leading-snug">
                            Aquí no vienes solo a jugar.<br />
                            <strong className="font-black">Vienes a ser parte.</strong>
                        </p>
                    </div>
                </div>
            </section>

            {/* ── 5. LIGA VIERNES ── */}
            <section className="bg-white dark:bg-black border-t border-slate-100 dark:border-slate-100/10 py-12 md:py-20 px-5 sm:px-6 lg:px-20">
                <div ref={viernesR.ref} style={viernesR.style} className={`${viernesR.className} max-w-6xl mx-auto`}>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 gap-2">
                        <div className="flex flex-col items-start md:flex-row md:items-center gap-2 md:gap-4">
                            <Slv size={200} className="text-black dark:text-white shrink-0 md:hidden mb-10" />
                            <div className="text-left">
                                <span className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] block mb-1 md:mb-2">
                                    [ Liga ]
                                </span>
                                <h2 className="text-[48px] sm:text-[60px] md:text-[72px] lg:text-[88px] font-black text-primary leading-none">
                                    *Viernes
                                </h2>
                            </div>
                        </div>
                        <Slv size={200} className="text-black dark:text-white shrink-0 hidden md:block" />
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8 md:mb-10">
                        Aquí los capitanes arman su propia historia.<br className="hidden sm:block" />
                        Una liga competitiva diseñada para quienes buscan desafío, intensidad y compromiso en cada fecha.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                        {viernesFeatures.map((f) => (
                            <div key={f.title} className="rounded-xl p-5 md:p-6 text-center hover:bg-red-200 hover:border-red-200 transition-all duration-300 hover:scale-105 cursor-pointer border border-1 border-zinc-900/10 dark:border-white/10">
                                <span className="material-symbols-outlined text-xl md:text-3xl text-primary dark:text-white/40 mb-2 md:mb-3 block">{f.icon}</span>
                                <h4 className="font-black text-slate-900 dark:text-white text-lg md:text-xl uppercase tracking-wider mb-2">{f.title}</h4>
                                <p className="text-slate-800 dark:text-slate-400 text-sm md:text-md leading-snug">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 6. ACADEMIA ── */}
            <section className="bg-primary py-12 md:py-20 px-5 sm:px-6 lg:px-20">
                <div ref={academiaR.ref} style={academiaR.style} className={`${academiaR.className} max-w-6xl mx-auto`}>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 gap-2">
                        <div className="flex flex-col items-start md:flex-row md:items-center gap-2 md:gap-4">
                            <Academia size={100} className="text-black dark:text-white shrink-0 md:hidden mb-10" />
                            <div className="text-left">
                                <span className="text-[10px] md:text-[11px] font-bold text-black/60 dark:text-white/60 uppercase tracking-[0.25em] block mb-1 md:mb-2">
                                    [ Academia ]
                                </span>
                                <h2 className="text-[48px] sm:text-[60px] md:text-[72px] lg:text-[88px] font-black text-black dark:text-white leading-none">
                                    *Formación
                                </h2>
                            </div>
                        </div>
                        <Academia size={120} className="text-black dark:text-white shrink-0 hidden md:block" />
                    </div>

                    <p className="text-black/80dark:text-white/80 text-sm leading-relaxed mb-2 max-w-2xl">
                        Todos los viernes de <strong className="text-red-200 dark:text-red-900">16:00 a 18:00</strong> hrs, damos un espacio para que
                        niños y niñas de Valparaíso aprendan fútbol desde un modelo formativo, cercano y consciente.
                    </p>
                    <p className="text-black/80 dark:text-white text-sm leading-relaxed mb-8 md:mb-10 max-w-2xl">
                        Las clases están a cargo del profesor <strong className="text-red-200 dark:text-red-900">Jesús (Ayullán)</strong>, enfocado
                        en desarrollar habilidades deportivas mientras se fortalecen valores que van más allá de la cancha.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                        {academiaFeatures.map((f) => (
                            <div key={f.title} className="rounded-xl p-5 md:p-6 hover:bg-red-300 transition-all 300s hover:scale-105 cursor-pointer bg-white/10">
                                <span className="material-symbols-outlined text-xl md:text-2xl text-black/60 dark:text-white/60 mb-2 md:mb-3 block">{f.icon}</span>
                                <h4 className="font-black text-red-200 dark:text-red-900 text-lg md:text-xl uppercase tracking-wider mb-2">{f.title}</h4>
                                <p className="text-black/80 dark:text-white/80 text-[10px] md:text-[11px] leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 7. CTA FINAL ── */}
            {/* Mobile: columna — foto arriba, texto abajo. Desktop: lado a lado */}
            <section className="bg-white dark:bg-black overflow-hidden">

                {/* Mobile */}
                <div className="block md:hidden">
                    <div className="relative h-[300px] overflow-hidden bg-white dark:bg-black">
                        <img
                            src="https://res.cloudinary.com/du4oddnjl/image/upload/q_auto,f_auto,w_1600/v1777856225/regalonavidad_cqw27f.jpg"
                            alt=""
                            aria-hidden="true"
                            className="w-full h-full object-cover object-center grayscale"
                            style={{
                                maskImage: 'linear-gradient(to bottom, black 0%, black 35%, transparent 92%)',
                                WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 35%, transparent 92%)',
                            }}
                        />
                    </div>
                    <div className="px-6 pb-12 -mt-8 relative z-10 flex flex-col items-center text-center">
                        <p className="text-slate-900 dark:text-white text-2xl font-light leading-snug mb-6">
                            Un espacio para crecer, aprender y disfrutar del fútbol en comunidad.
                        </p>
                        <a
                            href="https://wa.me/56900000000"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-[11px] font-black uppercase tracking-[0.15em] px-6 py-3 rounded-full transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.103 1.504 5.837L.057 23.882a.5.5 0 0 0 .61.61l6.044-1.447A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.524-5.204-1.433l-.374-.217-3.868.927.946-3.867-.228-.381A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                            </svg>
                            Hablar con el Profesor
                        </a>
                    </div>
                </div>

                {/* Desktop */}
                <div className="hidden md:block relative h-[570px] bg-white dark:bg-black">
                    <img
                        src="https://res.cloudinary.com/du4oddnjl/image/upload/q_auto,f_auto,w_1600/v1777856225/regalonavidad_cqw27f.jpg"
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover object-left grayscale"
                        style={{
                            maskImage: 'linear-gradient(to right, black 0%, black 28%, transparent 72%)',
                            WebkitMaskImage: 'linear-gradient(to right, black 0%, black 28%, transparent 72%)',
                        }}
                    />
                    <div className="absolute inset-0 flex items-center">
                        <div className="ml-auto w-[52%] pr-16 md:pr-24 lg:pr-32">
                            <p className="text-slate-900 dark:text-white text-3xl md:text-4xl lg:text-5xl font-light leading-snug mb-6">
                                Un espacio para crecer, aprender y disfrutar del fútbol en comunidad.
                            </p>
                            <a
                                href="https://wa.me/56900000000"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-[11px] font-black uppercase tracking-[0.15em] px-6 py-3 rounded-full transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.103 1.504 5.837L.057 23.882a.5.5 0 0 0 .61.61l6.044-1.447A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.524-5.204-1.433l-.374-.217-3.868.927.946-3.867-.228-.381A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                                </svg>
                                Hablar con el Profesor
                            </a>
                        </div>
                    </div>
                </div>

            </section>

        </div>
    );
};

export default Home;
