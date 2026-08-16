import { Fragment } from 'react';
import TeamBadge from './TeamBadge';
import ShareStandings from './ShareStandings';
import { CUPOS_GRUPO_A, etapaActual } from '../utils/fases';

// Vista del torneo de tres etapas: primera fase, los dos grupos y la final.
// Reemplaza a la "Tabla General" en las ligas que usan este formato, porque
// una sola tabla mezclaría la primera fase con los grupos y no se entendería
// nada.
//
// Cada grupo tiene su color y lo mantiene en todas las secciones: verde para
// el Grupo A (los que salieron 1° al 4°) y azul para el Grupo B (5° al 8°).
// Es el mismo código de colores del afiche del formato.

const COLORES = {
    A: {
        texto: 'text-emerald-600 dark:text-emerald-400',
        borde: 'border-emerald-500/40',
        fondo: 'bg-emerald-50 dark:bg-emerald-900/10',
        barra: 'bg-emerald-500',
    },
    B: {
        texto: 'text-blue-600 dark:text-blue-400',
        borde: 'border-blue-500/40',
        fondo: 'bg-blue-50 dark:bg-blue-900/10',
        barra: 'bg-blue-500',
    },
};

// ---------------------------------------------------------------
// Tira de etapas: los tres pasos del torneo, con el actual encendido.
// ---------------------------------------------------------------
const TiraDeEtapas = ({ actual }) => {
    const pasos = [
        {
            n: 1,
            titulo: 'Primera Fase',
            detalle: 'Todos contra todos',
            texto: 'Los ocho equipos se enfrentan una vez cada uno: siete fechas de cuatro partidos, a las 19, 20, 21 y 22 horas. Tres puntos por victoria, uno por empate.',
        },
        {
            n: 2,
            titulo: 'Segunda Fase',
            detalle: 'Grupo A y Grupo B',
            texto: 'La tabla se parte al medio. Del 1° al 4° arman el Grupo A y del 5° al 8° el Grupo B. Cada grupo vuelve a jugar todos contra todos, desde cero, y saca su campeón.',
        },
        {
            n: 3,
            titulo: 'Final',
            detalle: 'Sale el Súper Campeón',
            texto: 'El campeón del Grupo A juega contra el campeón del Grupo B. El que gana ese partido es el Súper Campeón de CD Las Galaxias.',
        },
    ];

    return (
        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
            {pasos.map(paso => {
                const activo = paso.n === actual;
                const cumplido = paso.n < actual;
                return (
                    <li
                        key={paso.n}
                        aria-current={activo ? 'step' : undefined}
                        className={`rounded-xl border p-4 transition-colors ${
                            activo
                                ? 'border-primary bg-primary/5'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-black ${
                                activo
                                    ? 'bg-primary text-white'
                                    : cumplido
                                        ? 'bg-slate-900 text-white dark:bg-slate-700'
                                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                            }`}>
                                {paso.n}
                            </span>
                            <div className="min-w-0">
                                <p className={`text-sm font-black uppercase tracking-wide leading-none ${
                                    activo ? 'text-primary' : 'text-slate-900 dark:text-white'
                                }`}>
                                    {paso.titulo}
                                </p>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1 truncate">
                                    {paso.detalle}
                                </p>
                            </div>
                        </div>
                        {/* La explicación de cada etapa, en chico. Es la primera vez
                            que se juega este formato, así que conviene que esté a
                            la vista y no escondida en una nota al pie. */}
                        <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                            {paso.texto}
                        </p>
                    </li>
                );
            })}
        </ol>
    );
};

