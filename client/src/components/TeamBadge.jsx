// Escudo predeterminado para equipos sin logo propio.
// Determinístico: el mismo nombre siempre genera el mismo escudo (color + iniciales).

const PALETTES = [
    { bg: '#E13C64', fg: '#ffffff' }, // rosado club
    { bg: '#1d4ed8', fg: '#ffffff' }, // azul
    { bg: '#047857', fg: '#ffffff' }, // verde
    { bg: '#b45309', fg: '#ffffff' }, // ámbar
    { bg: '#6d28d9', fg: '#ffffff' }, // violeta
    { bg: '#0e7490', fg: '#ffffff' }, // cian
    { bg: '#be123c', fg: '#ffffff' }, // carmesí
    { bg: '#374151', fg: '#ffffff' }, // gris carbón
    { bg: '#ca8a04', fg: '#1c1917' }, // dorado
    { bg: '#0f766e', fg: '#ffffff' }, // teal
];

// Colores personalizados para equipos específicos (match por substring del nombre).
// Con `bg2` el escudo sale partido al medio: `bg` a la izquierda y `bg2` a la
// derecha. El celeste lleva texto oscuro porque el blanco encima no se lee.
const SPECIAL_PALETTES = [
    { match: 'samba', bg: '#FFDF00', fg: '#009C3B' },                       // Brasil: amarillo + verde
    { match: 'violeta', bg: '#6D28D9', fg: '#ffffff' },                     // morado
    { match: 'cochrane', bg: '#38BDF8', fg: '#0B3A5B' },                    // celeste
    { match: 'charchalax', bg: '#DC2626', bg2: '#111827', fg: '#ffffff' },  // rojo y negro
    { match: 'malajax', bg: '#DC2626', bg2: '#F8FAFC', fg: '#ffffff' },     // rojo y blanco
    { match: 'motafogo', bg: '#047857', bg2: '#111827', fg: '#ffffff' },    // verde y negro
];

// El escudo entero y sus dos mitades, partidas por el eje x=20. Se dibujan como
// dos paths sólidos en vez de un degradado o un clipPath: html-to-image los
// rasteriza sin problemas y no hace falta inventar ids únicos por instancia.
const ESCUDO = 'M20 1 L37 6 V22 C37 33 29.5 40 20 43 C10.5 40 3 33 3 22 V6 Z';
const MITAD_IZQ = 'M20 1 L3 6 V22 C3 33 10.5 40 20 43 Z';
const MITAD_DER = 'M20 1 L37 6 V22 C37 33 29.5 40 20 43 Z';

const hashName = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    }
    return hash;
};

const getInitials = (name) => {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '?';
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
};

const TeamBadge = ({ name = '', shieldUrl = null, size = 28 }) => {
    if (shieldUrl) {
        return (
            <img
                src={shieldUrl}
                alt={`Escudo ${name}`}
                width={size}
                height={size}
                crossOrigin="anonymous"
                style={{ width: size, height: size }}
                className="rounded-full object-cover shrink-0"
            />
        );
    }

    const lower = name.toLowerCase();
    const special = SPECIAL_PALETTES.find(s => lower.includes(s.match));
    const palette = special || PALETTES[hashName(name) % PALETTES.length];
    const initials = getInitials(name);

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 40 44"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
            role="img"
            aria-label={`Escudo ${name}`}
        >
            {/* Forma de escudo */}
            {palette.bg2 ? (
                <>
                    <path d={MITAD_IZQ} fill={palette.bg} />
                    <path d={MITAD_DER} fill={palette.bg2} />
                    <path d={ESCUDO} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                </>
            ) : (
                <path d={ESCUDO} fill={palette.bg} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
            )}
            <text
                x="20"
                y="25"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={palette.fg}
                fontSize="15"
                fontWeight="900"
                fontFamily="Outfit, sans-serif"
                // En los partidos las iniciales quedan encima de los dos colores, así
                // que van con un contorno oscuro: sin él, la "MA" blanca de Malajax
                // desaparece sobre la mitad blanca.
                {...(palette.bg2 && {
                    stroke: '#0F172A',
                    strokeWidth: 2.4,
                    paintOrder: 'stroke',
                    strokeLinejoin: 'round',
                })}
            >
                {initials}
            </text>
        </svg>
    );
};

export default TeamBadge;
