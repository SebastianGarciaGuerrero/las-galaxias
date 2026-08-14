import SEO from '../components/SEO';

// Fotos: la cancha desde el aire es del club. Las otras dos son de Unsplash
// (uso libre) y están recortadas de modo que no se vea la cara de nadie.
const FOTO_CANCHA = 'https://res.cloudinary.com/du4oddnjl/image/upload/q_auto,f_auto,w_1600/v1773720641/DJI_20260203204620_0288_D.JPG_fvpxpd.jpg';
const FOTO_BALONES = 'https://images.unsplash.com/photo-1551958219-acbc608c6377?q=75&w=1200&auto=format&fit=crop';
const FOTO_BOTINES = 'https://images.unsplash.com/photo-1600679472829-3044539ce8ed?q=75&w=1200&auto=format&fit=crop';

const WHATSAPP = 'https://wa.me/56900000000';

const ficha = [
    { label: 'Día',      value: 'Viernes' },
    { label: 'Horario',  value: '16:00 — 18:00' },
    { label: 'Lugar',    value: 'Estadio Bellavista' },
    { label: 'Profesor', value: 'Jesús (Ayullán)' },
];

const clase = [
    { hora: '16:00', titulo: 'Llegada y calentamiento', desc: 'Se activa el cuerpo jugando, no corriendo vueltas. Nadie se queda mirando.' },
    { hora: '16:30', titulo: 'Técnica', desc: 'Control, pase, conducción y remate. Ejercicios cortos, adaptados al nivel de cada uno.' },
    { hora: '17:15', titulo: 'Partido', desc: 'Lo que se practicó, aplicado al juego. Equipos mezclados para que roten los compañeros.' },
    { hora: '17:50', titulo: 'Cierre', desc: 'Estiramos, conversamos cómo estuvo la clase y a casa.' },
];

const trabajamos = [
    { n: '01', titulo: 'Valores',    desc: 'Respeto, amistad, trabajo en equipo y constancia. Antes que jugadores, formamos personas.' },
    { n: '02', titulo: 'Movimiento', desc: 'Clases dinámicas, adaptadas a distintas habilidades y niveles, para que nunca se pierda el disfrute.' },
    { n: '03', titulo: 'Técnica',    desc: 'Control de balón, pase, regate, disparo y comprensión del juego.' },
];

const traer = ['Ropa deportiva cómoda', 'Zapatillas o botines', 'Botella con agua', 'Ganas de jugar'];

