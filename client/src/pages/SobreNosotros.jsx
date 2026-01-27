import { useState } from 'react';

const SobreNosotros = () => {
    const [showModal, setShowModal] = useState(false);
    const [formStatus, setFormStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'

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
                    _subject: `Nuevo Mensaje Web: ${data.subject || 'Consulta General'}`, // Asunto del correo
                    _captcha: "false" // Desactivar captcha para hacerlo más rápido
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
        <div className="w-full animate-fade-in pb-20">

            {/* SECCIÓN 1: INTRODUCCIÓN E HISTORIA */}
            <div className="w-full max-w-[1280px] mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <span className="text-primary font-black uppercase tracking-widest text-sm flex items-center gap-2">
                            <span className="w-8 h-[2px] bg-primary"></span>
                            Desde 2017
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black uppercase text-slate-900 dark:text-white leading-none">
                            Fútbol y <br /> <span className="text-primary">Conciencia</span>.
                        </h1>
                        <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                            Fundado por un grupo de amigos en los cerros de <strong>Valparaíso</strong>, el Club Deportivo Las Galaxias nació para ser más que un equipo: somos una plataforma social.
                        </p>
                        <p className="text-slate-600 dark:text-slate-300 text-lg">
                            Con experiencia en academias formativas, equipos de fútbol 11 y torneos regionales, hoy nuestra casa está en el <strong>Estadio Bellavista</strong>.
                        </p>

                        {/* Ubicación Card */}
                        <div className="mt-6 bg-slate-100 dark:bg-slate-800/50 border-l-4 border-primary p-4 rounded-r-lg">
                            <h3 className="text-slate-900 dark:text-white font-black uppercase text-sm mb-1 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">location_on</span> Nuestra Casa
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Pasaje Prieto #1, Pleno Centro de Valparaíso.
                            </p>
                        </div>
                    </div>

                    <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden bg-slate-200 shadow-2xl rotate-2 hover:rotate-0 transition-all duration-500 group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-black/50 z-10 group-hover:opacity-60 transition-opacity"></div>
                        <img
                            src="https://images.unsplash.com/photo-1510051640316-54084b1141c2?q=80&w=2070&auto=format&fit=crop"
                            alt="Valparaíso Fútbol"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-6 left-6 z-20">
                            <span className="bg-black/70 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                                Estadio Bellavista
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: NUESTRAS LIGAS (GRID) */}
            <div className="bg-slate-50 dark:bg-slate-900/50 py-16 border-y border-slate-200 dark:border-slate-800">
                <div className="w-full max-w-[1280px] mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black uppercase text-slate-900 dark:text-white mb-4">Nuestras Ligas</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Dos formatos, dos experiencias, una misma pasión.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* LIGA MARTES - CONCIENCIA */}
                        <div className="bg-white dark:bg-black p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl hover:border-primary/50 transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <span className="material-symbols-outlined text-[150px]">forest</span>
                            </div>
                            <div className="relative z-10">
                                <span className="text-primary font-black uppercase text-xs tracking-widest mb-2 block">Temática y Educativa</span>
                                <h3 className="text-2xl font-black uppercase text-slate-900 dark:text-white mb-4">Liga de los Martes</h3>
                                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                                    Más que jugar, buscamos <strong>generar conciencia</strong>. Cada temporada la liga cambia su temática para educar sobre una causa particular.
                                </p>
                                <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 mb-4">
                                    <span className="block text-xs font-bold text-green-700 dark:text-green-400 uppercase mb-1">Temática Actual</span>
                                    <span className="font-black text-slate-900 dark:text-white uppercase">Bosque Esclerófilo</span>
                                </div>
                                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-base">check</span> Equipos con identidad educativa</li>
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-base">check</span> Ambiente formativo</li>
                                </ul>
                            </div>
                        </div>

                        {/* LIGA VIERNES - COMPETENCIA */}
                        <div className="bg-white dark:bg-black p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl hover:border-primary/50 transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <span className="material-symbols-outlined text-[150px]">emoji_events</span>
                            </div>
                            <div className="relative z-10">
                                <span className="text-slate-900 dark:text-white font-black uppercase text-xs tracking-widest mb-2 block">Alta Competencia</span>
                                <h3 className="text-2xl font-black uppercase text-slate-900 dark:text-white mb-4">SuperLiga Viernes</h3>
                                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                                    Donde los capitanes arman su propia historia. Una liga competitiva diseñada para el desafío puro.
                                </p>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-center">
                                        <span className="material-symbols-outlined text-red-500 block mb-1">arrow_downward</span>
                                        <span className="text-[10px] font-black uppercase text-slate-500">Descenso Directo</span>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-center">
                                        <span className="material-symbols-outlined text-orange-500 block mb-1">warning</span>
                                        <span className="text-[10px] font-black uppercase text-slate-500">Repechaje</span>
                                    </div>
                                </div>
                                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-base">check</span> Gestión de capitanes</li>
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-base">check</span> Premios y estadísticas</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 3: COLABORACIÓN Y CONTACTO */}
            <div className="w-full max-w-[1024px] mx-auto px-4 mt-16">
                <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <span className="material-symbols-outlined text-6xl mb-4">handshake</span>
                        <h2 className="text-3xl md:text-4xl font-black uppercase mb-4">¿Quieres Colaborar?</h2>
                        <p className="text-white/90 text-lg max-w-2xl mb-8">
                            Las Galaxias es un ecosistema abierto. Buscamos alianzas con organizaciones de <strong>reciclaje, arte, tecnología y deporte</strong> para seguir impactando Valparaíso.
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-white text-primary px-8 py-3 rounded-lg font-black uppercase tracking-widest hover:bg-slate-100 hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-primary">mail</span> Contáctanos
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL DE CONTACTO */}
            {showModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-up border border-slate-200 dark:border-slate-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-primary p-6 text-white flex justify-between items-center">
                            <h3 className="font-black uppercase text-xl">Enviar Mensaje</h3>
                            <button onClick={() => setShowModal(false)} className="hover:bg-white/20 rounded-full p-1 transition-colors">
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
    );
};

export default SobreNosotros;