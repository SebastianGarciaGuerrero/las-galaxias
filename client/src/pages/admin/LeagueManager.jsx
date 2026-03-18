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

    const [showCreateMatch, setShowCreateMatch] = useState(false);
    const [showCreatePlayer, setShowCreatePlayer] = useState(false);
    const [showCreateTeam, setShowCreateTeam] = useState(false);
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
            const [resMatches, resPlayers] = await Promise.all([
                fetch(`${API_URL}/api/league-admin/tournament/${selectedTournament}`),
                fetch(`${API_URL}/api/league-admin/tournament/${selectedTournament}/players`)
            ]);
            setMatches(await resMatches.json());
            setTournamentPlayers(await resPlayers.json());
        } catch (error) { console.error("Error partidos:", error); }
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
    // MODAL: NUEVO JUGADOR
    // ==========================================
    const CreatePlayerModal = () => {
        const [form, setForm] = useState({ name: '', team_id: '' });

        // Si hay torneo seleccionado, filtra los equipos de ese torneo
        // Si no, muestra lista vacía con aviso
        const availableTeams = selectedTournament
            ? [...new Set(tournamentPlayers.map(p => p.team_id))].map(id =>
                teams.find(t => t.id === id)).filter(Boolean)
            : [];

        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                const res = await fetch(`${API_URL}/api/league-admin/players`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
                });
                if (res.ok) { setShowCreatePlayer(false); fetchInitialData(); fetchMatches(); }
                else alert("Error al crear jugador");
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
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Apodo / Nombre</label>
                                <input type="text" required placeholder="Ej: Pelao, Tato..." className="w-full p-3 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 mt-1 focus:border-primary focus:outline-none" onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Equipo</label>
                                <select required className="w-full p-3 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 mt-1 focus:border-primary focus:outline-none" onChange={e => setForm({ ...form, team_id: e.target.value })}>
                                    <option value="">Seleccionar Equipo...</option>
                                    {availableTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setShowCreatePlayer(false)} className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-bold hover:bg-slate-300 transition-colors">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded font-bold hover:bg-primary/90 transition-colors">Guardar</button>
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
        const [form, setForm] = useState({ home_team_id: '', away_team_id: '', match_date: '', location: 'Cancha Principal' });
        const availableTeams = [...new Set(tournamentPlayers.map(p => p.team_id))]
            .map(id => teams.find(t => t.id === id)).filter(Boolean);

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (form.home_team_id === form.away_team_id) return alert("¡Un equipo no puede jugar contra sí mismo!");

            // Calcula la hora según cuántos partidos hay en la jornada actual
            const matchesInCurrentRound = matches.filter(m => m.round === Math.max(...matches.map(x => x.round || 0)));
            const hours = ['19:00', '20:00', '21:00', '22:00'];
            const assignedHour = hours[matchesInCurrentRound.length] || '19:00';

            // Combina la fecha elegida con la hora automática
            const fullDate = `${form.match_date}T${assignedHour}:00`;

            try {
                const res = await fetch(`${API_URL}/api/league-admin/match`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...form, match_date: fullDate, tournament_id: selectedTournament })
                });
                if (res.ok) { setShowCreateMatch(false); fetchMatches(); }
                else alert("Error al programar partido");
            } catch (error) { console.error(error); }
        };

        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700 shadow-2xl">
                    <h3 className="text-xl font-black uppercase mb-4 text-slate-900 dark:text-white">Programar Partido</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Local</label>
                                <select required className="w-full p-2 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 mt-1" onChange={e => setForm({ ...form, home_team_id: e.target.value })}>
                                    <option value="">Elegir...</option>
                                    {availableTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Visita</label>
                                <select required className="w-full p-2 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 mt-1" onChange={e => setForm({ ...form, away_team_id: e.target.value })}>
                                    <option value="">Elegir...</option>
                                    {availableTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Fecha y Hora</label>
                            <input type="datetime-local" required className="w-full p-2 rounded bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 mt-1" onChange={e => setForm({ ...form, match_date: e.target.value })} />
                        </div>
                        <div className="flex gap-2 pt-4">
                            <button type="button" onClick={() => setShowCreateMatch(false)} className="flex-1 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-bold">Cancelar</button>
                            <button type="submit" className="flex-1 py-2 bg-primary text-white rounded font-bold">Guardar Fecha</button>
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
                    <button onClick={() => setShowCreateMatch(true)} className="w-full md:w-auto px-8 py-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl shadow-[0_0_15px_rgba(236,19,19,0.2)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                        <span className="material-symbols-outlined text-2xl">event_available</span> Programar Fecha
                    </button>
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

                                            {/* PARTIDOS DE LA JORNADA */}
                                            {isExpanded && (
                                                <ul className="divide-y divide-slate-100 dark:divide-slate-700/50 bg-slate-50 dark:bg-slate-800/30">
                                                    {roundMatches.map(match => (
                                                        <li key={match.id} className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                                                            <div className="text-center text-xs text-slate-500 font-bold uppercase bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
                                                                {new Date(match.match_date).toLocaleDateString()} <br />
                                                                <span className="text-primary text-sm mt-1 block">
                                                                    {new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
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
