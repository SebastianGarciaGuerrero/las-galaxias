import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Shield from '../components/icons/Shield';
import Mdl from '../components/icons/Mdl';
import Slv from '../components/icons/Slv';
import shieldRed from '../assets/shieldRed.svg';
import { useReveal } from '../hooks/useReveal';

const heroFoto   = 'https://res.cloudinary.com/du4oddnjl/image/upload/v1773720637/canchita_mzu8aa.jpg';
const splitFoto  = 'https://res.cloudinary.com/du4oddnjl/image/upload/v1773720639/DJI_20260203214638_0295_D.JPG_u9ccia.jpg';
const pelotaFoto = 'https://res.cloudinary.com/du4oddnjl/image/upload/v1777846739/f7bfe9e52016f30bdc4d9c1336dfd3bb6b795659_ewqlla.png';

const casa = [
    { icon: 'location_on', label: 'Dónde',  value: 'Pasaje Prieto #1, Valparaíso' },
    { icon: 'stadium',     label: 'Cancha', value: 'Estadio Bellavista' },
    { icon: 'flag',        label: 'Desde',  value: '2017' },
];

const martesPuntos = [
    'Equipos con identidad educativa',
    'Una temática distinta cada temporada',
    'Ambiente formativo por sobre el resultado',
];

const viernesPuntos = [
    'Los capitanes arman su propio equipo',
    'Tabla, goleadores y premio al campeón',
    'Intensidad y compromiso cada fecha',
];

