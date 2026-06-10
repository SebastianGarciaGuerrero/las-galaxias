// Marco común de las tarjetas compartibles: header con escudo y nombre
// de la liga, contenido al medio y footer con el link del sitio.
// Se renderiza fuera de pantalla; el ref apunta al nodo que se captura.

const SHIELD_LOGO = 'https://res.cloudinary.com/du4oddnjl/image/upload/v1777847657/shieldRed_rbivg8.svg';

const ShareCardShell = ({ cardRef, league, children }) => {
    const today = new Date().toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div style={{ position: 'fixed', left: '-9999px', top: 0, pointerEvents: 'none' }} aria-hidden="true">
            <div
                ref={cardRef}
                style={{
                    width: 420,
                    backgroundColor: '#0a0a0a',
                    fontFamily: "'Outfit', sans-serif",
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div style={{ padding: '28px 24px 20px', textAlign: 'center' }}>
                    <img
                        src={SHIELD_LOGO}
                        alt="CD Las Galaxias"
                        crossOrigin="anonymous"
                        style={{ width: 72, height: 'auto', margin: '0 auto 14px', display: 'block' }}
                    />
                    <div style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.25em',
                        marginBottom: 6,
                    }}>
                        [ {league?.day_label || 'Liga'} ]
                    </div>
                    <div style={{
                        color: '#E13C64',
                        fontSize: 30,
                        fontWeight: 900,
                        lineHeight: 1,
                        marginBottom: 4,
                    }}>
                        {league?.name || 'Las Galaxias'}
                    </div>
                    <div style={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: 12,
                        fontWeight: 600,
                    }}>
                        {league?.season} · {today}
                    </div>
                </div>

                {children}

                {/* Footer con link */}
                <div style={{
                    padding: '18px 24px 22px',
                    textAlign: 'center',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    marginTop: 4,
                }}>
                    <div style={{
                        color: '#ffffff',
                        fontSize: 13,
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        marginBottom: 3,
                    }}>
                        lasgalaxias.cl
                    </div>
                    <div style={{
                        color: 'rgba(255,255,255,0.45)',
                        fontSize: 10,
                        fontWeight: 600,
                    }}>
                        Resultados, goleadores y más en nuestro sitio
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareCardShell;
