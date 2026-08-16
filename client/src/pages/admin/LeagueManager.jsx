import { useState, useEffect } from 'react';
import { apiFetch } from '../../config/api';
import { fechaChile, horaChile, isoDesdeChile } from '../../utils/fecha';
import ResultadoModal from './ResultadoModal';

const LeagueManager = () => {
    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState('');
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [allPlayers, setAllPlayers] = useState([]);
    const [tournamentPlayers, setTournamentPlayers] = useState([]);
    // La jornada que se está mirando. El fixture muestra una sola a la vez,
    // como en el sitio público: antes eran acordeones y había que bajar hasta
    // la última para cargar la fecha que se acababa de jugar.
    const [jornadaVista, setJornadaVista] = useState(null);
    const [editingRound, setEditingRound] = useState(null);
    const [newRoundValue, setNewRoundValue] = useState('');
    const [tournamentByes, setTournamentByes] = useState([]);
    const [fixtureToEdit, setFixtureToEdit] = useState(null);

    const [showCreateMatch, setShowCreateMatch] = useState(false);
    const [showCreatePlayer, setShowCreatePlayer] = useState(false);
    const [showCreateTeam, setShowCreateTeam] = useState(false);
    const [matchToResult, setMatchToResult] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const fetchInitialData = async () => {
        try {
            const [resTournaments, resTeams, resPlayers] = await Promise.all([
                apiFetch(`${API_URL}/api/leagues`),
                apiFetch(`${API_URL}/api/league-admin/teams`),
                apiFetch(`${API_URL}/api/league-admin/players`)
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
                apiFetch(`${API_URL}/api/league-admin/tournament/${selectedTournament}`),
                apiFetch(`${API_URL}/api/league-admin/tournament/${selectedTournament}/players`),
                apiFetch(`${API_URL}/api/league-admin/tournament/${selectedTournament}/byes`)
            ]);
            setMatches(await resMatches.json());
            setTournamentPlayers(await resPlayers.json());
            const byesData = await resByes.json();
            setTournamentByes(Array.isArray(byesData) ? byesData : []);
        } catch (error) { console.error("Error:", error); }
    };

    useEffect(() => {
        // Al cambiar de liga se vuelve a la jornada pendiente de la nueva, no a
        // la que se estaba mirando en la anterior.
        setJornadaVista(null);
        fetchMatches();
    }, [selectedTournament]);

    // Torneo actualmente seleccionado (objeto completo, para conocer su estado)
    const selectedTournamentObj = tournaments.find(t => String(t.id) === String(selectedTournament));

    // Finalizar / reactivar torneo manualmente
    const handleToggleStatus = async () => {
        if (!selectedTournamentObj) return;
        const isPast = selectedTournamentObj.status === 'past';
        const newStatus = isPast ? 'active' : 'past';

        const msg = isPast
            ? '¿Reactivar este torneo? Volverá a aparecer como liga en juego.'
            : '¿Finalizar este torneo? Se mostrará como campeonato terminado y se activará la celebración del campeón.';
        if (!window.confirm(msg)) return;

        try {
            const res = await apiFetch(`${API_URL}/api/league-admin/tournament/${selectedTournament}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Error del servidor');
            await fetchInitialData(); // refresca la lista con el nuevo estado
        } catch (error) {
            console.error('Error cambiando estado:', error);
            alert('No se pudo cambiar el estado del torneo.');
        }
    };

    // Portada del torneo: la foto que se ve en su tarjeta en /liga.
    const [portadaUrl, setPortadaUrl] = useState('');
    const [portadaEstado, setPortadaEstado] = useState('idle'); // idle | subiendo | guardando | ok | error

    // Al cambiar de torneo, el campo muestra la portada que ya tiene.
    useEffect(() => {
        setPortadaUrl(selectedTournamentObj?.image_url || '');
        setPortadaEstado('idle');
    }, [selectedTournamentObj?.id, selectedTournamentObj?.image_url]);

    const subirPortada = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPortadaEstado('subiendo');
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await apiFetch(`${API_URL}/api/upload`, { method: 'POST', body: formData });
            if (!res.ok) throw new Error('No se pudo subir la imagen');
            const data = await res.json();
            setPortadaUrl(data.url);
            setPortadaEstado('idle');
        } catch (error) {
            console.error(error);
            setPortadaEstado('error');
        }
    };

    const guardarPortada = async () => {
        setPortadaEstado('guardando');
        try {
            const res = await apiFetch(`${API_URL}/api/league-admin/tournament/${selectedTournament}/image`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_url: portadaUrl }),
            });
            if (!res.ok) {
                const { error } = await res.json().catch(() => ({}));
                throw new Error(error || 'Error del servidor');
            }
            await fetchInitialData();
            setPortadaEstado('ok');
            setTimeout(() => setPortadaEstado('idle'), 2500);
        } catch (error) {
            console.error('Error guardando la portada:', error);
            setPortadaEstado('error');
        }
    };

    // ==========================================
    // MODAL: NUEVO EQUIPO
    // ==========================================
    const CreateTeamModal = () => {
        const [form, setForm] = useState({ name: '', short_name: '', logo_url: '', bio_title: '', bio_description: '' });

        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                const res = await apiFetch(`${API_URL}/api/league-admin/teams`, {
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
                const res = await apiFetch(`${API_URL}/api/league-admin/players`, {
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

        // Torneos con formato de tres etapas: cada partido guarda a cuál
        // pertenece. Se reconoce porque el fixture ya cargado la trae.
        const usaEtapas = matches.some(m => m.stage);

        // La etapa que se propone por defecto: la del último partido cargado.
        // Mientras el torneo siga en la misma fase no hay que tocar nada.
        const etapaSugerida = isEditing
            ? (fixtureToEdit.matches.find(m => m.stage)?.stage || 'fase1')
            : ([...matches].sort((a, b) => (b.round || 0) - (a.round || 0))[0]?.stage || 'fase1');

        // Si estamos editando, pre-poblar slots con datos existentes
        const initialSlots = isEditing
            ? fixtureToEdit.matches.map(m => ({
                matchId: m.id,
                hour: horaChile(m.match_date),
                home_team_id: String(m.home_team_id),
                away_team_id: String(m.away_team_id),
                stage: m.stage || etapaSugerida,
            }))
            : isMartes
                ? [
                    { hour: '19:00', home_team_id: '', away_team_id: '', stage: etapaSugerida },
                    { hour: '20:00', home_team_id: '', away_team_id: '', stage: etapaSugerida },
                    { hour: '21:00', home_team_id: '', away_team_id: '', stage: etapaSugerida },
                    { hour: '22:00', home_team_id: '', away_team_id: '', stage: etapaSugerida },
                ]
                : [
                    { hour: '19:00', home_team_id: '', away_team_id: '', stage: etapaSugerida },
                    { hour: '20:00', home_team_id: '', away_team_id: '', stage: etapaSugerida },
                    { hour: '22:00', home_team_id: '', away_team_id: '', stage: etapaSugerida },
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
                        await apiFetch(`${API_URL}/api/league-admin/match/${slot.matchId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                home_team_id: slot.home_team_id,
                                away_team_id: slot.away_team_id,
                                match_date: isoDesdeChile(matchDate, slot.hour),
                                ...(usaEtapas && { stage: slot.stage }),
                            })
                        });
                    } else {
                        // POST partido nuevo
                        await apiFetch(`${API_URL}/api/league-admin/match`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                tournament_id: selectedTournament,
                                home_team_id: slot.home_team_id,
                                away_team_id: slot.away_team_id,
                                match_date: isoDesdeChile(matchDate, slot.hour),
                                location: 'Cancha Principal',
                                ...(usaEtapas && { stage: slot.stage }),
                            })
                        });
                    }
                }

                if (!isMartes) {
                    if (isEditing && fixtureToEdit.bye) {
                        // Actualizar bye existente
                        if (byeTeamId) {
                            await apiFetch(`${API_URL}/api/league-admin/bye/${fixtureToEdit.bye.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ team_id: byeTeamId })
                            });
                        }
                    } else if (byeTeamId) {
                        // Crear bye nuevo
                        const lastMatch = await apiFetch(`${API_URL}/api/league-admin/tournament/${selectedTournament}`);
                        const lastMatchData = await lastMatch.json();
                        const currentRound = Math.max(...lastMatchData.map(m => m.round || 1));
                        await apiFetch(`${API_URL}/api/league-admin/bye`, {
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
                                    {/* Etapa del partido: solo en los torneos de tres fases.
                                        Va por partido y no por fecha porque en la segunda
                                        fase la misma noche tiene los dos grupos. */}
                                    {usaEtapas && (
                                        <select
                                            value={slot.stage}
                                            className="ml-auto rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 px-2 py-1 text-xs font-bold focus:border-primary focus:outline-none"
                                            onChange={e => updateSlot(index, 'stage', e.target.value)}
                                        >
                                            <option value="fase1">Primera Fase</option>
                                            <option value="grupo_a">Grupo A</option>
                                            <option value="grupo_b">Grupo B</option>
                                            <option value="final">Final</option>
                                        </select>
                                    )}
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
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => setShowCreateMatch(true)} className="w-full md:w-auto px-8 py-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl shadow-[0_0_15px_rgba(236,19,19,0.2)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                            <span className="material-symbols-outlined text-2xl">event_available</span> Programar Fecha
                        </button>
                        {selectedTournamentObj?.status === 'past' ? (
                            <button onClick={handleToggleStatus} className="w-full md:w-auto px-8 py-4 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-black uppercase tracking-widest rounded-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                                <span className="material-symbols-outlined text-2xl">restart_alt</span> Reactivar
                            </button>
                        ) : (
                            <button onClick={handleToggleStatus} className="w-full md:w-auto px-8 py-4 bg-amber-500 text-white font-black uppercase tracking-widest rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                                <span className="material-symbols-outlined text-2xl">emoji_events</span> Finalizar Torneo
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* PORTADA DE LA LIGA */}
            {selectedTournament && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-widest">
                        Portada de la liga
                    </label>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-48 h-28 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            {portadaUrl ? (
                                <img src={portadaUrl} alt="Vista previa de la portada" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                                    <span className="material-symbols-outlined text-4xl">image</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 flex flex-col gap-3">
                            <input
                                type="url"
                                value={portadaUrl}
                                onChange={(e) => setPortadaUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:border-primary focus:outline-none transition-colors"
                            />

                            <div className="flex flex-wrap items-center gap-3">
                                <label className="cursor-pointer px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">upload</span>
                                    {portadaEstado === 'subiendo' ? 'Subiendo...' : 'Subir foto'}
                                    <input type="file" accept="image/*" onChange={subirPortada} className="hidden" />
                                </label>

                                <button
                                    onClick={guardarPortada}
                                    disabled={!portadaUrl || portadaEstado === 'guardando' || portadaEstado === 'subiendo'}
                                    className="px-5 py-2 rounded-lg bg-primary text-white text-xs font-black uppercase tracking-widest hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:hover:translate-y-0 flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">save</span>
                                    {portadaEstado === 'guardando' ? 'Guardando...' : 'Guardar'}
                                </button>

                                {portadaEstado === 'ok' && (
                                    <span className="text-xs font-bold text-green-500 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">check_circle</span> Guardada
                                    </span>
                                )}
                                {portadaEstado === 'error' && (
                                    <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-base">error</span> No se pudo guardar
                                    </span>
                                )}
                            </div>

                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                Podés subir una foto o pegar una URL. Si subís, se guarda en Cloudinary y la URL se
                                rellena sola; después hay que apretar Guardar.
                            </p>
                        </div>
                    </div>
                </div>
            )}

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

                        const numeros = Object.keys(rounds).map(Number).sort((a, b) => a - b);
                        // La jornada que se muestra al entrar: la primera con algo sin
                        // jugar, que es la que hay que cargar. Si están todas listas,
                        // la última.
                        const pendiente = numeros.find(n => rounds[n].some(m => m.status !== 'finished'))
                            ?? numeros[numeros.length - 1];
                        const actual = numeros.includes(Number(jornadaVista)) ? Number(jornadaVista) : pendiente;

                        const partidos = rounds[actual] || [];
                        const posicion = numeros.indexOf(actual);
                        const anterior = posicion > 0 ? numeros[posicion - 1] : null;
                        const siguiente = posicion < numeros.length - 1 ? numeros[posicion + 1] : null;

                        const jugados = partidos.filter(m => m.status === 'finished').length;
                        const bye = tournamentByes?.find(b => String(b.round) === String(actual));
                        const inicio = partidos.reduce(
                            (min, m) => (m.match_date && m.match_date < min ? m.match_date : min),
                            partidos[0]?.match_date,
                        );

                        return (
                            <div className="p-4 space-y-4">
                                {/* TIRA DE JORNADAS — el mismo acceso directo que tiene
                                    el sitio público. Reemplaza a la lista de acordeones,
                                    que obligaba a hacer scroll para llegar a la última. */}
                                <div className="flex gap-1.5 overflow-x-auto pb-1">
                                    {numeros.map(n => {
                                        const esta = n === actual;
                                        const lista = rounds[n].every(m => m.status === 'finished');
                                        return (
                                            <button
                                                key={n}
                                                onClick={() => setJornadaVista(n)}
                                                aria-current={esta ? 'true' : undefined}
                                                title={`Jornada ${n}${lista ? ' (completada)' : ''}`}
                                                className={`shrink-0 w-10 h-10 rounded-lg text-sm font-black transition-colors ${
                                                    esta
                                                        ? 'bg-primary text-white'
                                                        : lista
                                                            ? 'bg-slate-100 dark:bg-slate-700/50 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                            : 'bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                {n}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* CABECERA DE LA JORNADA */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => anterior !== null && setJornadaVista(anterior)}
                                        disabled={anterior === null}
                                        aria-label="Jornada anterior"
                                        className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                                    >
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>

                                    <div className="flex-1 min-w-0 text-center">
                                        <h4 className="text-2xl font-black uppercase text-slate-900 dark:text-white leading-none">
                                            Jornada {actual}
                                        </h4>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1.5">
                                            {inicio && fechaChile(inicio, { weekday: 'long', day: 'numeric', month: 'long' })}
                                            {' · '}
                                            {jugados === partidos.length
                                                ? 'Completada'
                                                : `${jugados} de ${partidos.length} cargados`}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => siguiente !== null && setJornadaVista(siguiente)}
                                        disabled={siguiente === null}
                                        aria-label="Jornada siguiente"
                                        className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                                    >
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </div>

                                {/* PARTIDOS — siempre a la vista, sin desplegar nada */}
                                <ul className="rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700/50 overflow-hidden">
                                    {partidos.map(match => (
                                        <li key={match.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50 dark:bg-slate-800/30">
                                            <span className="shrink-0 w-16 text-sm font-black text-primary tabular-nums">
                                                {horaChile(match.match_date)}
                                            </span>

                                            <div className="flex-1 min-w-0 flex items-center gap-3">
                                                <span className="flex-1 truncate text-right font-bold text-slate-900 dark:text-white">
                                                    {match.home?.name}
                                                </span>
                                                {match.status === 'finished' ? (
                                                    <span className="shrink-0 rounded-lg bg-slate-900 dark:bg-white px-3 py-1 text-lg font-black tabular-nums text-white dark:text-slate-900">
                                                        {match.home_score} - {match.away_score}
                                                    </span>
                                                ) : (
                                                    <span className="shrink-0 px-3 text-slate-300 dark:text-slate-600 font-black">VS</span>
                                                )}
                                                <span className="flex-1 truncate font-bold text-slate-900 dark:text-white">
                                                    {match.away?.name}
                                                </span>
                                            </div>

                                            <div className="shrink-0 sm:w-44 flex sm:justify-end">
                                                {match.status === 'finished' ? (
                                                    <button
                                                        onClick={() => setMatchToResult(match)}
                                                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">edit</span> Corregir
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => setMatchToResult(match)}
                                                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-green-600 text-white text-xs font-black uppercase tracking-widest hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">scoreboard</span> Anotar resultado
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}

                                    {bye && (
                                        <li className="px-4 py-3 bg-amber-50/50 dark:bg-amber-900/10 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-amber-500 text-sm">event_busy</span>
                                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                                Descansa {teams.find(t => t.id === bye.team_id)?.name}
                                            </span>
                                        </li>
                                    )}
                                </ul>

                                {/* ACCIONES DE LA JORNADA
                                    Antes eran dos enlaces llamados "Editar jornada" y
                                    "Editar Fecha", que no se distinguían entre sí. Ahora
                                    cada uno dice qué cambia. */}
                                {editingRound === String(actual) ? (
                                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                                        <span className="text-xs font-bold uppercase text-slate-500">Pasar estos partidos a la jornada</span>
                                        <input
                                            type="number"
                                            min="1"
                                            value={newRoundValue}
                                            onChange={e => setNewRoundValue(e.target.value)}
                                            className="w-20 p-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                                        />
                                        <button
                                            onClick={async () => {
                                                const destino = parseInt(newRoundValue, 10);
                                                if (!destino || destino < 1) return;
                                                await Promise.all(partidos.map(m =>
                                                    apiFetch(`${API_URL}/api/league-admin/match/${m.id}/round`, {
                                                        method: 'PATCH',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ round: destino })
                                                    })
                                                ));
                                                setEditingRound(null);
                                                setJornadaVista(destino);
                                                fetchMatches();
                                            }}
                                            className="px-4 py-2 bg-primary text-white text-xs font-black uppercase tracking-wider rounded-lg hover:bg-primary/90 transition-colors"
                                        >
                                            Mover
                                        </button>
                                        <button
                                            onClick={() => setEditingRound(null)}
                                            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white text-xs font-black uppercase tracking-wider rounded-lg"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <button
                                            onClick={() => {
                                                setFixtureToEdit({ round: String(actual), matches: partidos, bye });
                                                setShowCreateMatch(true);
                                            }}
                                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-base">edit_calendar</span>
                                            Cambiar cruces, día y horarios
                                        </button>
                                        <button
                                            onClick={() => { setEditingRound(String(actual)); setNewRoundValue(String(actual)); }}
                                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-base">tag</span>
                                            Cambiar el número de esta jornada
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {showCreateTeam && <CreateTeamModal />}
                    {showCreatePlayer && <CreatePlayerModal />}
                    {showCreateMatch && <CreateMatchModal />}
                    {matchToResult && (
                        <ResultadoModal
                            partido={matchToResult}
                            jugadores={tournamentPlayers}
                            tournamentId={selectedTournament}
                            onCerrar={() => setMatchToResult(null)}
                            onGuardado={() => { setMatchToResult(null); fetchMatches(); }}
                            onRecargarJugadores={fetchMatches}
                        />
                    )}
                </div>
            )}

        </div>
    );
};


export default LeagueManager;