const SobreNosotros = () => {
    const [showModal, setShowModal] = useState(false);
    const [formStatus, setFormStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'

    // Animaciones de entrada (scroll reveal), igual que en el home.
    const logoR      = useReveal('zoom',  100);
    const heroTextR  = useReveal('up',    500);
    const histTopR   = useReveal('right', 0);
    const histBotR   = useReveal('up',    150);
    const histFotoR  = useReveal('left',  100);
    const pelotaR    = useReveal('fade',  0);
    const fraseR     = useReveal('right', 150);
    const ligasR     = useReveal('up',    0);
    const colaboraR  = useReveal('up',    0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormStatus('sending');

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            // Usamos FormSubmit para enviar el correo sin backend complejo
            // El correo llegará a clubdeportivolasgalaxias@gmail.com
            const response = await fetch("https://formsubmit.co/ajax/seba.garcia.g@gmail.com", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    ...data,
                    _subject: `Nuevo Mensaje Web: ${data.subject || 'Consulta General'}`,
                    _captcha: "false"
                })
            });

            if (response.ok) {
                setFormStatus('success');
                e.target.reset();
                // Cerrar modal después de 3 segundos
                setTimeout(() => {
                    setShowModal(false);
                    setFormStatus('idle');
                }, 3000);
            } else {
                setFormStatus('error');
            }
        } catch (error) {
            setFormStatus('error');
        }
    };

    return (
        <>
        <SEO
          title="Sobre Nosotros"
          description="Conoce la historia del Club Deportivo Las Galaxias. Fundado en Valparaíso, somos fútbol y conciencia desde 2017. Dos ligas, una academia formativa y una comunidad."
          url="https://lasgalaxias.cl/sobre-nosotros"
        />
        <div className="bg-background-light dark:bg-background-dark min-h-screen">

            {/* ── 1. HERO ──
                A sangre completa y detrás del navbar, que en esta ruta arranca
                transparente (ver CON_HERO en Navbar.jsx). */}
            <section className="relative h-screen min-h-[600px] overflow-hidden flex flex-col items-center justify-center">
                <img
                    src={heroFoto}
                    alt="Cancha de Las Galaxias en Valparaíso"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/55 z-10" />
                {/* Degradado abajo para empalmar con la sección siguiente */}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background-light dark:to-background-dark z-10" />

                <div className="relative z-20 flex flex-col items-center text-center px-6">
                    <img
                        ref={logoR.ref}
                        style={logoR.style}
                        src={shieldRed}
                        alt=""
                        aria-hidden="true"
                        className={`${logoR.className} w-40 sm:w-52 md:w-64 lg:w-[300px] drop-shadow-2xl`}
                    />

                    <div ref={heroTextR.ref} style={heroTextR.style} className={`${heroTextR.className} mt-8 md:mt-16 flex flex-col items-center gap-4 md:gap-6`}>
                        <div>
                            <span className="text-white/60 text-[11px] font-bold uppercase tracking-[0.3em] block mb-3">
                                [ Nosotros ]
                            </span>
                            <p className="text-white font-bold text-2xl md:text-4xl lg:text-5xl leading-tight">
                                Fútbol &amp; Conciencia.
                            </p>
                            <p className="text-white/85 text-sm md:text-base lg:text-lg font-light mt-2">
                                Un club de los cerros de{' '}
                                <strong className="font-bold text-white">Valparaíso</strong>, desde 2017.
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-3 mt-1">
                            <a
                                href="#historia"
                                className="text-white text-[11px] font-bold uppercase tracking-[0.3em] hover:text-white/70 transition-colors animate-pulse"
                            >
                                Nuestra Historia
                            </a>
                            <div className="w-6 h-10 rounded-full border border-white/40 flex items-start justify-center pt-2">
                                <div className="w-0.5 h-3 bg-white/60 rounded-full animate-scroll" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 2. HISTORIA ──
                Espejo del bloque "Nosotros" del home: allá la foto va a la
                derecha, acá a la izquierda, para que no se sienta repetido. */}
            <section id="historia" className="bg-white dark:bg-black overflow-hidden scroll-mt-16">
                <div className="flex flex-col lg:flex-row-reverse lg:justify-between lg:h-[744px]">

                    <div className="flex flex-col justify-between py-10 px-6 sm:px-8 md:px-14 lg:pr-[200px] lg:pl-16 lg:py-16 flex-1">
                        <div ref={histTopR.ref} style={histTopR.style} className={histTopR.className}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-[0.25em]">
                                    [ Historia ]
                                </span>
                                <Shield className="text-primary w-24 h-24 md:w-28 md:h-28 shrink-0" aria-hidden="true" />
                            </div>
                            <h1 className="text-[56px] sm:text-[72px] md:text-[90px] lg:text-[120px] font-black text-primary leading-none">
                                *2017
                            </h1>
                        </div>

                        <div ref={histBotR.ref} style={histBotR.style} className={histBotR.className}>
                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-primary leading-tight mb-6 md:mb-8">
                                Más que<br />un equipo.
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-md mb-4">
                                Fundado por un grupo de amigos en los cerros de Valparaíso,
                                el <strong className="text-slate-900 dark:text-slate-100 font-bold">Club Deportivo Las Galaxias</strong> nació
                                para ser una plataforma social: un lugar donde el fútbol es la excusa
                                y la comunidad es el punto.
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-md mb-8">
                                Con experiencia en academias formativas, equipos de fútbol 11 y torneos
                                regionales, hoy nuestra casa está en el{' '}
                                <strong className="text-slate-900 dark:text-slate-100 font-bold">Estadio Bellavista.</strong>
                            </p>

                            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden max-w-md">
                                {casa.map(({ icon, label, value }) => (
                                    <div key={label} className="bg-white dark:bg-black p-4">
                                        <dt className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
                                            <span className="material-symbols-outlined text-primary text-sm">{icon}</span>
                                            {label}
                                        </dt>
                                        <dd className="text-slate-900 dark:text-white text-sm font-bold leading-snug">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>

                    <div ref={histFotoR.ref} style={histFotoR.style} className={`${histFotoR.className} h-[280px] sm:h-[360px] md:h-[440px] lg:h-full lg:w-[504px] flex-shrink-0`}>
                        <img
                            src={splitFoto}
                            alt="Estadio Bellavista desde el aire"
                            className="w-full h-full object-cover object-center"
                        />
                    </div>
                </div>
            </section>

            {/* ── 3. BANNER FRASE ── */}
            <section className="relative h-[220px] sm:h-[280px] md:h-[400px] lg:h-[570px] overflow-hidden bg-primary">
                <img
                    ref={pelotaR.ref}
                    src={pelotaFoto}
                    alt=""
                    aria-hidden="true"
                    className={`${pelotaR.className} absolute inset-0 w-full h-full object-cover object-left mix-blend-lighten`}
                    style={pelotaR.style}
                />
                <div className="absolute inset-0 bg-primary/55 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent from-40% via-primary/90 via-60% to-primary" />

                <div className="absolute inset-0 flex items-center px-5 sm:px-8 md:px-16 lg:px-28">
                    <div ref={fraseR.ref} style={fraseR.style} className={`${fraseR.className} max-w-[200px] sm:max-w-xs md:max-w-sm`}>
                        <p className="text-white text-lg sm:text-xl md:text-2xl lg:text-6xl font-light leading-snug mb-3 md:mb-5">
                            El barrio no se elige...
                        </p>
                        <p className="text-white text-lg sm:text-xl md:text-2xl lg:text-4xl font-light leading-snug">
                            pero sí se<br />
                            <strong className="font-black">construye.</strong>
                        </p>
                    </div>
                </div>
            </section>

            {/* ── 4. NUESTRAS LIGAS ── */}
            <section className="bg-white dark:bg-black py-12 md:py-20 px-5 sm:px-6 lg:px-20">
                <div ref={ligasR.ref} style={ligasR.style} className={`${ligasR.className} max-w-6xl mx-auto`}>

                    <div className="mb-8 md:mb-12">
                        <span className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] block mb-1 md:mb-2">
                            [ Ligas ]
                        </span>
                        <h2 className="text-[48px] sm:text-[60px] md:text-[72px] lg:text-[88px] font-black text-primary leading-none">
                            *Dos formatos
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mt-4 max-w-xl">
                            Dos maneras distintas de entender el mismo juego. Una para pensar, otra para competir.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        {[
                            { Icono: Mdl, eyebrow: 'Temática y educativa', titulo: '*Martes',
                              desc: 'Más que jugar, buscamos generar conciencia. Cada temporada la liga adopta una temática distinta para educar, visibilizar y conectar a través del fútbol.',
                              destacado: { label: 'Temática actual', valor: 'Bailes Latinos' },
                              puntos: martesPuntos },
                            { Icono: Slv, eyebrow: 'Alta competencia', titulo: '*Viernes',
                              desc: 'Aquí los capitanes arman su propia historia. Una liga competitiva diseñada para quienes buscan desafío, intensidad y compromiso en cada fecha.',
                              destacado: { label: 'En juego', valor: 'Super Liga X' },
                              puntos: viernesPuntos },
                        ].map(({ Icono, eyebrow, titulo, desc, destacado, puntos }) => (
                            <div
                                key={titulo}
                                className="rounded-xl p-6 md:p-8 border border-1 border-zinc-900/10 dark:border-white/10 hover:border-primary/40 transition-all duration-300 flex flex-col"
                            >
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] block mb-1">
                                            {eyebrow}
                                        </span>
                                        <h3 className="text-[40px] sm:text-[48px] font-black text-primary leading-none">
                                            {titulo}
                                        </h3>
                                    </div>
                                    <Icono size={90} className="text-black dark:text-white shrink-0" />
                                </div>

                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-5">
                                    {desc}
                                </p>

                                <div className="inline-flex items-center gap-2 self-start border border-slate-300 dark:border-slate-700 rounded-full px-4 py-2 mb-5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                        {destacado.label}
                                    </span>
                                    <span className="font-black text-slate-800 dark:text-slate-200 text-xs tracking-wider uppercase">
                                        {destacado.valor}
                                    </span>
                                </div>

                                <ul className="space-y-2 mb-6">
                                    {puntos.map(p => (
                                        <li key={p} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-primary text-base leading-5 shrink-0">check</span>
                                            {p}
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    to="/liga"
                                    className="mt-auto text-primary text-[11px] font-bold uppercase tracking-[0.25em] hover:text-primary/70 transition-colors inline-flex items-center gap-1"
                                >
                                    Ver la tabla
                                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 md:pt-10 mt-10 md:mt-12 border-t border-slate-100 dark:border-slate-100/10">
                        <p className="text-2xl sm:text-2xl md:text-3xl text-slate-900 dark:text-white leading-snug">
                            Aquí no vienes solo a jugar.<br />
                            <strong className="font-black">Vienes a ser parte.</strong>
                        </p>
                    </div>
                </div>
            </section>

            {/* ── 5. COLABORA ── */}
            <section className="bg-primary py-12 md:py-20 px-5 sm:px-6 lg:px-20">
                <div ref={colaboraR.ref} style={colaboraR.style} className={`${colaboraR.className} max-w-6xl mx-auto`}>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 gap-2">
                        <div className="text-left">
                            <span className="text-[10px] md:text-[11px] font-bold text-black/60 dark:text-white/60 uppercase tracking-[0.25em] block mb-1 md:mb-2">
                                [ Colabora ]
                            </span>
                            <h2 className="text-[48px] sm:text-[60px] md:text-[72px] lg:text-[88px] font-black text-black dark:text-white leading-none">
                                *Sumate
                            </h2>
                        </div>
                        <span className="material-symbols-outlined text-black dark:text-white text-[90px] md:text-[120px] shrink-0 hidden md:block" aria-hidden="true">
                            handshake
                        </span>
                    </div>

                    <p className="text-black/80 dark:text-white/80 text-sm leading-relaxed mb-8 md:mb-10 max-w-2xl">
                        Las Galaxias es un ecosistema abierto. Buscamos alianzas con organizaciones de{' '}
                        <strong className="text-red-200 dark:text-red-900">reciclaje, arte, tecnología y deporte</strong>{' '}
                        para seguir impactando Valparaíso. Si tienes una idea, queremos escucharla.
                    </p>

                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 bg-white text-primary text-[11px] font-black uppercase tracking-[0.15em] px-6 py-3 rounded-full hover:scale-105 transition-transform"
                    >
                        <span className="material-symbols-outlined text-base">mail</span>
                        Contáctanos
                    </button>
                </div>
            </section>

            {/* MODAL DE CONTACTO */}
            {showModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fadeIn border border-slate-200 dark:border-slate-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-primary p-6 text-white flex justify-between items-center">
                            <h3 className="font-black uppercase text-xl">Enviar Mensaje</h3>
                            <button onClick={() => setShowModal(false)} className="hover:bg-white/20 rounded-full p-1 transition-colors" aria-label="Cerrar">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body (Formulario) */}
                        <div className="p-6">
                            {formStatus === 'success' ? (
                                <div className="text-center py-8">
                                    <span className="material-symbols-outlined text-6xl text-green-500 mb-4 animate-bounce">check_circle</span>
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase mb-2">¡Mensaje Enviado!</h4>
                                    <p className="text-slate-500 text-sm">Gracias por contactarnos. Te responderemos a la brevedad.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tu Nombre</label>
                                        <input required type="text" name="name" className="w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-primary focus:border-primary" placeholder="Ej: Juan Pérez" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tu Correo</label>
                                        <input required type="email" name="email" className="w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-primary focus:border-primary" placeholder="ejemplo@correo.com" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Asunto</label>
                                        <select name="subject" className="w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-primary focus:border-primary">
                                            <option value="Colaboración">Propuesta de Colaboración</option>
                                            <option value="Inscripción">Inscripción Ligas</option>
                                            <option value="General">Consulta General</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Mensaje</label>
                                        <textarea required name="message" rows="4" className="w-full rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-primary focus:border-primary" placeholder="Escribe tu mensaje aquí..."></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={formStatus === 'sending'}
                                        className={`w-full py-3 rounded-lg font-black uppercase text-white transition-all flex items-center justify-center gap-2 ${formStatus === 'sending' ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-red-700 hover:shadow-lg'}`}
                                    >
                                        {formStatus === 'sending' ? (
                                            <>Enviando... <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span></>
                                        ) : (
                                            <>Enviar Correo <span className="material-symbols-outlined text-sm">send</span></>
                                        )}
                                    </button>

                                    {formStatus === 'error' && (
                                        <p className="text-red-500 text-xs text-center font-bold mt-2">Hubo un error al enviar. Intenta de nuevo.</p>
                                    )}
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
        </>
    );
};

export default SobreNosotros;
