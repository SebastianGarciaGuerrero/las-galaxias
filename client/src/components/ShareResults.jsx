import { useShareImage } from './share/useShareImage';
import ShareButton from './share/ShareButton';
import ShareCardShell from './share/ShareCardShell';
import { horaChile } from '../utils/fecha';

// Una jornada en formato móvil para compartir por WhatsApp.
// Botón compacto (solo ícono) pensado para el header de cada jornada.
//
// La tarjeta dice "Jornada N" y no "Resultados": también se comparte antes
// de que se juegue, para avisar la programación.
const ShareResults = ({ league, round, matches, bye }) => {
    const { cardRef, status, share } = useShareImage(`jornada-${round}-${league?.name || 'liga'}`);

    if (!matches?.length) return null;

    // El encabezado lleva el día en que se jugó la jornada, no el día en que
    // uno la comparte.
    const fechaJornada = matches.reduce(
        (min, m) => (m.match_date && m.match_date < min ? m.match_date : min),
        matches[0].match_date,
    );

    return (
        <>
            <ShareButton
                status={status}
                onClick={share}
                label={`Compartir Jornada ${round}`}
                compact
            />

            <ShareCardShell cardRef={cardRef} league={league} date={fechaJornada}>
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
                    Jornada {round}
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
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#E13C64',
                                    color: '#ffffff',
                                    fontSize: 14,
                                    fontWeight: 900,
                                    lineHeight: 1,
                                    height: 32,
                                    minWidth: 64,
                                    padding: '0 14px',
                                    borderRadius: 8,
                                    flexShrink: 0,
                                    whiteSpace: 'nowrap',
                                }}>
                                    {match.home_score}&nbsp;-&nbsp;{match.away_score}
                                </span>
                            ) : (
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid rgba(255,255,255,0.25)',
                                    color: 'rgba(255,255,255,0.5)',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    height: 32,
                                    minWidth: 64,
                                    padding: '0 10px',
                                    borderRadius: 8,
                                    flexShrink: 0,
                                    whiteSpace: 'nowrap',
                                }}>
                                    {horaChile(match.match_date)}
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

                {/* Quién descansó esta jornada. Va abajo y apagado a propósito:
                    es un dato de contexto, no tiene que competir con los
                    resultados. */}
                {bye && (
                    <div style={{
                        padding: '10px 20px 2px',
                        textAlign: 'center',
                        color: 'rgba(225, 60, 100, 0.75)',
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                    }}>
                        Descansa {bye}
                    </div>
                )}
            </ShareCardShell>
        </>
    );
};

export default ShareResults;
