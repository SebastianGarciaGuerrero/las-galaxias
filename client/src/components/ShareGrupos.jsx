import TeamBadge from './TeamBadge';
import { useShareImage } from './share/useShareImage';
import ShareButton from './share/ShareButton';
import ShareCardShell from './share/ShareCardShell';

// Los dos grupos de la segunda fase en una sola tarjeta, uno al lado del
// otro. Va aparte de ShareStandings porque no es una tabla más larga sino
// dos tablas en paralelo: compartir los grupos por separado obligaba a
// mandar dos imágenes para contar una sola cosa.
//
// Cada grupo mantiene el color que tiene en la página: verde el A y azul
// el B. Acá van en hexadecimal porque la tarjeta se dibuja con estilos en
// línea, que es lo que html-to-image sabe clonar.
const COLORES = { A: '#10b981', B: '#3b82f6' };

// La tarjeta va apaisada justamente por esto: cada grupo se queda con la
// mitad del ancho, y en el marco vertical de 432px eso dejaba columnas de
// 210px. Apaisada son 540 y cada tabla trabaja con 265.
const Grupo = ({ letra, grupo }) => {
    const color = COLORES[letra];
    const filas = grupo.tabla.length ? grupo.tabla : grupo.clasificados;
    const jugando = grupo.tabla.length > 0;

    return (
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                padding: '10px 10px',
                backgroundColor: color,
                color: '#0a0a0a',
                fontSize: 14,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
            }}>
                {/* Los dos van con nowrap por lo mismo que los nombres de los
                    equipos: al exportar, html-to-image clona el nodo con el
                    ancho ya medido en pixeles y al redibujarlo el texto pide
                    una pizca mas, asi que 'GRUPO A' salia partido en dos
                    lineas con la A colgando abajo. */}
                <span style={{ whiteSpace: 'nowrap' }}>Grupo {letra}</span>
                <span style={{ fontSize: 8, opacity: 0.75, whiteSpace: 'nowrap' }}>{jugando ? 'PJ · PTS' : ''}</span>
            </div>

            {filas.length === 0 ? (
                <div style={{
                    padding: '22px 10px',
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.35)',
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    whiteSpace: 'nowrap',
                }}>
                    Por definir
                </div>
            ) : filas.map((team, index) => (
                <div
                    key={team.id}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '10px 12px',
                        backgroundColor: index % 2 === 0 ? '#141414' : '#0a0a0a',
                        borderLeft: index === 0 && jugando ? `3px solid ${color}` : '3px solid transparent',
                    }}
                >
                    <span style={{ width: 9, color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900 }}>
                        {index + 1}
                    </span>
                    <TeamBadge name={team.name} shieldUrl={team.shield_url} size={21} />
                    {/* Sin cortes de línea, como en las otras tarjetas: al
                        exportar, html-to-image congela el ancho y cualquier
                        sobrante parte el nombre al medio. */}
                    <span style={{
                        flex: 1,
                        minWidth: 0,
                        color: '#ffffff',
                        fontSize: 11,
                        fontWeight: 700,
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                    }}>
                        {team.name}
                    </span>
                    {jugando && (
                        <>
                            <span style={{ width: 14, textAlign: 'center', color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 600 }}>
                                {team.played}
                            </span>
                            <span style={{ width: 18, textAlign: 'center', color: '#E13C64', fontSize: 16, fontWeight: 900 }}>
                                {team.points}
                            </span>
                        </>
                    )}
                </div>
            ))}

            <div style={{
                padding: '10px 10px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                color: grupo.campeon ? color : 'rgba(255,255,255,0.35)',
                fontSize: 9,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
            }}>
                {grupo.campeon ? `Campeón: ${grupo.campeon.name}` : 'Campeón por definir'}
            </div>
        </div>
    );
};

const ShareGrupos = ({ league, fases }) => {
    const { cardRef, status, share } = useShareImage(`grupos-${league?.name || 'liga'}`);

    if (!fases?.grupoA || !fases?.grupoB) return null;

    return (
        <>
            <ShareButton status={status} onClick={share} label="Compartir Grupos" />

            <ShareCardShell cardRef={cardRef} league={league} apaisada>
                <div style={{
                    padding: '8px 20px',
                    backgroundColor: '#E13C64',
                    color: '#ffffff',
                    fontSize: 10,
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                }}>
                    Segunda Fase
                </div>

                <div style={{ display: 'flex', gap: 2, padding: '8px 6px 0' }}>
                    <Grupo letra="A" grupo={fases.grupoA} />
                    <Grupo letra="B" grupo={fases.grupoB} />
                </div>
            </ShareCardShell>
        </>
    );
};

export default ShareGrupos;
