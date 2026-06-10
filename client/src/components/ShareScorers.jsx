import { useShareImage } from './share/useShareImage';
import ShareButton from './share/ShareButton';
import ShareCardShell from './share/ShareCardShell';

const MEDALS = ['🥇', '🥈', '🥉'];

// Tabla de goleadores en formato móvil para compartir por WhatsApp.
const ShareScorers = ({ league, scorers }) => {
    const { cardRef, status, share } = useShareImage(`goleadores-${league?.name || 'liga'}`);

    if (!scorers?.length) return null;

    const topScorers = scorers.slice(0, 10);

    return (
        <>
            <ShareButton status={status} onClick={share} label="Compartir Goleadores" />

            <ShareCardShell cardRef={cardRef} league={league}>
                {/* Barra de título */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 20px',
                    backgroundColor: '#E13C64',
                    color: '#ffffff',
                    fontSize: 10,
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                }}>
                    <span>Goleadores</span>
                    <span>Goles</span>
                </div>

                {/* Filas */}
                {topScorers.map((scorer, index) => {
                    const isTop3 = index < 3;
                    return (
                        <div
                            key={scorer.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: isTop3 ? '13px 20px' : '10px 20px',
                                backgroundColor: index % 2 === 0 ? '#141414' : '#0a0a0a',
                                borderLeft: isTop3 ? '3px solid #E13C64' : '3px solid transparent',
                            }}
                        >
                            <span style={{
                                width: 30,
                                fontSize: isTop3 ? 17 : 13,
                                fontWeight: 900,
                                color: 'rgba(255,255,255,0.4)',
                            }}>
                                {isTop3 ? MEDALS[index] : index + 1}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    color: '#ffffff',
                                    fontSize: isTop3 ? 15 : 13,
                                    fontWeight: isTop3 ? 900 : 700,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>
                                    {scorer.name}
                                </div>
                                <div style={{
                                    color: 'rgba(255,255,255,0.45)',
                                    fontSize: 10,
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}>
                                    {scorer.team}
                                </div>
                            </div>
                            <span style={{
                                color: '#E13C64',
                                fontSize: isTop3 ? 20 : 16,
                                fontWeight: 900,
                                marginLeft: 12,
                            }}>
                                {scorer.goals}
                            </span>
                        </div>
                    );
                })}
            </ShareCardShell>
        </>
    );
};

export default ShareScorers;
