import { Link } from 'react-router-dom';

import shieldRed from '../assets/shieldRed.svg';
const SHIELD_LOGO = shieldRed;

const pillars = [
    {
        icon: 'self_improvement',
        title: 'Formación',
        desc: 'Fortalecemos valores fundamentales como el respeto, la amistad, el trabajo en equipo y la constancia. Aquí recuerda siempre forman personas.',
    },
    {
        icon: 'fitness_center',
        title: 'Entrenamiento',
        desc: 'Clases dinámicas y adaptadas a distintas habilidades y niveles, para que nunca pierda el disfrute y siempre quieran volver.',
    },
    {
        icon: 'sports_soccer',
        title: 'Técnica',
        desc: 'Trabajamos habilidades clave del fútbol: control de balón, pase, regate, disparo y comprensión del juego.',
    },
];

const info = [
    { icon: 'calendar_today', label: 'Día',      value: 'Todos los viernes' },
    { icon: 'schedule',       label: 'Horario',  value: '16:00 — 18:00 hrs' },
    { icon: 'location_on',    label: 'Lugar',    value: 'Estadio Bellavista, Valparaíso' },
    { icon: 'person',         label: 'Profesor', value: 'Jesús (Ayullán)' },
];

const Academia = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen">

            {/* ── 1. HERO ── */}
            <section className="relative h-screen min-h-[600px] overflow-hidden flex flex-col items-center">
                <div className="absolute inset-0 bg-black/50 z-10" />
                <img
                    src="https://res.cloudinary.com/du4oddnjl/image/upload/v1773720639/DJI_20260203214638_0295_D.JPG_u9ccia.jpg"
                    alt="Academia Las Galaxias"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="relative z-20 flex flex-col items-center text-center pt-20 md:pt-[150px] px-6">
                    <img
                        src={SHIELD_LOGO}
                        alt="CD Las Galaxias"
                        className="w-44 sm:w-56 md:w-72 lg:w-[340px] drop-shadow-2xl"
                    />
                    <div className="mt-8 md:mt-[94px] flex flex-col items-center gap-4">
                        <div>
                            <span className="text-white/60 text-[11px] font-bold uppercase tracking-[0.3em] block mb-2">
                                [ Academia ]
                            </span>
                            <p className="text-white font-bold text-2xl md:text-3xl">
                                Formamos personas.<br />
                                <span className="font-light">A través del fútbol.</span>
                            </p>
                        </div>
                        <div className="flex flex-col items-center gap-3 mt-2">
                            <a
                                href="#info"
                                className="text-white text-[11px] font-bold uppercase tracking-[0.3em] hover:text-white/70 transition-colors"
                            >
                                Conocer más
                            </a>
                            <div className="w-6 h-10 rounded-full border border-white/40 flex items-start justify-center pt-2">
                                <div className="w-0.5 h-3 bg-white/60 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 2. QUÉ ES LA ACADEMIA ── */}
            <section className="bg-white dark:bg-black overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:h-[744px]">

                    <div className="flex flex-col justify-between py-10 px-6 sm:px-8 md:px-14 lg:pl-[200px] lg:pr-16 lg:py-16 flex-1">
                        <div>
                            <div className="flex items-start justify-between mb-1">
                                <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-[0.25em]">
                                    [ Academia ]
                                </span>
                                <img src={SHIELD_LOGO} alt="" aria-hidden="true" className="w-12 h-12 md:w-16 md:h-16" />
                            </div>
                            <h2 className="text-[56px] sm:text-[72px] md:text-[90px] lg:text-[120px] font-black text-primary leading-none">
                                *Formación
                            </h2>
                        </div>

                        <div>
                            <h3 className="text-4xl sm:text-5xl md:text-6xl font-black text-primary leading-tight mb-6 md:mb-8">
                                Fútbol &amp;<br />Valores.
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-md mb-4">
                                Todos los viernes de <strong className="text-slate-900 dark:text-slate-100">16:00 a 18:00</strong> hrs,
                                damos un espacio para que niños y niñas de Valparaíso aprendan fútbol desde un modelo formativo,
                                cercano y consciente.
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-md">
                                Las clases están a cargo del profesor{' '}
                                <strong className="text-slate-900 dark:text-slate-100">Jesús (Ayullán)</strong>, enfocado en desarrollar
                                habilidades deportivas mientras se fortalecen valores que van más allá de la cancha.
                            </p>
                        </div>
                    </div>

                    <div className="h-[280px] sm:h-[360px] md:h-[440px] lg:h-full lg:w-[504px] flex-shrink-0">
                        <img
                            src="https://res.cloudinary.com/du4oddnjl/image/upload/v1777847307/camiseta_c3pgn5.jpg"
                            alt="Academia Las Galaxias"
                            className="w-full h-full object-cover object-center"
                        />
                    </div>
                </div>
            </section>

            {/* ── 3. BANNER ── */}
            <section className="relative h-[220px] sm:h-[280px] md:h-[400px] lg:h-[570px] overflow-hidden bg-primary">
                <img
                    src="https://res.cloudinary.com/du4oddnjl/image/upload/v1777846739/f7bfe9e52016f30bdc4d9c1336dfd3bb6b795659_ewqlla.png"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-primary/55 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent from-40% via-primary/90 via-60% to-primary" />

                <div className="absolute inset-0 flex items-center justify-end px-5 sm:px-8 md:px-16 lg:px-28">
                    <div className="max-w-[200px] sm:max-w-xs md:max-w-sm">
                        <p className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-light leading-snug mb-3">
                            No solo enseñamos fútbol,
                        </p>
                        <p className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-light leading-snug">
                            formamos{' '}
                            <strong className="font-black">personas.</strong>
                        </p>
                    </div>
                </div>
            </section>

            {/* ── 4. PILARES ── */}
            <section className="bg-primary py-12 md:py-20 px-5 sm:px-6 lg:px-20">
                <div className="max-w-6xl mx-auto">

                    <div className="flex items-start justify-between mb-6 md:mb-10 gap-2">
                        <div>
                            <span className="text-[10px] md:text-[11px] font-bold text-white/60 uppercase tracking-[0.25em] block mb-1 md:mb-2">
                                [ Metodología ]
                            </span>
                            <h2 className="text-[48px] sm:text-[60px] md:text-[72px] lg:text-[88px] font-black text-white leading-none">
                                *Pilares
                            </h2>
                        </div>
                        <div className="pt-4 md:pt-6">
                            <span className="material-symbols-outlined text-white/60 text-4xl md:text-5xl">menu_book</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                        {pillars.map((p) => (
                            <div key={p.title} className="border border-white/25 rounded-xl p-5 md:p-6 bg-white/5 hover:border-white/50 transition-colors">
                                <span className="material-symbols-outlined text-xl md:text-2xl text-white/60 mb-2 md:mb-3 block">{p.icon}</span>
                                <h4 className="font-black text-white text-xs uppercase tracking-wider mb-2">{p.title}</h4>
                                <p className="text-white/60 text-[11px] leading-relaxed">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 5. INFO PRÁCTICA ── */}
            <section id="info" className="bg-white dark:bg-black py-12 md:py-20 px-5 sm:px-6 lg:px-20">
                <div className="max-w-6xl mx-auto">

                    <div className="mb-8 md:mb-12">
                        <span className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] block mb-1 md:mb-2">
                            [ Información ]
                        </span>
                        <h2 className="text-[48px] sm:text-[60px] md:text-[72px] font-black text-primary leading-none">
                            *Detalles
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 md:mb-16">
                        {info.map((item) => (
                            <div key={item.label} className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 hover:border-primary transition-colors">
                                <span className="material-symbols-outlined text-xl md:text-2xl text-primary mb-2 md:mb-3 block">{item.icon}</span>
                                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                                <p className="font-black text-slate-900 dark:text-white text-sm md:text-base">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-slate-100 dark:border-slate-900">
                        <p className="text-xl sm:text-2xl md:text-3xl text-slate-900 dark:text-white leading-snug mb-2">
                            ¿Quieres inscribir a tu hijo/a?<br />
                            <strong className="font-black">Habla directamente con el profe.</strong>
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Sin formularios. Sin esperas. Solo escríbenos.</p>
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
            </section>

        </div>
    );
};

export default Academia;
