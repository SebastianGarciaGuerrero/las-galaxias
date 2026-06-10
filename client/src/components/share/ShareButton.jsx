// Botón de compartir reutilizable con estados visuales.
// `compact` muestra solo el ícono (para espacios reducidos como las jornadas).

const ICONS = {
    idle: 'photo_camera',
    working: 'hourglass_top',
    copied: 'check_circle',
    downloaded: 'download_done',
    error: 'error',
};

const STATUS_LABELS = {
    working: 'Generando...',
    copied: '¡Copiada! Pégala en WhatsApp',
    downloaded: 'Imagen descargada',
    error: 'Error, intenta de nuevo',
};

const ShareButton = ({ status, onClick, label = 'Compartir', compact = false }) => {
    const colorClass =
        status === 'copied' || status === 'downloaded'
            ? 'bg-green-500 text-white'
            : status === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-primary hover:bg-primary/85 text-white';

    if (compact) {
        return (
            <button
                onClick={onClick}
                disabled={status === 'working'}
                title={STATUS_LABELS[status] || label}
                aria-label={label}
                className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors shrink-0 ${colorClass} disabled:opacity-70`}
            >
                <span className="material-symbols-outlined text-[18px] leading-none">{ICONS[status]}</span>
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            disabled={status === 'working'}
            className={`inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] px-5 py-2.5 rounded-full transition-colors ${colorClass} disabled:opacity-70`}
        >
            <span className="material-symbols-outlined text-[16px] leading-none">{ICONS[status]}</span>
            {STATUS_LABELS[status] || label}
        </button>
    );
};

export default ShareButton;