// ---------------------------------------------------------------
// Tabla completa de la primera fase, con la línea de corte al medio.
// ---------------------------------------------------------------
const TablaPrimeraFase = ({ tabla, terminada }) => (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900">
        <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900 dark:bg-black border-b border-slate-800">
                <tr>
                    <th className="px-6 py-4">Pos</th>
                    <th className="px-6 py-4">Equipo</th>
                    <th className="px-6 py-4 text-center text-white font-black">PTS</th>
                    <th className="px-6 py-4 text-center">PJ</th>
                    <th className="px-6 py-4 text-center hidden sm:table-cell">PG</th>
                    <th className="px-6 py-4 text-center hidden sm:table-cell">PE</th>
                    <th className="px-6 py-4 text-center hidden sm:table-cell">PP</th>
                    <th className="px-6 py-4 text-center text-slate-300">GF</th>
                    <th className="px-6 py-4 text-center text-slate-300">GC</th>
                    <th className="px-6 py-4 text-center text-white font-bold">DIF</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {tabla.map((team, index) => {
                    const grupo = index < CUPOS_GRUPO_A ? 'A' : 'B';
                    const color = COLORES[grupo];
                    // La banda de "división de la tabla" va justo después del
                    // cuarto: es la que explica de un vistazo por qué la tabla
                    // está pintada de dos colores.
                    const corte = index === CUPOS_GRUPO_A;

                    return (
                        <Fragment key={team.id}>
                            {corte && (
                                <tr className="bg-slate-50 dark:bg-slate-800/40">
                                    <td colSpan={10} className="px-6 py-2 text-center text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                                        División de la tabla
                                    </td>
                                </tr>
                            )}
                            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`h-6 w-1 shrink-0 rounded-full ${color.barra}`} />
                                        <span className="flex size-6 items-center justify-center rounded text-xs font-bold text-slate-500">
                                            {index + 1}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                    <div className="flex items-center gap-3">
                                        <TeamBadge name={team.name} shieldUrl={team.shield_url} size={24} />
                                        {team.name}
                                        <span className={`hidden md:inline text-[10px] font-black uppercase tracking-widest ${color.texto}`}>
                                            Grupo {grupo}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center font-black text-lg text-primary">{team.points}</td>
                                <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">{team.played}</td>
                                <td className="px-6 py-4 text-center hidden sm:table-cell text-slate-600 dark:text-slate-400">{team.won}</td>
                                <td className="px-6 py-4 text-center hidden sm:table-cell text-slate-600 dark:text-slate-400">{team.drawn}</td>
                                <td className="px-6 py-4 text-center hidden sm:table-cell text-slate-600 dark:text-slate-400">{team.lost}</td>
                                <td className="px-6 py-4 text-center font-medium text-slate-700 dark:text-slate-300">{team.goals_for}</td>
                                <td className="px-6 py-4 text-center font-medium text-slate-700 dark:text-slate-300">{team.goals_against}</td>
                                <td className="px-6 py-4 text-center font-black text-slate-900 dark:text-white">{team.gd}</td>
                            </tr>
                        </Fragment>
                    );
                })}
            </tbody>
        </table>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 border-t border-slate-200 dark:border-slate-800 px-6 py-3">
            <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <span className={`size-2 rounded-full ${COLORES.A.barra}`} /> 1° al 4° · Grupo A
            </span>
            <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <span className={`size-2 rounded-full ${COLORES.B.barra}`} /> 5° al 8° · Grupo B
            </span>
            {!terminada && (
                <span className="sm:ml-auto text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    La división queda firme al terminar la fase
                </span>
            )}
        </div>
    </div>
);

// ---------------------------------------------------------------
// Tarjeta de un grupo de la segunda fase.
// ---------------------------------------------------------------
// Los cuatro puestos del grupo cuando todavía no se sabe quién los ocupa: van
// "Por definir" con su número de clasificación, igual que en el afiche del
// formato. Quién los ocuparía hoy se ve en la tabla de la primera fase, que
// marca al 1°-4° en verde y al 5°-8° en azul.
const CuposDelGrupo = ({ letra }) => {
    const desde = letra === 'A' ? 1 : 5;
    return (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {[0, 1, 2, 3].map(i => (
                <li key={i} className="flex items-center gap-3 px-5 py-3">
                    <span className="w-6 shrink-0 text-xs font-black text-slate-400">{desde + i}°</span>
                    <span className="size-[22px] shrink-0 rounded-full border border-dashed border-slate-300 dark:border-slate-700" />
                    <span className="flex-1 border-b border-dashed border-slate-200 pb-1 text-sm font-bold uppercase tracking-wider text-slate-400 dark:border-slate-700">
                        Por definir
                    </span>
                </li>
            ))}
        </ul>
    );
};

