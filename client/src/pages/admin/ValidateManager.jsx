import { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const STATUS_LABELS = {
    pending: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    approved: { label: 'Aprobado', cls: 'bg-green-100 text-green-700 border-green-200' },
    rejected: { label: 'Rechazado', cls: 'bg-red-100 text-red-700 border-red-200' },
};

const fmtDateTime = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-CL', {
        timeZone: 'America/Santiago',
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
    });
};

const ValidateManager = () => {
    const [filter, setFilter] = useState('pending');
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(null); // submission completa que se está editando
    const [busyId, setBusyId] = useState(null);

    const fetchSubmissions = async (status = filter) => {
        setLoading(true);
        try {
            const url = new URL(`${API_URL}/api/staging/submissions`);
            if (status) url.searchParams.set('status', status);
            const res = await fetch(url);
            const data = await res.json();
            setSubmissions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            alert('Error cargando registros de la app');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSubmissions(filter); }, [filter]);

    const handleApprove = async (sub) => {
        if (!confirm(`Aprobar ${sub.match?.home?.name} ${sub.home_score} - ${sub.away_score} ${sub.match?.away?.name}?\n\nEsto sobreescribe el resultado del partido oficial.`)) return;
        setBusyId(sub.id);
        try {
            const res = await fetch(`${API_URL}/api/staging/submissions/${sub.id}/approve`, { method: 'POST' });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Error al aprobar');
            }
            await fetchSubmissions();
        } catch (err) {
            alert(err.message);
        } finally {
            setBusyId(null);
        }
    };

    const handleReject = async (sub) => {
        const notes = prompt('Motivo del rechazo (opcional):', '');
        if (notes === null) return;
        setBusyId(sub.id);
        try {
            const res = await fetch(`${API_URL}/api/staging/submissions/${sub.id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ review_notes: notes }),
            });
            if (!res.ok) throw new Error('Error al rechazar');
            await fetchSubmissions();
        } catch (err) {
            alert(err.message);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-3xl font-black uppercase text-slate-900 dark:text-white tracking-tight">
                    Validar Resultados (App Mobile)
                </h2>
                <div className="flex gap-2">
                    {['pending', 'approved', 'rejected'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg border transition-colors ${
                                filter === s
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary/40'
                            }`}
                        >
                            {STATUS_LABELS[s].label}
                        </button>
                    ))}
                    <button
                        onClick={() => fetchSubmissions()}
                        className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg border bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary/40"
                    >
                        Refrescar
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-16 text-slate-400 font-bold">Cargando…</div>
            ) : submissions.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-16 text-center">
                    <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 block mb-2">inbox</span>
                    <p className="text-slate-500 font-bold">No hay registros con estado "{STATUS_LABELS[filter].label}".</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {submissions.map(sub => (
                        <SubmissionCard
                            key={sub.id}
                            sub={sub}
                            busy={busyId === sub.id}
                            onApprove={() => handleApprove(sub)}
                            onReject={() => handleReject(sub)}
                            onEdit={() => setEditing(sub)}
                        />
                    ))}
                </div>
            )}

            {editing && (
                <EditSubmissionModal
                    sub={editing}
                    onClose={() => setEditing(null)}
                    onSaved={() => { setEditing(null); fetchSubmissions(); }}
                />
            )}
        </div>
    );
};

