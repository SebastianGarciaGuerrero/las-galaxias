import { useState, useEffect } from 'react';

const LeagueManager = () => {
    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState('');
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [allPlayers, setAllPlayers] = useState([]);
    const [tournamentPlayers, setTournamentPlayers] = useState([]);
    const [expandedMatch, setExpandedMatch] = useState(null);
    const [expandedRound, setExpandedRound] = useState(null);
    const [editingRound, setEditingRound] = useState(null);
    const [newRoundValue, setNewRoundValue] = useState('');
    const [tournamentByes, setTournamentByes] = useState([]);
    const [fixtureToEdit, setFixtureToEdit] = useState(null);

    const [showCreateMatch, setShowCreateMatch] = useState(false);
    const [showCreatePlayer, setShowCreatePlayer] = useState(false);
    const [showCreateTeam, setShowCreateTeam] = useState(false);
    const [showByeModal, setShowByeModal] = useState(false);
    const [matchToResult, setMatchToResult] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const fetchInitialData = async () => {
        try {
            const [resTournaments, resTeams, resPlayers] = await Promise.all([
                fetch(`${API_URL}/api/leagues`),
                fetch(`${API_URL}/api/league-admin/teams`),
                fetch(`${API_URL}/api/league-admin/players`)
            ]);
            setTournaments(await resTournaments.json());
            setTeams(await resTeams.json());
            setAllPlayers(await resPlayers.json());
        } catch (error) { console.error("Error cargando datos:", error); }
    };

    useEffect(() => { fetchInitialData(); }, []);

    const fetchMatches = async () => {
        if (!selectedTournament) return;
        try {
            const [resMatches, resPlayers, resByes] = await Promise.all([
                fetch(`${API_URL}/api/league-admin/tournament/${selectedTournament}`),
                fetch(`${API_URL}/api/league-admin/tournament/${selectedTournament}/players`),
                fetch(`${API_URL}/api/league-admin/tournament/${selectedTournament}/byes`)
            ]);
            setMatches(await resMatches.json());
            setTournamentPlayers(await resPlayers.json());
            const byesData = await resByes.json();
            setTournamentByes(Array.isArray(byesData) ? byesData : []);
        } catch (error) { console.error("Error:", error); }
    };

    useEffect(() => { fetchMatches(); }, [selectedTournament]);

    // ==========================================
    // MODAL: NUEVO EQUIPO
    // ==========================================
    const CreateTeamModal = () => {
        const [form, setForm] = useState({ name: '', short_name: '', logo_url: '', bio_title: '', bio_description: '' });

        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                const res = await fetch(`${API_URL}/api/league-admin/teams`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
                });
                if (res.ok) { setShowCreateTeam(false); fetchInitialData(); }
                else alert("Error al crear equipo");
            } catch (error) { console.error(error); }
        };

        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-lg p-6 border border-slate-200 dark:border-slate-700 shadow-2xl my-auto">
                    <h3 className="text-xl font-black uppercase mb-4 text-slate-900 dark:text-white text-center">Registrar Equipo</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 md:col-span-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Nombre Completo</label>
                                <input type="text" required placeholder="Ej: Tiburones FC" className="w-full p-3 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 mt-1 focus:border-primary focus:outline-none" onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Abreviación (3 Letras)</label>
                                <input type="text" maxLength="3" placeholder="Ej: TIB" className="w-full p-3 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 mt-1 focus:border-primary focus:outline-none uppercase" onChange={e => setForm({ ...form, short_name: e.target.value.toUpperCase() })} />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">URL del Escudo (Opcional)</label>
                            <input type="url" placeholder="https://..." className="w-full p-3 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 mt-1 focus:border-primary focus:outline-none" onChange={e => setForm({ ...form, logo_url: e.target.value })} />
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-2">
                            <span className="text-xs font-black uppercase bg-primary/10 text-primary px-2 py-1 rounded mb-2 inline-block">Info Temática de la Liga</span>
                            <div className="mt-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Título representativo</label>
                                <input type="text" placeholder="Ej: El Tiburón Blanco" className="w-full p-3 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 mt-1 focus:border-primary focus:outline-none" onChange={e => setForm({ ...form, bio_title: e.target.value })} />
                            </div>
                            <div className="mt-4">
                                <label className="text-xs font-bold text-slate-500 uppercase">Descripción / Historia</label>
                                <textarea rows="3" placeholder="Depredador apex de los océanos..." className="w-full p-3 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 mt-1 focus:border-primary focus:outline-none resize-none" onChange={e => setForm({ ...form, bio_description: e.target.value })}></textarea>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                            <button type="button" onClick={() => setShowCreateTeam(false)} className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-bold hover:bg-slate-300 transition-colors">Cancelar</button>
                            <button type="submit" className="flex-1 py-3 bg-primary text-white rounded font-bold hover:bg-primary/90 transition-colors">Guardar Equipo</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // ==========================================
    // MODAL: FECHA LIBRE
    // ==========================================

    const ByeModal = () => {
        const [teamId, setTeamId] = useState('');

        const handleSubmit = async (e) => {
            e.preventDefault();
            const currentRound = matches.length > 0 ? Math.max(...matches.map(m => m.round || 1)) : 1;
            try {
                const res = await fetch(`${API_URL}/api/league-admin/bye`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tournament_id: selectedTournament, team_id: teamId, round: currentRound })
                });
                if (res.ok) { setShowByeModal(false); fetchMatches(); }
                else alert("Error al registrar descanso");
            } catch (error) { console.error(error); }
        };

        const availableTeams = [...new Set(tournamentPlayers.map(p => p.team_id))]
            .map(id => teams.find(t => t.id === id)).filter(Boolean);

        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700 shadow-2xl">
                    <h3 className="text-xl font-black uppercase mb-4 text-slate-900 dark:text-white text-center">Registrar Fecha Libre</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Equipo con Descanso</label>
                            <select required className="w-full p-3 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 mt-1 focus:border-primary focus:outline-none" onChange={e => setTeamId(e.target.value)}>
                                <option value="">Seleccionar equipo...</option>
                                {availableTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-2 pt-4">
                            <button type="button" onClick={() => setShowByeModal(false)} className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-bold">Cancelar</button>
                            <button type="submit" className="flex-1 py-3 bg-primary text-white rounded font-bold">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };


    // ==========================================
    // MODAL: NUEVO JUGADOR
    // ==========================================
    const CreatePlayerModal = () => {
        const [form, setForm] = useState({ name: '', team_id: '' });
        const [suggestions, setSuggestions] = useState([]);
        const [showSuggestions, setShowSuggestions] = useState(false);

        const availableTeams = selectedTournament
            ? [...new Set(tournamentPlayers.map(p => p.team_id))].map(id =>
                teams.find(t => t.id === id)).filter(Boolean)
            : [];

        const handleNameChange = (value) => {
            setForm({ ...form, name: value });
            if (value.length >= 1) {
                const filtered = allPlayers.filter(p =>
                    p.name.toLowerCase().includes(value.toLowerCase())
                );
                setSuggestions(filtered);
                setShowSuggestions(true);
            } else {
                setShowSuggestions(false);
            }
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                const res = await fetch(`${API_URL}/api/league-admin/players`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: form.name,
                        team_id: form.team_id,
                        tournament_id: selectedTournament  // ← agregar esto
                    })
                });
                if (res.ok) {
                    setShowCreatePlayer(false);
                    fetchInitialData();
                    fetchMatches();
                } else {
                    const err = await res.json();
                    alert(err.error || "Error al crear jugador");
                }
            } catch (error) { console.error(error); }
        };

        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700 shadow-2xl">
                    <h3 className="text-xl font-black uppercase mb-4 text-slate-900 dark:text-white text-center">Registrar Jugador</h3>

                    {!selectedTournament ? (
                        <div className="text-center py-6">
                            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2 block">warning</span>
                            <p className="text-slate-500 font-bold text-sm">Primero selecciona una liga activa para agregar jugadores.</p>
                            <button onClick={() => setShowCreatePlayer(false)} className="mt-4 px-6 py-2 bg-slate-200 dark:bg-slate-800 rounded-lg font-bold text-slate-700 dark:text-slate-300">Cerrar</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <label className="text-xs font-bold text-slate-500 uppercase">Apodo / Nombre</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    placeholder="Ej: Pelao, Tato..."
                                    className="w-full p-3 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 mt-1 focus:border-primary focus:outline-none"
                                    onChange={e => handleNameChange(e.target.value)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                    onFocus={() => form.name.length >= 1 && setShowSuggestions(true)}
                                    autoComplete="off"
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {suggestions.map(p => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => {
                                                    setForm({ ...form, name: p.name });
                                                    setShowSuggestions(false);
                                                }}
                                                className="w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <span className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Equipo</label>
                                <select
                                    required
                                    className="w-full p-3 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 mt-1 focus:border-primary focus:outline-none"
                                    onChange={e => setForm({ ...form, team_id: e.target.value })}
                                >
                                    <option value="">Seleccionar Equipo...</option>
                                    {availableTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setShowCreatePlayer(false)} className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-bold">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded font-bold">Guardar</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        );
    };

    // ==========================================
    // MODAL: PROGRAMAR FECHA
    // ==========================================
    const CreateMatchModal = () => {
        const currentTournament = tournaments.find(t => t.id === Number(selectedTournament));
        const isMartes = currentTournament?.category === 'martes';
        const isEditing = !!fixtureToEdit;

        // Si estamos editando, pre-poblar slots con datos existentes
        const initialSlots = isEditing
            ? fixtureToEdit.matches.map(m => ({
                matchId: m.id,
                hour: new Date(m.match_date).toLocaleTimeString('es-CL', {
                    hour: '2-digit', minute: '2-digit',
                    timeZone: 'America/Santiago', hour12: false
                }),
                home_team_id: String(m.home_team_id),
                away_team_id: String(m.away_team_id),
            }))
            : isMartes
                ? [
                    { hour: '19:00', home_team_id: '', away_team_id: '' },
                    { hour: '20:00', home_team_id: '', away_team_id: '' },
                    { hour: '21:00', home_team_id: '', away_team_id: '' },
                    { hour: '22:00', home_team_id: '', away_team_id: '' },
                ]
                : [
                    { hour: '19:00', home_team_id: '', away_team_id: '' },
                    { hour: '20:00', home_team_id: '', away_team_id: '' },
                    { hour: '22:00', home_team_id: '', away_team_id: '' },
                ];

        const [slots, setSlots] = useState(initialSlots);
        const [matchDate, setMatchDate] = useState(
            isEditing
                ? new Date(fixtureToEdit.matches[0].match_date).toLocaleDateString('en-CA', { timeZone: 'America/Santiago' })
                : ''
        );
        const [byeTeamId, setByeTeamId] = useState(
            isEditing ? String(fixtureToEdit.bye?.team_id || '') : ''
        );

        const availableTeams = [...new Set(tournamentPlayers.map(p => p.team_id))]
            .map(id => teams.find(t => t.id === id)).filter(Boolean);

        const updateSlot = (index, field, value) => {
            const updated = [...slots];
            updated[index][field] = value;
            setSlots(updated);
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            const filledSlots = slots.filter(s => s.home_team_id && s.away_team_id);
            if (filledSlots.length === 0) return alert("Agrega al menos un partido");

            try {
                for (const slot of filledSlots) {
                    if (slot.home_team_id === slot.away_team_id) return alert("Un equipo no puede jugar contra sí mismo");

                    if (isEditing && slot.matchId) {
                        // PATCH partido existente
                        await fetch(`${API_URL}/api/league-admin/match/${slot.matchId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                home_team_id: slot.home_team_id,
                                away_team_id: slot.away_team_id,
                                match_date: `${matchDate}T${slot.hour}:00-03:00`,
                            })
                        });
                    } else {
                        // POST partido nuevo
                        await fetch(`${API_URL}/api/league-admin/match`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                tournament_id: selectedTournament,
                                home_team_id: slot.home_team_id,
                                away_team_id: slot.away_team_id,
                                match_date: `${matchDate}T${slot.hour}:00-03:00`,
                                location: 'Cancha Principal'
                            })
                        });
                    }
                }

                if (!isMartes) {
                    if (isEditing && fixtureToEdit.bye) {
                        // Actualizar bye existente
                        if (byeTeamId) {
                            await fetch(`${API_URL}/api/league-admin/bye/${fixtureToEdit.bye.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ team_id: byeTeamId })
                            });
                        }
                    } else if (byeTeamId) {
                        // Crear bye nuevo
                        const lastMatch = await fetch(`${API_URL}/api/league-admin/tournament/${selectedTournament}`);
                        const lastMatchData = await lastMatch.json();
                        const currentRound = Math.max(...lastMatchData.map(m => m.round || 1));
                        await fetch(`${API_URL}/api/league-admin/bye`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                tournament_id: selectedTournament,
                                team_id: byeTeamId,
                                round: currentRound
                            })
                        });
                    }
                }

                setShowCreateMatch(false);
                setFixtureToEdit(null);
                fetchMatches();
            } catch (error) { console.error(error); }
        };

        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
                <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-lg p-6 border border-slate-200 dark:border-slate-700 shadow-2xl my-auto">
                    <h3 className="text-xl font-black uppercase mb-6 text-slate-900 dark:text-white text-center">
                        {isEditing ? `Editar Jornada ${fixtureToEdit.round}` : 'Programar Fecha'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Día</label>
                            <input
                                type="date"
                                required
                                value={matchDate}
                                className="w-full p-3 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 mt-1 focus:border-primary focus:outline-none"
                                onChange={e => setMatchDate(e.target.value)}
                            />
                        </div>

                        {slots.map((slot, index) => (
                            <div key={index} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="bg-primary text-white text-xs font-black px-3 py-1 rounded-lg">{slot.hour} hrs</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Local</label>
                                        <select
                                            value={slot.home_team_id}
                                            className="w-full p-2 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 mt-1 focus:border-primary focus:outline-none text-sm"
                                            onChange={e => updateSlot(index, 'home_team_id', e.target.value)}
                                        >
                                            <option value="">Elegir...</option>
                                            {availableTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Visita</label>
                                        <select
                                            value={slot.away_team_id}
                                            className="w-full p-2 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 mt-1 focus:border-primary focus:outline-none text-sm"
                                            onChange={e => updateSlot(index, 'away_team_id', e.target.value)}
                                        >
                                            <option value="">Elegir...</option>
                                            {availableTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {!isMartes && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                                <label className="text-xs font-bold text-amber-600 uppercase">Equipo con Fecha Libre</label>
                                <select
                                    value={byeTeamId}
                                    className="w-full p-2 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-amber-200 dark:border-amber-700 mt-1 focus:border-primary focus:outline-none text-sm"
                                    onChange={e => setByeTeamId(e.target.value)}
                                >
                                    <option value="">Seleccionar equipo...</option>
                                    {availableTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="flex gap-2 pt-2">
                            <button type="button" onClick={() => { setShowCreateMatch(false); setFixtureToEdit(null); }}
                                className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-bold">
                                Cancelar
                            </button>
                            <button type="submit" className="flex-1 py-3 bg-primary text-white rounded font-bold">
                                {isEditing ? 'Guardar Cambios' : 'Guardar Fecha'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };
    // ==========================================
    // MODAL: RESULTADOS
    // ==========================================
    const ResultModal = () => {
        const [homeGoals, setHomeGoals] = useState({});
        const [awayGoals, setAwayGoals] = useState({});

        const homePlayers = tournamentPlayers.filter(p => p.team_id === matchToResult.home_team_id);
        const awayPlayers = tournamentPlayers.filter(p => p.team_id === matchToResult.away_team_id);

        const homeScore = Object.values(homeGoals).reduce((a, b) => a + b, 0);
        const awayScore = Object.values(awayGoals).reduce((a, b) => a + b, 0);

        const updateGoals = (setter, playerId, delta) => {
            setter(prev => {
                const next = Math.max(0, (prev[playerId] || 0) + delta);
                return { ...prev, [playerId]: next };
            });
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            const goals = [];
            Object.entries(homeGoals).forEach(([playerId, count]) => {
                for (let i = 0; i < count; i++)
                    goals.push({ player_id: playerId, team_id: matchToResult.home_team_id });
            });
            Object.entries(awayGoals).forEach(([playerId, count]) => {
                for (let i = 0; i < count; i++)
                    goals.push({ player_id: playerId, team_id: matchToResult.away_team_id });
            });

            try {
                const res = await fetch(`${API_URL}/api/league-admin/match/${matchToResult.id}/result`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ home_score: homeScore, away_score: awayScore, goals })
                });
                if (res.ok) { setMatchToResult(null); fetchMatches(); }
                else alert("Error al guardar resultado");
            } catch (error) { console.error(error); }
        };

        const PlayerGoalRow = ({ player, goals, setter }) => (
            <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                <span className="font-bold text-slate-800 dark:text-white text-sm truncate flex-1">
                    {player.name}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                    <button type="button" onClick={() => updateGoals(setter, player.id, -1)}
                        className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-600 font-black text-slate-700 dark:text-white hover:bg-primary hover:text-white transition-colors flex items-center justify-center text-lg leading-none">
                        −
                    </button>
                    <span className={`w-8 text-center font-black text-lg ${(goals[player.id] || 0) > 0 ? 'text-primary' : 'text-slate-300 dark:text-slate-600'}`}>
                        {goals[player.id] || 0}
                    </span>
                    <button type="button" onClick={() => updateGoals(setter, player.id, 1)}
                        className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-600 font-black text-slate-700 dark:text-white hover:bg-primary hover:text-white transition-colors flex items-center justify-center text-lg leading-none">
                        +
                    </button>
                </div>
            </div>
        );

        return (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-4xl p-6 my-auto border border-slate-200 dark:border-slate-800 shadow-2xl">

                    {/* Marcador en vivo */}
                    <div className="text-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
                            Registrar Marcador Oficial
                        </span>
                        <div className="flex items-center justify-center gap-6 mt-4">
                            <span className="font-black text-slate-900 dark:text-white text-lg truncate max-w-[140px]">{matchToResult.home?.name}</span>
                            <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-xl text-3xl font-black min-w-[100px] text-center">
                                {homeScore} - {awayScore}
                            </div>
                            <span className="font-black text-slate-900 dark:text-white text-lg truncate max-w-[140px]">{matchToResult.away?.name}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Equipo Local */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                                <h4 className="font-black uppercase text-center text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                                    ⚽ {matchToResult.home?.name}
                                </h4>
                                {homePlayers.length === 0
                                    ? <p className="text-center text-slate-400 text-sm py-4">Sin jugadores inscritos</p>
                                    : <div className="space-y-1">{homePlayers.map(p => <PlayerGoalRow key={p.id} player={p} goals={homeGoals} setter={setHomeGoals} />)}</div>
                                }
                            </div>

                            {/* Equipo Visita */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                                <h4 className="font-black uppercase text-center text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                                    ⚽ {matchToResult.away?.name}
                                </h4>
                                {awayPlayers.length === 0
                                    ? <p className="text-center text-slate-400 text-sm py-4">Sin jugadores inscritos</p>
                                    : <div className="space-y-1">{awayPlayers.map(p => <PlayerGoalRow key={p.id} player={p} goals={awayGoals} setter={setAwayGoals} />)}</div>
                                }
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <button type="button" onClick={() => setMatchToResult(null)}
                                className="flex-1 py-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl font-bold uppercase tracking-wider hover:bg-slate-300 transition-colors">
                                Cancelar
                            </button>
                            <button type="submit"
                                className="flex-1 py-4 bg-primary text-white rounded-xl font-black uppercase tracking-wider shadow-lg hover:-translate-y-1 transition-all">
                                Guardar Marcador Final
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // ==========================================
    // RENDER PRINCIPAL
    // ==========================================
    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-black uppercase text-slate-900 dark:text-white tracking-tight">Gestor de Ligas</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button onClick={() => setShowCreateTeam(true)} className="px-5 py-2.5 bg-slate-800 dark:bg-slate-700 text-white font-black uppercase tracking-widest rounded-lg shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm">
                        <span className="material-symbols-outlined">shield</span> Nuevo Equipo
                    </button>
                    <button onClick={() => setShowCreatePlayer(true)} className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-widest rounded-lg shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm">
                        <span className="material-symbols-outlined">person_add</span> Nuevo Jugador
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-end">
                <div className="w-full md:w-1/2">
                    <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Seleccionar Liga Operativa</label>
                    <select
                        className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-lg focus:border-primary focus:outline-none transition-colors cursor-pointer"
                        value={selectedTournament}
                        onChange={(e) => setSelectedTournament(e.target.value)}
                    >
                        <option value="">-- Elige una liga --</option>
                        {tournaments.map(t => <option key={t.id} value={t.id}>{t.name} ({t.season})</option>)}
                    </select>
                </div>
                {selectedTournament && (
                    <div className="flex gap-3">
                        <button onClick={() => setShowCreateMatch(true)} className="w-full md:w-auto px-8 py-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl shadow-[0_0_15px_rgba(236,19,19,0.2)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                            <span className="material-symbols-outlined text-2xl">event_available</span> Programar Fecha
                        </button>
                    </div>
                )}
            </div>

            {selectedTournament && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">format_list_numbered</span>
                        <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">Fixture de la Liga</h3>
                    </div>

                    {matches.length === 0 ? (
                        <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-4">
                            <span className="material-symbols-outlined text-6xl opacity-20">sports_soccer</span>
                            <p className="font-bold text-lg">No hay partidos programados en esta liga.</p>
                        </div>
                    ) : (() => {
                        // Agrupa partidos por jornada
                        const rounds = matches.reduce((acc, match) => {
                            const round = match.round || 1;
                            if (!acc[round]) acc[round] = [];
                            acc[round].push(match);
                            return acc;
                        }, {});

                        return (
                            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {Object.entries(rounds).map(([round, roundMatches]) => {
                                    const allFinished = roundMatches.every(m => m.status === 'finished');
                                    const isExpanded = expandedRound === round;

                                    return (
                                        <div key={round}>
                                            {/* HEADER DE JORNADA */}
                                            <button
                                                onClick={() => setExpandedRound(isExpanded ? null : round)}
                                                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-black uppercase tracking-widest text-white bg-primary px-4 py-1.5 rounded-lg">
                                                        Jornada {round}
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-400">
                                                        {roundMatches.length} partido{roundMatches.length > 1 ? 's' : ''}
                                                    </span>
                                                    {allFinished ? (
                                                        <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-sm">check_circle</span> Completada
                                                        </span>
                                                    ) : roundMatches.every(m => m.status === 'scheduled') ? (
                                                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-sm">schedule</span> Próximamente
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-sm">pending</span> En curso
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="material-symbols-outlined text-slate-400 transition-transform duration-200"
                                                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                                    expand_more
                                                </span>
                                            </button>
                                            {/* EDITAR NÚMERO DE JORNADA */}
                                            {editingRound === round ? (
                                                <div className="px-4 pb-3 flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-500 uppercase">Mover a Jornada:</span>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={newRoundValue}
                                                        onChange={e => setNewRoundValue(e.target.value)}
                                                        className="w-16 p-1.5 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                                                    />
                                                    <button
                                                        onClick={async () => {
                                                            // Actualiza todos los partidos de esta jornada al nuevo número
                                                            await Promise.all(roundMatches.map(m =>
                                                                fetch(`${API_URL}/api/league-admin/match/${m.id}/round`, {
                                                                    method: 'PATCH',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ round: parseInt(newRoundValue) })
                                                                })
                                                            ));
                                                            setEditingRound(null);
                                                            fetchMatches();
                                                        }}
                                                        className="px-3 py-1.5 bg-primary text-white text-xs font-black rounded hover:bg-red-700 transition-colors"
                                                    >
                                                        Guardar
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingRound(null)}
                                                        className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white text-xs font-black rounded"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setEditingRound(round); setNewRoundValue(round); }}
                                                    className="px-3 mx-4 mb-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-primary flex items-center gap-1 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-sm">edit</span> Editar jornada
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const bye = tournamentByes?.find(b => String(b.round) === String(round));
                                                    setFixtureToEdit({ round, matches: roundMatches, bye });
                                                    setShowCreateMatch(true);
                                                }}
                                                className="px-3 mx-2 mb-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-primary flex items-center gap-1 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">calendar_clock</span> Editar Fecha
                                            </button>


                                            {/* PARTIDOS DE LA JORNADA */}
                                            {isExpanded && (
                                                <ul className="divide-y divide-slate-100 dark:divide-slate-700/50 bg-slate-50 dark:bg-slate-800/30">
                                                    {roundMatches.map(match => (
                                                        <li key={match.id} className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                                                            <div className="text-center text-xs text-slate-500 font-bold uppercase bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
                                                                {new Date(match.match_date).toLocaleDateString()} <br />
                                                                <span className="text-primary text-sm mt-1 block">
                                                                    {new Date(match.match_date).toLocaleTimeString('es-CL', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                        timeZone: 'America/Santiago',
                                                                        hour12: false
                                                                    })}
                                                                </span>
                                                            </div>

                                                            <div className="flex-1 flex items-center justify-center gap-4 text-xl md:text-2xl w-full font-black">
                                                                <div className="flex-1 text-right text-slate-900 dark:text-white truncate">{match.home?.name}</div>
                                                                {match.status === 'finished' ? (
                                                                    <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-1.5 rounded-xl shadow border-2 border-slate-700 dark:border-slate-200 shrink-0">
                                                                        {match.home_score} - {match.away_score}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-slate-300 dark:text-slate-600 px-4 shrink-0">VS</div>
                                                                )}
                                                                <div className="flex-1 text-left text-slate-900 dark:text-white truncate">{match.away?.name}</div>
                                                            </div>

                                                            <div className="shrink-0">
                                                                {match.status === 'scheduled' ? (
                                                                    <button onClick={() => setMatchToResult(match)}
                                                                        className="text-xs font-black uppercase tracking-widest text-green-600 bg-green-100 hover:bg-green-200 px-5 py-2.5 rounded-xl transition-all">
                                                                        Anotar Resultado
                                                                    </button>
                                                                ) : (
                                                                    <button onClick={() => setMatchToResult(match)}
                                                                        className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 hover:bg-primary hover:text-white border border-primary/20 px-5 py-2.5 rounded-xl transition-colors flex items-center gap-1">
                                                                        <span className="material-symbols-outlined text-sm">edit</span> Corregir
                                                                    </button>
                                                                )}
                                                                {showByeModal && <ByeModal />}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {/* FECHA LIBRE EN ADMIN */}
                                            {(() => {
                                                // Necesitas tener los byes cargados — agrega este estado y fetch
                                                const bye = tournamentByes?.find(b => String(b.round) === String(round));
                                                if (!bye) return null;
                                                return (
                                                    <div className="p-4 flex items-center gap-3 border-t border-slate-100 dark:border-slate-700 bg-amber-50/50 dark:bg-amber-900/10">
                                                        <span className="material-symbols-outlined text-amber-500 text-sm">event_busy</span>
                                                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                                            Fecha libre — {teams.find(t => t.id === bye.team_id)?.name}
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}

                    {showCreateTeam && <CreateTeamModal />}
                    {showCreatePlayer && <CreatePlayerModal />}
                    {showCreateMatch && <CreateMatchModal />}
                    {matchToResult && <ResultModal />}
                </div>
            )}

        </div>
    );
};

export default LeagueManager;
