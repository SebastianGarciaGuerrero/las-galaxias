import { useEffect, useState, useMemo } from 'react';
import TeamBadge from './TeamBadge';

const COLORS = ['#E13C64', '#FFD700', '#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ffffff'];

// Celebración de campeón: serpentinas, globos, trofeo y escudo del equipo.
// Se muestra ~3s y se desvanece sola.
const ChampionCelebration = ({ champion, durationMs = 5000 }) => {
    const [show, setShow] = useState(true);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        // Respeta reduce-motion: no anima, solo no muestra nada.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setShow(false);
            return;
        }
        const t1 = setTimeout(() => setLeaving(true), durationMs - 600);
        const t2 = setTimeout(() => setShow(false), durationMs);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [durationMs]);

    // Serpentinas y globos generados una sola vez.
    const confetti = useMemo(() =>
        Array.from({ length: 90 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 0.9,
            duration: 2 + Math.random() * 1.6,
            color: COLORS[i % COLORS.length],
            w: 6 + Math.random() * 8,
            h: 10 + Math.random() * 10,
            rotate: Math.random() * 360,
            round: Math.random() > 0.6,
        })), []);

    const balloons = useMemo(() =>
        Array.from({ length: 10 }, (_, i) => ({
            id: i,
            left: 4 + Math.random() * 92,
            delay: Math.random() * 0.7,
            duration: 3 + Math.random() * 1.2,
            color: COLORS[i % COLORS.length],
            size: 36 + Math.random() * 24,
        })), []);

    if (!show || !champion) return null;

    return (
        <div className={`fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden ${leaving ? 'animate-fadeOut' : 'animate-fadeIn'}`}>
            {/* Fondo */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

            {/* Serpentinas cayendo */}
            {confetti.map(c => (
                <span
                    key={`c${c.id}`}
                    style={{
                        position: 'absolute',
                        top: '-30px',
                        left: `${c.left}%`,
                        width: c.w,
                        height: c.h,
                        backgroundColor: c.color,
                        borderRadius: c.round ? '50%' : '2px',
                        transform: `rotate(${c.rotate}deg)`,
                        animation: `confettiFall ${c.duration}s linear ${c.delay}s forwards`,
                    }}
                />
            ))}

            {/* Globos subiendo */}
            {balloons.map(b => (
                <div
                    key={`b${b.id}`}
                    style={{
                        position: 'absolute',
                        bottom: '-140px',
                        left: `${b.left}%`,
                        animation: `balloonRise ${b.duration}s ease-in ${b.delay}s forwards`,
                    }}
                >
                    <div style={{
                        width: b.size,
                        height: b.size * 1.2,
                        borderRadius: '50%',
                        background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.6), ${b.color} 55%)`,
                    }} />
                    <div style={{ width: 1, height: b.size, backgroundColor: 'rgba(255,255,255,0.4)', margin: '0 auto' }} />
                </div>
            ))}

            {/* Tarjeta central */}
            <div className="relative z-10 text-center px-6" style={{ animation: 'trophyPop 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
                <div className="text-7xl md:text-8xl mb-3" style={{ animation: 'trophyBounce 1.2s ease-in-out 0.5s infinite' }}>🏆</div>
                <div className="flex justify-center mb-4 drop-shadow-2xl">
                    <TeamBadge name={champion.name} shieldUrl={champion.shield_url} size={104} />
                </div>
                <p className="text-yellow-400 font-black uppercase tracking-[0.35em] text-xs md:text-sm mb-2">¡Campeón!</p>
                <h2 className="text-white font-black text-3xl md:text-5xl uppercase leading-none drop-shadow-lg">
                    {champion.name}
                </h2>
            </div>

            <style>{`
                @keyframes confettiFall {
                    0%   { opacity: 1; }
                    100% { transform: translateY(110vh) rotate(900deg); opacity: 1; }
                }
                @keyframes balloonRise {
                    0%   { opacity: 0.95; }
                    100% { transform: translateY(-115vh); opacity: 0.95; }
                }
                @keyframes trophyPop {
                    0%   { transform: scale(0.3); opacity: 0; }
                    60%  { transform: scale(1.12); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes trophyBounce {
                    0%, 100% { transform: translateY(0); }
                    50%      { transform: translateY(-12px); }
                }
            `}</style>
        </div>
    );
};

export default ChampionCelebration;