const SubmissionCard = ({ sub, busy, onApprove, onReject, onEdit }) => {
    const status = STATUS_LABELS[sub.status] || STATUS_LABELS.pending;
    const homeName = sub.match?.home?.name || 'Local';
    const awayName = sub.match?.away?.name || 'Visita';

    const homeGoals = sub.goals.filter(g => g.team_id === sub.match?.home?.id);
    const awayGoals = sub.goals.filter(g => g.team_id === sub.match?.away?.id);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${status.cls}`}>
                        {status.label}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                        {sub.match?.tournament?.name} {sub.match?.tournament?.season && `· ${sub.match.tournament.season}`}
                    </span>
                    {sub.match?.round && (
                        <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                            J{sub.match.round}
                        </span>
                    )}
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">
                    {sub.device_label || 'app'} · {fmtDateTime(sub.created_at)}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 items-center">
                <TeamColumn name={homeName} goals={homeGoals} align="right" />
                <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-center py-3 text-3xl font-black">
                    {sub.home_score} - {sub.away_score}
                </div>
                <TeamColumn name={awayName} goals={awayGoals} align="left" />
            </div>

            {sub.match?.status === 'finished' && sub.status === 'pending' && (
                <div className="mb-3 text-[11px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                    Atención: el partido oficial ya tiene resultado. Aprobar sobreescribirá los datos actuales.
                </div>
            )}

            {sub.review_notes && (
                <div className="mb-3 text-[11px] text-slate-500 italic">
                    Notas: {sub.review_notes}
                </div>
            )}

            {sub.status === 'pending' && (
                <div className="flex flex-wrap gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-700">
                    <button
                        onClick={onEdit}
                        disabled={busy}
                        className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white hover:bg-slate-200 disabled:opacity-50"
                    >
                        Editar
                    </button>
                    <button
                        onClick={onReject}
                        disabled={busy}
                        className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                    >
                        Rechazar
                    </button>
                    <button
                        onClick={onApprove}
                        disabled={busy}
                        className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                        {busy ? '...' : 'Aprobar'}
                    </button>
                </div>
            )}
            {sub.status !== 'pending' && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-[10px] text-slate-400 font-bold uppercase">
                    Revisado: {fmtDateTime(sub.reviewed_at)}
                </div>
            )}
        </div>
    );
};

const TeamColumn = ({ name, goals, align }) => (
    <div className={`text-${align}`}>
        <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">{name}</p>
        <ul className="mt-1 space-y-0.5">
            {goals.length === 0 && <li className="text-[11px] text-slate-300 dark:text-slate-600 italic">Sin goles</li>}
            {goals.map(g => (
                <li key={g.id} className="text-[12px] text-slate-600 dark:text-slate-300">
                    {g.player_name} {g.count > 1 && <span className="text-primary font-black">×{g.count}</span>}
                </li>
            ))}
        </ul>
    </div>
);

const EditSubmissionModal = ({ sub, onClose, onSaved }) => {
    const [homeScore, setHomeScore] = useState(sub.home_score);
    const [awayScore, setAwayScore] = useState(sub.away_score);
    const [notes, setNotes] = useState(sub.review_notes || '');
    const [players, setPlayers] = useState([]); // jugadores del torneo
    const [goals, setGoals] = useState({}); // { player_id: { team_id, count } }
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const init = {};
        sub.goals.forEach(g => {
            init[g.player_id] = { team_id: g.team_id, count: g.count };
        });
        setGoals(init);

        const tid = sub.match?.tournament?.id;
        if (tid) {
            fetch(`${API_URL}/api/staging/tournaments/${tid}/players`)
                .then(r => r.json())
                .then(setPlayers)
                .catch(console.error);
        }
    }, [sub]);

    const homeId = sub.match?.home?.id;
    const awayId = sub.match?.away?.id;
    const homePlayers = useMemo(() => players.filter(p => p.team_id === homeId), [players, homeId]);
    const awayPlayers = useMemo(() => players.filter(p => p.team_id === awayId), [players, awayId]);

    const adjust = (playerId, teamId, delta) => {
        setGoals(prev => {
            const cur = prev[playerId]?.count || 0;
            const next = Math.max(0, cur + delta);
            if (next === 0) {
                const { [playerId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [playerId]: { team_id: teamId, count: next } };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const goalsPayload = Object.entries(goals).map(([player_id, v]) => ({
                player_id: Number(player_id),
                team_id: v.team_id,
                count: v.count,
            }));
            const res = await fetch(`${API_URL}/api/staging/submissions/${sub.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    home_score: Number(homeScore),
                    away_score: Number(awayScore),
                    goals: goalsPayload,
                    review_notes: notes,
                }),
            });
            if (!res.ok) throw new Error('Error guardando');
            onSaved();
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const PlayerRow = ({ p }) => {
        const count = goals[p.id]?.count || 0;
        return (
            <div className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate flex-1">{p.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                    <button type="button" onClick={() => adjust(p.id, p.team_id, -1)}
                        className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-600 font-black text-lg leading-none">−</button>
                    <span className={`w-7 text-center font-black ${count > 0 ? 'text-primary' : 'text-slate-300'}`}>{count}</span>
                    <button type="button" onClick={() => adjust(p.id, p.team_id, 1)}
                        className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-600 font-black text-lg leading-none">+</button>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl p-6 my-auto border border-slate-200 dark:border-slate-800 shadow-2xl">
                <h3 className="text-xl font-black uppercase mb-4 text-center text-slate-900 dark:text-white">
                    Corregir Antes de Aprobar
                </h3>

                <div className="flex items-center justify-center gap-4 mb-4">
                    <span className="font-black text-lg">{sub.match?.home?.name}</span>
                    <input type="number" min="0" value={homeScore} onChange={e => setHomeScore(e.target.value)}
                        className="w-16 p-2 rounded bg-slate-100 dark:bg-slate-800 text-center font-black text-2xl border border-slate-200 dark:border-slate-700" />
                    <span className="text-2xl font-black">-</span>
                    <input type="number" min="0" value={awayScore} onChange={e => setAwayScore(e.target.value)}
                        className="w-16 p-2 rounded bg-slate-100 dark:bg-slate-800 text-center font-black text-2xl border border-slate-200 dark:border-slate-700" />
                    <span className="font-black text-lg">{sub.match?.away?.name}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                        <h4 className="font-black uppercase text-center text-sm mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">
                            {sub.match?.home?.name}
                        </h4>
                        {homePlayers.length === 0 ? <p className="text-center text-slate-400 text-xs py-2">Sin jugadores</p>
                            : homePlayers.map(p => <PlayerRow key={p.id} p={p} />)}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                        <h4 className="font-black uppercase text-center text-sm mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">
                            {sub.match?.away?.name}
                        </h4>
                        {awayPlayers.length === 0 ? <p className="text-center text-slate-400 text-xs py-2">Sin jugadores</p>
                            : awayPlayers.map(p => <PlayerRow key={p.id} p={p} />)}
                    </div>
                </div>

                <div className="mt-4">
                    <label className="text-xs font-bold text-slate-500 uppercase">Notas de revisión</label>
                    <textarea rows="2" value={notes} onChange={e => setNotes(e.target.value)}
                        className="w-full mt-1 p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
                </div>

                <div className="flex gap-2 mt-6">
                    <button type="button" onClick={onClose}
                        className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-white rounded font-bold">
                        Cancelar
                    </button>
                    <button type="button" disabled={saving} onClick={handleSave}
                        className="flex-1 py-3 bg-primary text-white rounded font-black disabled:opacity-50">
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ValidateManager;
