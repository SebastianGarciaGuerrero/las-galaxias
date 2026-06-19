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
const SPECIAL_PALETTES = [
    { match: 'samba', bg: '#FFDF00', fg: '#009C3B' }, // Brasil: amarillo + verde
];

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
            <path
                d="M20 1 L37 6 V22 C37 33 29.5 40 20 43 C10.5 40 3 33 3 22 V6 Z"
                fill={palette.bg}
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.5"
            />
            <text
                x="20"
                y="25"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={palette.fg}
                fontSize="15"
                fontWeight="900"
                fontFamily="Outfit, sans-serif"
            >
                {initials}
            </text>
        </svg>
    );
};

export default TeamBadge;