const IconoWhatsapp = ({ className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.103 1.504 5.837L.057 23.882a.5.5 0 0 0 .61.61l6.044-1.447A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.524-5.204-1.433l-.374-.217-3.868.927.946-3.867-.228-.381A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
);

const BotonWhatsapp = ({ children = 'Escribir al profe', className = '' }) => (
    <a
        href={WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-[11px] font-black uppercase tracking-[0.15em] px-6 py-3 rounded-full transition-colors ${className}`}
    >
        <IconoWhatsapp className="w-4 h-4 shrink-0" />
        {children}
    </a>
);

const Academia = () => {
    return (
        <>
        <SEO
          title="Academia de Fútbol"
          description="Academia formativa de fútbol del Club Deportivo Las Galaxias en Valparaíso. Todos los viernes de 16:00 a 18:00 en el Estadio Bellavista. Formamos personas a través del fútbol."
          url="https://lasgalaxias.cl/academia"
        />
        <div className="bg-background-light dark:bg-background-dark min-h-screen">

            {/* ── 1. PORTADA ──
                A diferencia del home, esta no es una portada a pantalla
                completa: es una franja con los datos concretos arriba de todo,
                porque quien llega acá viene a saber cuándo y dónde es. */}
            <section className="relative min-h-[460px] md:min-h-[540px] flex items-end overflow-hidden">
                <img
                    src={FOTO_CANCHA}
                    alt="La cancha del Estadio Bellavista vista desde el aire"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />

                <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 pt-28 pb-10 md:pb-14">
                    <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-4">
                        Academia · CD Las Galaxias
                    </span>
                    <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] max-w-2xl">
                        Fútbol para niñas y niños<br className="hidden sm:block" /> en Valparaíso.
                    </h1>
                    <p className="text-white/70 text-sm md:text-base mt-4 max-w-lg leading-relaxed">
                        Un espacio formativo, cercano y consciente. Se entrena en serio y se pasa bien.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-7">
                        <BotonWhatsapp>Inscribir a mi hijo/a</BotonWhatsapp>
                        <a
                            href="#clase"
                            className="inline-flex items-center gap-1 text-white/80 hover:text-white text-[11px] font-bold uppercase tracking-[0.2em] transition-colors"
                        >
                            Cómo es una clase
                            <span className="material-symbols-outlined text-base">arrow_downward</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* ── 2. FICHA ──
                Los cuatro datos que la gente pregunta, pegados a la portada y
                en una sola línea. */}
            <section className="bg-primary">
                <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
                    <dl className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/20">
                        {ficha.map(({ label, value }) => (
                            <div key={label} className="py-5 px-4 first:pl-0 lg:last:pr-0">
                                <dt className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60 mb-1">{label}</dt>
                                <dd className="text-white font-black text-sm md:text-lg leading-tight">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* ── 3. CÓMO ES UNA CLASE ──
                Línea de tiempo con las dos horas reales de la clase. Es lo que
                más preguntan los apoderados y no estaba en ninguna parte. */}
            <section id="clase" className="bg-white dark:bg-black py-14 md:py-24 px-5 sm:px-6 lg:px-8 scroll-mt-16">
                <div className="max-w-6xl mx-auto">
                    <div className="max-w-xl mb-10 md:mb-14">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary block mb-3">
                            Dos horas
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                            Cómo es una clase
                        </h2>
                    </div>

                    <ol className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 md:ml-4">
                        {clase.map(({ hora, titulo, desc }) => (
                            <li key={hora} className="relative pl-8 md:pl-12 pb-10 last:pb-0">
                                <span className="absolute -left-[9px] top-1.5 size-4 rounded-full bg-primary ring-4 ring-white dark:ring-black" />
                                <span className="block text-xs font-black tabular-nums text-primary uppercase tracking-widest mb-1">
                                    {hora}
                                </span>
                                <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-1">{titulo}</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-xl">{desc}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* ── 4. QUÉ TRABAJAMOS ── */}
            <section className="bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800 py-14 md:py-24 px-5 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary block mb-3">
                            Metodología
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-8">
                            Qué trabajamos
                        </h2>

                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            {trabajamos.map(({ n, titulo, desc }) => (
                                <div key={n} className="flex gap-5 py-5 first:pt-0">
                                    <span className="text-2xl md:text-3xl font-black text-primary/30 tabular-nums leading-none shrink-0 w-10">
                                        {n}
                                    </span>
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wide text-sm mb-1">{titulo}</h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <img
                        src={FOTO_BALONES}
                        alt="Balones y conos sobre el pasto antes de entrenar"
                        loading="lazy"
                        className="w-full h-[280px] lg:h-[460px] object-cover rounded-2xl"
                    />
                </div>
            </section>

            {/* ── 5. EL PROFE + QUÉ TRAER ── */}
            <section className="bg-white dark:bg-black py-14 md:py-24 px-5 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16">

                    <div className="order-2 lg:order-1">
                        <img
                            src={FOTO_BOTINES}
                            alt="Botines y balón durante un entrenamiento"
                            loading="lazy"
                            className="w-full h-[240px] md:h-[320px] object-cover rounded-2xl mb-8"
                        />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary block mb-3">
                            Quién enseña
                        </span>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-3">
                            Jesús <span className="text-slate-400 font-bold">(Ayullán)</span>
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-md">
                            A cargo de las clases. Trabaja las habilidades deportivas mientras refuerza
                            los valores que sostienen al club, dentro y fuera de la cancha.
                        </p>
                    </div>

                    <div className="order-1 lg:order-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary block mb-3">
                            Antes de venir
                        </span>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-6">
                            Qué traer
                        </h2>
                        <ul className="space-y-3 mb-10">
                            {traer.map(item => (
                                <li key={item} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-primary text-xl shrink-0">check_circle</span>
                                    <span className="text-sm md:text-base font-bold">{item}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                            <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-snug mb-2">
                                No hay formulario.
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                                Escribile al profe por WhatsApp, cuéntale la edad de tu hijo o hija y
                                lo demás se conversa. Pueden venir a probar una clase antes de decidir.
                            </p>
                            <BotonWhatsapp />
                        </div>
                    </div>

                </div>
            </section>

        </div>
        </>
    );
};

export default Academia;
