import TeamBadge from './TeamBadge';
import { useShareImage } from './share/useShareImage';
import ShareButton from './share/ShareButton';
import ShareCardShell from './share/ShareCardShell';

// Tabla de posiciones en formato móvil para compartir por WhatsApp.
const ShareStandings = ({ league, standings }) => {
    const { cardRef, status, share } = useShareImage(`tabla-${league?.name || 'liga'}`);

    if (!standings?.length) return null;

    return (
        <>
            <ShareButton status={status} onClick={share} label="Compartir Tabla" />

            <ShareCardShell cardRef={cardRef} league={league}>
                {/* Encabezado de columnas */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 20px',
                    backgroundColor: '#E13C64',
                    color: '#ffffff',
                    fontSize: 10,
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                }}>
                    <span style={{ width: 26 }}>#</span>
                    <span style={{ flex: 1 }}>Equipo</span>
                    <span style={{ width: 34, textAlign: 'center' }}>PJ</span>
                    <span style={{ width: 38, textAlign: 'center' }}>DIF</span>
                    <span style={{ width: 40, textAlign: 'center' }}>PTS</span>
                </div>

                {/* Filas */}
                {standings.map((team, index) => {
                    const dif = team.goals_for - team.goals_against;
                    const isTop3 = index < 3;
                    return (
                        <div
                            key={team.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '11px 20px',
                                backgroundColor: index % 2 === 0 ? '#141414' : '#0a0a0a',
                                borderLeft: isTop3 ? '3px solid #E13C64' : '3px solid transparent',
                            }}
                        >
                            <span style={{
                                width: 23,
                                color: isTop3 ? '#E13C64' : 'rgba(255,255,255,0.4)',
                                fontSize: 13,
                                fontWeight: 900,
                            }}>
                                {index + 1}
                            </span>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                                <TeamBadge name={team.name} shieldUrl={team.shield_url} size={26} />
                                {/* Una sola línea, pase lo que pase.
                                    Acá vivía overflowWrap: 'anywhere', y por eso la
                                    tarjeta compartida mostraba "No / Comai" y
                                    "Charchala / x": html-to-image clona el nodo
                                    copiándole el estilo calculado, y ahí entra el
                                    ancho ya usado en píxeles —58.3px para "No
                                    Comai", justo lo que mide el texto—. Al volver a
                                    dibujarlo, el texto pide una pizca más que ese
                                    ancho congelado y 'anywhere' lo deja partir en
                                    cualquier letra. Con nowrap ese sobrante de menos
                                    de un píxel no rompe nada.

                                    No hay riesgo de que se corte: al nombre le
                                    quedan 207px y el más largo de todos, "Vasco de
                                    Gramo", mide 98. */}
                                <span style={{
                                    color: '#ffffff',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    lineHeight: 1.2,
                                    whiteSpace: 'nowrap',
                                }}>
                                    {team.name}
                                </span>
                            </div>
                            <span style={{
                                width: 34,
                                textAlign: 'center',
                                color: 'rgba(255,255,255,0.65)',
                                fontSize: 13,
                                fontWeight: 600,
                            }}>
                                {team.played}
                            </span>
                            <span style={{
                                width: 38,
                                textAlign: 'center',
                                color: dif > 0 ? '#4ade80' : dif < 0 ? '#f87171' : 'rgba(255,255,255,0.65)',
                                fontSize: 13,
                                fontWeight: 700,
                            }}>
                                {dif > 0 ? `+${dif}` : dif}
                            </span>
                            <span style={{
                                width: 40,
                                textAlign: 'center',
                                color: '#E13C64',
                                fontSize: 16,
                                fontWeight: 900,
                            }}>
                                {team.points}
                            </span>
                        </div>
                    );
                })}
            </ShareCardShell>
        </>
    );
};

export default ShareStandings;