// Los cuatro clasificados, ya con nombre pero sin haber jugado todavía.
const ClasificadosDelGrupo = ({ letra, equipos }) => {
    const desde = letra === 'A' ? 1 : 5;
    return (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {equipos.map((team, i) => (
                <li key={team.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="w-6 shrink-0 text-xs font-black text-slate-400">{desde + i}°</span>
                    <TeamBadge name={team.name} shieldUrl={team.shield_url} size={22} />
                    <span className="flex-1 truncate font-bold text-slate-900 dark:text-white">{team.name}</span>
                </li>
            ))}
        </ul>
    );
};

const TarjetaDeGrupo = ({ letra, grupo }) => {
    const color = COLORES[letra];
    const rango = letra === 'A' ? '1°, 2°, 3° y 4°' : '5°, 6°, 7° y 8°';
    const jugando = grupo.tabla.length > 0;

    return (
        <div className={`rounded-xl border ${color.borde} bg-white dark:bg-slate-900 overflow-hidden shadow-sm flex flex-col`}>
            <div className={`${color.fondo} px-5 py-4 border-b ${color.borde}`}>
                <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-xl font-black uppercase text-slate-900 dark:text-white leading-none">
                        Grupo {letra}
                    </h4>
                    <span className={`text-[11px] font-black uppercase tracking-wider ${color.texto}`}>
                        {rango}
                    </span>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                    Todos contra todos · Desde cero
                </p>
            </div>

            {jugando ? (
                <table className="w-full text-sm">
                    <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                        <tr>
                            <th className="px-5 py-2 text-left font-black">Equipo</th>
                            <th className="px-2 py-2 text-center font-black">PJ</th>
                            <th className="px-2 py-2 text-center font-black">DIF</th>
                            <th className="px-5 py-2 text-center font-black text-slate-500 dark:text-slate-300">PTS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {grupo.tabla.map((team, index) => (
                            <tr key={team.id}>
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="w-3 shrink-0 text-xs font-black text-slate-300">{index + 1}</span>
                                        <TeamBadge name={team.name} shieldUrl={team.shield_url} size={22} />
                                        <span className="font-bold text-slate-900 dark:text-white truncate">{team.name}</span>
                                    </div>
                                </td>
                                <td className="px-2 py-3 text-center text-slate-500">{team.played}</td>
                                <td className="px-2 py-3 text-center text-slate-500">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                                <td className="px-5 py-3 text-center font-black text-primary">{team.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : grupo.definido ? (
                <ClasificadosDelGrupo letra={letra} equipos={grupo.clasificados} />
            ) : (
                <CuposDelGrupo letra={letra} />
            )}

            <div className={`mt-auto border-t ${color.borde} px-5 py-3 flex items-center gap-2`}>
                <span className={`material-symbols-outlined text-base ${grupo.campeon ? color.texto : 'text-slate-300 dark:text-slate-700'}`}>
                    emoji_events
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Campeón del grupo
                </span>
                {grupo.campeon ? (
                    <span className="ml-auto truncate text-sm font-black uppercase text-slate-900 dark:text-white">
                        {grupo.campeon.name}
                    </span>
                ) : (
                    <span className="ml-auto text-sm font-bold uppercase tracking-wider text-slate-400">
                        Por definir
                    </span>
                )}
            </div>
        </div>
    );
};

// ---------------------------------------------------------------
// La final: los dos campeones y el Súper Campeón.
// ---------------------------------------------------------------
const LadoDeLaFinal = ({ letra, equipo, goles }) => {
    const color = COLORES[letra];
    return (
        <div className="flex flex-1 flex-col items-center gap-2 min-w-0">
            {equipo ? (
                <>
                    <TeamBadge name={equipo.name} shieldUrl={equipo.shield_url} size={56} />
                    <span className="font-black uppercase text-white text-center leading-tight truncate max-w-full">
                        {equipo.name}
                    </span>
                </>
            ) : (
                <>
                    <div className="size-14 rounded-full border-2 border-dashed border-white/25" />
                    <span className="font-black uppercase text-white/40 text-center">Por definir</span>
                </>
            )}
            <span className={`text-[10px] font-black uppercase tracking-widest ${color.texto}`}>
                Campeón Grupo {letra}
            </span>
            {goles !== null && goles !== undefined && (
                <span className="text-3xl font-black text-white tabular-nums">{goles}</span>
            )}
        </div>
    );
};

const BloqueFinal = ({ fases }) => {
    const { final, grupoA, grupoB, superCampeon } = fases;
    // Si la final ya está en el fixture, los equipos salen del partido. Si no,
    // salen de los campeones de grupo (cuando ya haya).
    const equipoA = final?.home || grupoA.campeon;
    const equipoB = final?.away || grupoB.campeon;
    const jugada = final?.status === 'finished';

    return (
        <div className="rounded-2xl bg-slate-900 dark:bg-black p-8 md:p-10 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 opacity-5">
                <span className="material-symbols-outlined text-[220px] text-white">emoji_events</span>
            </div>

            <div className="relative z-10">
                <div className="flex items-stretch gap-4 md:gap-8">
                    <LadoDeLaFinal letra="A" equipo={equipoA} goles={jugada ? final.home_score : null} />
                    <div className="flex flex-col items-center justify-center shrink-0">
                        <span className="text-2xl md:text-3xl font-black text-primary">VS</span>
                    </div>
                    <LadoDeLaFinal letra="B" equipo={equipoB} goles={jugada ? final.away_score : null} />
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    {superCampeon ? (
                        <>
                            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary mb-3">
                                Súper Campeón
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <TeamBadge name={superCampeon.name} shieldUrl={superCampeon.shield_url} size={40} />
                                <span className="text-2xl md:text-3xl font-black uppercase text-white leading-none">
                                    {superCampeon.name}
                                </span>
                            </div>
                        </>
                    ) : (
                        <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">
                            El ganador es el Súper Campeón de CD Las Galaxias
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

// ---------------------------------------------------------------
const FasesTorneo = ({ league, fases }) => {
    const actual = etapaActual(fases);

    return (
        <div className="mb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-2xl font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">account_tree</span> Formato del torneo
                </h3>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    8 equipos · 3 etapas · 1 Súper Campeón
                </span>
            </div>

            <p className="mb-6 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Esta liga no se define en una sola tabla. Se juega en tres etapas: primero todos
                contra todos, después la tabla se parte en dos grupos que arrancan de cero, y al
                final se enfrentan los dos campeones para que salga uno solo.
            </p>

            <TiraDeEtapas actual={actual} />

            {/* ETAPA 1 */}
            <section className="mb-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                        <h4 className="text-xl font-black uppercase text-slate-900 dark:text-white leading-none">
                            Primera Fase
                        </h4>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                            Todos contra todos · 3 puntos por victoria, 1 por empate
                        </p>
                    </div>
                    <ShareStandings league={league} standings={fases.tablaFase1} />
                </div>
                <TablaPrimeraFase tabla={fases.tablaFase1} terminada={fases.fase1Terminada} />
            </section>

            {/* ETAPA 2 */}
            <section className="mb-12">
                <h4 className="text-xl font-black uppercase text-slate-900 dark:text-white leading-none">
                    Segunda Fase
                </h4>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                    La tabla se parte al medio y cada grupo saca su campeón
                </p>
                <p className="mt-2 mb-4 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {fases.fase1Terminada
                        ? 'Estos son los ocho equipos ya repartidos según cómo terminaron la primera fase. Los puntos vuelven a cero: acá arranca todo de nuevo.'
                        : 'Los cupos se llenan cuando termine la primera fase. Los cuatro primeros de la tabla van al Grupo A y los cuatro últimos al Grupo B, y en los dos casos los puntos vuelven a cero.'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TarjetaDeGrupo letra="A" grupo={fases.grupoA} />
                    <TarjetaDeGrupo letra="B" grupo={fases.grupoB} />
                </div>
            </section>

            {/* ETAPA 3 */}
            <section>
                <h4 className="text-xl font-black uppercase text-slate-900 dark:text-white leading-none">
                    Final
                </h4>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                    Campeón del Grupo A contra campeón del Grupo B
                </p>
                <p className="mt-2 mb-4 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    Un solo partido, sin revancha. El que lo gana es el Súper Campeón de
                    CD Las Galaxias.
                </p>
                <BloqueFinal fases={fases} />
            </section>
        </div>
    );
};

export default FasesTorneo;
