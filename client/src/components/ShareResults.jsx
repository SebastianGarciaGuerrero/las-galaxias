import { useShareImage } from './share/useShareImage';
import ShareButton from './share/ShareButton';
import ShareCardShell from './share/ShareCardShell';

const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Santiago',
        hour12: false,
    });

// Resultados de una jornada en formato móvil para compartir por WhatsApp.
// Botón compacto (solo ícono) pensado para el header de cada jornada.
const ShareResults = ({ league, round, matches }) => {
    const { cardRef, status, share } = useShareImage(`resultados-j${round}-${league?.name || 'liga'}`);

    if (!matches?.length) return null;

    return (
        <>
            <ShareButton
                status={status}
                onClick={share}
                label={`Compartir resultados Jornada ${round}`}
                compact
            />

            <ShareCardShell cardRef={cardRef} league={league}>
                {/* Barra de título */}
                <div style={{
                    padding: '10px 20px',
                    backgroundColor: '#E13C64',
                    color: '#ffffff',
                    fontSize: 10,
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    textAlign: 'center',
                }}>
                    Resultados · Jornada {round}
                </div>

                {/* Partidos */}
                {matches.map((match, index) => {
                    const finished = match.status === 'finished';
                    return (
                        <div
                            key={match.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '14px 16px',
                                backgroundColor: index % 2 === 0 ? '#141414' : '#0a0a0a',
                                gap: 10,
                            }}
                        >
                            <span style={{
                                flex: 1,
                                textAlign: 'right',
                                color: '#ffffff',
                                fontSize: 13,
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>
                                {match.home?.name}
                            </span>

                            {finished ? (
                                <span style={{
                                    backgroundColor: '#E13C64',
                                    color: '#ffffff',
                                    fontSize: 14,
                                    fontWeight: 900,
                                    padding: '5px 14px',
                                    borderRadius: 8,
                                    minWidth: 58,
                                    textAlign: 'center',
                                    flexShrink: 0,
                                    whiteSpace: 'nowrap',
                                }}>
                                    {match.home_score}&nbsp;-&nbsp;{match.away_score}
                                </span>
                            ) : (
                                <span style={{
                                    border: '1px solid rgba(255,255,255,0.25)',
                                    color: 'rgba(255,255,255,0.5)',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    padding: '5px 10px',
                                    borderRadius: 8,
                                    minWidth: 58,
                                    textAlign: 'center',
                                    flexShrink: 0,
                                }}>
                                    {formatTime(match.match_date)}
                                </span>
                            )}

                            <span style={{
                                flex: 1,
                                textAlign: 'left',
                                color: '#ffffff',
                                fontSize: 13,
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>
                                {match.away?.name}
                            </span>
                        </div>
                    );
                })}
            </ShareCardShell>
        </>
    );
};

export default ShareResults;
