// Marco común de las tarjetas compartibles: header con escudo y nombre
// de la liga, contenido al medio y footer con el link del sitio.
// Se renderiza fuera de pantalla; el ref apunta al nodo que se captura.
//
// TAMAÑO FIJO 4:5
// Antes la tarjeta tenía ancho fijo y alto libre: una jornada de 3 partidos
// salía casi cuadrada y la tabla de los martes salía el doble de larga.
// Compartida por WhatsApp, la larga llegaba recortada en la burbuja y había
// que abrirla para leerla entera.
//
// Ahora todas salen de 1080x1350 (4:5, el retrato que WhatsApp muestra
// completo sin recortar). 432x540 de CSS por 2.5 de pixelRatio dan justo
// esos 1080x1350; si se cambia uno hay que mirar el otro.
//
// Como el alto ya no lo pone el contenido, el contenido se achica para
// entrar: se mide y, si pasa del espacio libre, se escala. Una tabla de 6
// equipos entra tal cual; una de 10 sale más chica pero completa. El
// transform no cambia el alto de layout, así que medir no se muerde la cola.

import { useLayoutEffect, useRef } from 'react';
import shieldRed from '../../assets/shieldRed.svg';
import { fechaChile } from '../../utils/fecha';
const SHIELD_LOGO = shieldRed;

const CARD_WIDTH = 432;
const CARD_HEIGHT = 540;

// `date` es la fecha que va en el encabezado. Los resultados de una jornada
// mandan la fecha en que se jugó; el resto (tabla, goleadores) es una foto
// del momento, así que cae al día de hoy. Siempre en hora de Chile: antes
// usaba la zona del dispositivo y la tarjeta salía con el día cambiado.
const ShareCardShell = ({ cardRef, league, date, children }) => {
    const today = fechaChile(date || new Date());
    const areaRef = useRef(null);
    const contenidoRef = useRef(null);

    // La escala se escribe directo en el nodo y no en un estado: guardarla en
    // un useState sería pedir un segundo render para algo que no se ve —la
    // tarjeta vive fuera de pantalla— y dejaría al componente renderizando de
    // nuevo cada vez que se mide.
    useLayoutEffect(() => {
        const area = areaRef.current;
        const contenido = contenidoRef.current;
        if (!area || !contenido) return;

        const alto = contenido.scrollHeight;
        const libre = area.clientHeight;
        contenido.style.transform = alto > libre && alto > 0 ? `scale(${libre / alto})` : 'none';
    });

    return (
        <div style={{ position: 'fixed', left: '-9999px', top: 0, pointerEvents: 'none' }} aria-hidden="true">
            <div
                ref={cardRef}
                style={{
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#0a0a0a',
                    fontFamily: "'Outfit', sans-serif",
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div style={{ padding: '16px 24px 10px', textAlign: 'center', flexShrink: 0 }}>
                    <img
                        src={SHIELD_LOGO}
                        alt="CD Las Galaxias"
                        crossOrigin="anonymous"
                        style={{ width: 42, height: 'auto', margin: '0 auto 8px', display: 'block' }}
                    />
                    <div style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: 8,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.25em',
                        marginBottom: 4,
                    }}>
                        [ {league?.day_label || 'Liga'} ]
                    </div>
                    <div style={{
                        color: '#E13C64',
                        fontSize: 22,
                        fontWeight: 900,
                        lineHeight: 1,
                        marginBottom: 4,
                    }}>
                        {league?.name || 'Las Galaxias'}
                    </div>
                    <div style={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: 10,
                        fontWeight: 600,
                    }}>
                        {league?.season} · {today}
                    </div>
                </div>

                {/* Contenido, centrado en lo que sobra y achicado si no entra */}
                <div
                    ref={areaRef}
                    style={{
                        flex: 1,
                        minHeight: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        overflow: 'hidden',
                    }}
                >
                    <div ref={contenidoRef} style={{ transformOrigin: 'center center' }}>
                        {children}
                    </div>
                </div>

                {/* Footer con link */}
                <div style={{
                    padding: '10px 24px 12px',
                    textAlign: 'center',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    flexShrink: 0,
                }}>
                    <div style={{
                        color: '#ffffff',
                        fontSize: 11,
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        marginBottom: 2,
                    }}>
                        lasgalaxias.cl
                    </div>
                    <div style={{
                        color: 'rgba(255,255,255,0.45)',
                        fontSize: 8,
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
