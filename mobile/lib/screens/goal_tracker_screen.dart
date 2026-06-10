import 'dart:async';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';
import '../models/tournament.dart';
import '../models/match.dart';
import '../models/player.dart';
import '../services/staging_service.dart';

class GoalTrackerScreen extends StatefulWidget {
  final Tournament tournament;
  final MatchItem match;
  const GoalTrackerScreen({super.key, required this.tournament, required this.match});

  @override
  State<GoalTrackerScreen> createState() => _GoalTrackerScreenState();
}

class _GoalTrackerScreenState extends State<GoalTrackerScreen> {
  final _service = StagingService();
  List<Player> _players = [];
  bool _loadingPlayers = true;
  String? _loadError;

  // Cada gol es un evento individual con minuto opcional
  final List<GoalEvent> _goals = [];

  // Set de playerIds marcados como "jugando este partido"
  final Set<int> _playing = {};

  // Reloj
  bool _clockStarted = false;
  bool _clockRunning = false;
  DateTime? _clockStartedAt;
  Duration _accumulated = Duration.zero;
  Timer? _ticker;

  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _loadPlayers();
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  Future<void> _loadPlayers() async {
    setState(() {
      _loadingPlayers = true;
      _loadError = null;
    });
    try {
      final players = await _service.fetchPlayers(widget.tournament.id);
      if (!mounted) return;
      setState(() {
        _players = players;
        // Por defecto, todos están "jugando". El usuario desmarca los que no.
        _playing
          ..clear()
          ..addAll(players.map((p) => p.id));
        _loadingPlayers = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loadError = e.toString();
        _loadingPlayers = false;
      });
    }
  }

  // ─── Marcador ───────────────────────────────────────
  int _countFor(int playerId) =>
      _goals.where((g) => g.playerId == playerId).length;

  int get _homeScore =>
      _goals.where((g) => g.teamId == widget.match.home.id).length;

  int get _awayScore =>
      _goals.where((g) => g.teamId == widget.match.away.id).length;

  void _addGoal(Player p) {
    setState(() {
      // Auto-marca como "jugando" si no estaba
      _playing.add(p.id);
      _goals.add(GoalEvent(
        playerId: p.id,
        teamId: p.teamId,
        playerName: p.name,
        minute: _currentMinute,
      ));
    });
  }

  void _removeLastGoal(int playerId) {
    final idx = _goals.lastIndexWhere((g) => g.playerId == playerId);
    if (idx < 0) return;
    setState(() => _goals.removeAt(idx));
  }

  void _togglePlaying(Player p) {
    setState(() {
      if (_playing.contains(p.id)) {
        _playing.remove(p.id);
      } else {
        _playing.add(p.id);
      }
    });
  }

  void _setAllPlaying(int teamId, bool playing) {
    setState(() {
      final ids = _players.where((p) => p.teamId == teamId).map((p) => p.id);
      if (playing) {
        _playing.addAll(ids);
      } else {
        _playing.removeAll(ids);
      }
    });
  }

  // ─── Reloj ──────────────────────────────────────────
  Duration get _elapsed {
    if (!_clockStarted) return Duration.zero;
    if (_clockRunning && _clockStartedAt != null) {
      return _accumulated + DateTime.now().difference(_clockStartedAt!);
    }
    return _accumulated;
  }

  int? get _currentMinute => _clockStarted ? _elapsed.inMinutes : null;

  String get _clockText {
    final e = _elapsed;
    final m = e.inMinutes.toString().padLeft(2, '0');
    final s = (e.inSeconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  void _startClock() {
    setState(() {
      _clockStarted = true;
      _clockRunning = true;
      _clockStartedAt = DateTime.now();
    });
    _ticker?.cancel();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() {});
    });
  }

  void _pauseClock() {
    if (!_clockRunning) return;
    setState(() {
      _accumulated += DateTime.now().difference(_clockStartedAt!);
      _clockRunning = false;
      _clockStartedAt = null;
    });
    _ticker?.cancel();
  }

  void _resumeClock() {
    setState(() {
      _clockRunning = true;
      _clockStartedAt = DateTime.now();
    });
    _ticker?.cancel();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() {});
    });
  }

  Future<void> _resetClock() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Reiniciar reloj'),
        content: const Text('Esto pone el reloj en 00:00. Los goles ya marcados conservan su minuto.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Reiniciar')),
        ],
      ),
    );
    if (ok != true) return;
    setState(() {
      _clockStarted = false;
      _clockRunning = false;
      _clockStartedAt = null;
      _accumulated = Duration.zero;
    });
    _ticker?.cancel();
  }

  // ─── Acciones ───────────────────────────────────────

  Future<void> _openAddPlayer(int teamId, String teamName) async {
    final added = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => AddPlayerSheet(
        service: _service,
        tournamentId: widget.tournament.id,
        teamId: teamId,
        teamName: teamName,
        existingInTeam: _players
            .where((p) => p.teamId == teamId)
            .map((p) => p.name.toLowerCase())
            .toSet(),
      ),
    );
    if (added == true) {
      await _loadPlayers();
    }
  }

  Future<void> _openHistory() async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => GoalHistorySheet(
        goals: _goals,
        homeTeamId: widget.match.home.id,
        homeName: widget.match.home.name,
        awayName: widget.match.away.name,
        onRemove: (event) {
          setState(() => _goals.remove(event));
        },
      ),
    );
  }

  Future<void> _submit() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Enviar resultado'),
        content: Text(
          '${widget.match.home.name} $_homeScore - $_awayScore ${widget.match.away.name}\n\n'
          '${_goals.length} ${_goals.length == 1 ? "gol registrado" : "goles registrados"}.\n'
          'Se enviará al administrador para validación.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Enviar')),
        ],
      ),
    );
    if (confirmed != true) return;

    setState(() => _saving = true);
    try {
      final prefs = await SharedPreferences.getInstance();
      final deviceLabel = prefs.getString('device_label') ?? AppConfig.defaultDeviceLabel;

      await _service.submitResult(
        matchId: widget.match.id,
        homeScore: _homeScore,
        awayScore: _awayScore,
        deviceLabel: deviceLabel,
        goals: _goals,
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Resultado enviado. Esperando validación del admin.'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.redAccent),
      );
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  // ─── Build ──────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.match.home.name} vs ${widget.match.away.name}',
            overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 16)),
        actions: [
          IconButton(
            tooltip: 'Historial de goles',
            icon: Badge(
              isLabelVisible: _goals.isNotEmpty,
              label: Text('${_goals.length}'),
              child: const Icon(Icons.list_alt),
            ),
            onPressed: _openHistory,
          ),
        ],
      ),
      body: _loadingPlayers
          ? const Center(child: CircularProgressIndicator())
          : _loadError != null
              ? _ErrorBlock(message: _loadError!, onRetry: _loadPlayers)
              : _buildBody(),
    );
  }

  Widget _buildBody() {
    final homePlayers = _players.where((p) => p.teamId == widget.match.home.id).toList()
      ..sort((a, b) => a.name.compareTo(b.name));
    final awayPlayers = _players.where((p) => p.teamId == widget.match.away.id).toList()
      ..sort((a, b) => a.name.compareTo(b.name));

    final homePlaying = homePlayers.where((p) => _playing.contains(p.id)).length;
    final awayPlaying = awayPlayers.where((p) => _playing.contains(p.id)).length;

    return Column(
      children: [
        _ClockBar(
          text: _clockText,
          started: _clockStarted,
          running: _clockRunning,
          onStart: _startClock,
          onPause: _pauseClock,
          onResume: _resumeClock,
          onReset: _resetClock,
        ),
        _ScoreBoard(
          homeName: widget.match.home.name,
          awayName: widget.match.away.name,
          homeScore: _homeScore,
          awayScore: _awayScore,
        ),
        Expanded(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: _TeamColumn(
                  title: widget.match.home.name,
                  players: homePlayers,
                  playing: _playing,
                  playingCount: homePlaying,
                  countFor: _countFor,
                  onTogglePlaying: _togglePlaying,
                  onAdd: _addGoal,
                  onRemove: _removeLastGoal,
                  onAddPlayer: () => _openAddPlayer(widget.match.home.id, widget.match.home.name),
                  onSetAll: (v) => _setAllPlaying(widget.match.home.id, v),
                ),
              ),
              const VerticalDivider(width: 1),
              Expanded(
                child: _TeamColumn(
                  title: widget.match.away.name,
                  players: awayPlayers,
                  playing: _playing,
                  playingCount: awayPlaying,
                  countFor: _countFor,
                  onTogglePlaying: _togglePlaying,
                  onAdd: _addGoal,
                  onRemove: _removeLastGoal,
                  onAddPlayer: () => _openAddPlayer(widget.match.away.id, widget.match.away.name),
                  onSetAll: (v) => _setAllPlaying(widget.match.away.id, v),
                ),
              ),
            ],
          ),
        ),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: FilledButton.icon(
              onPressed: _saving ? null : _submit,
              icon: _saving
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.send),
              label: Text(_saving ? 'Enviando...' : 'Enviar resultado'),
              style: FilledButton.styleFrom(
                minimumSize: const Size.fromHeight(56),
                textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// ─── Error block ──────────────────────────────────────

class _ErrorBlock extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorBlock({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.redAccent),
            const SizedBox(height: 12),
            const Text('Error cargando jugadores',
                style: TextStyle(fontWeight: FontWeight.w800)),
            const SizedBox(height: 8),
            Text(message,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.black54, fontSize: 12)),
            const SizedBox(height: 16),
            FilledButton(onPressed: onRetry, child: const Text('Reintentar')),
          ],
        ),
      ),
    );
  }
}

// ─── Reloj ────────────────────────────────────────────

class _ClockBar extends StatelessWidget {
  final String text;
  final bool started;
  final bool running;
  final VoidCallback onStart;
  final VoidCallback onPause;
  final VoidCallback onResume;
  final VoidCallback onReset;

  const _ClockBar({
    required this.text,
    required this.started,
    required this.running,
    required this.onStart,
    required this.onPause,
    required this.onResume,
    required this.onReset,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.grey.shade900,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        children: [
          Icon(
            running ? Icons.timer : Icons.timer_outlined,
            color: running ? Colors.green.shade300 : Colors.grey.shade400,
            size: 20,
          ),
          const SizedBox(width: 8),
          Text(
            text,
            style: TextStyle(
              color: running ? Colors.green.shade300 : Colors.grey.shade300,
              fontWeight: FontWeight.w900,
              fontSize: 18,
              fontFeatures: const [FontFeature.tabularFigures()],
            ),
          ),
          const Spacer(),
          if (!started)
            FilledButton.icon(
              onPressed: onStart,
              icon: const Icon(Icons.play_arrow, size: 18),
              label: const Text('Iniciar'),
              style: FilledButton.styleFrom(
                backgroundColor: Colors.green.shade600,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
            )
          else ...[
            if (running)
              IconButton(
                onPressed: onPause,
                icon: const Icon(Icons.pause, color: Colors.white),
                tooltip: 'Pausar',
              )
            else
              IconButton(
                onPressed: onResume,
                icon: const Icon(Icons.play_arrow, color: Colors.green),
                tooltip: 'Reanudar',
              ),
            IconButton(
              onPressed: onReset,
              icon: Icon(Icons.replay, color: Colors.grey.shade300),
              tooltip: 'Reiniciar',
            ),
          ],
        ],
      ),
    );
  }
}

// ─── Scoreboard ───────────────────────────────────────

class _ScoreBoard extends StatelessWidget {
  final String homeName;
  final String awayName;
  final int homeScore;
  final int awayScore;
  const _ScoreBoard({
    required this.homeName,
    required this.awayName,
    required this.homeScore,
    required this.awayScore,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black,
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
      child: Row(
        children: [
          Expanded(
            child: Text(homeName,
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.w900, fontSize: 14)),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text('$homeScore - $awayScore',
                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 28)),
          ),
          Expanded(
            child: Text(awayName,
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                    color: Colors.white, fontWeight: FontWeight.w900, fontSize: 14)),
          ),
        ],
      ),
    );
  }
}

// ─── Columna por equipo ───────────────────────────────

class _TeamColumn extends StatelessWidget {
  final String title;
  final List<Player> players;
  final Set<int> playing;
  final int playingCount;
  final int Function(int playerId) countFor;
  final void Function(Player) onTogglePlaying;
  final void Function(Player) onAdd;
  final void Function(int playerId) onRemove;
  final VoidCallback onAddPlayer;
  final void Function(bool playing) onSetAll;

  const _TeamColumn({
    required this.title,
    required this.players,
    required this.playing,
    required this.playingCount,
    required this.countFor,
    required this.onTogglePlaying,
    required this.onAdd,
    required this.onRemove,
    required this.onAddPlayer,
    required this.onSetAll,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _columnHeader(context),
        Expanded(
          child: players.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Sin jugadores inscritos en $title',
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.black54, fontSize: 13),
                        ),
                        const SizedBox(height: 12),
                        FilledButton.tonalIcon(
                          onPressed: onAddPlayer,
                          icon: const Icon(Icons.person_add, size: 18),
                          label: const Text('Agregar jugador'),
                        ),
                      ],
                    ),
                  ),
                )
              : ListView.builder(
                  padding: EdgeInsets.zero,
                  itemCount: players.length,
                  itemBuilder: (_, i) {
                    final p = players[i];
                    final isPlaying = playing.contains(p.id);
                    final count = countFor(p.id);
                    return _PlayerRow(
                      player: p,
                      playing: isPlaying,
                      count: count,
                      onTogglePlaying: () => onTogglePlaying(p),
                      onPlus: () => onAdd(p),
                      onMinus: count > 0 ? () => onRemove(p.id) : null,
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _columnHeader(BuildContext context) {
    return Material(
      color: Colors.grey.shade100,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      color: Colors.grey.shade800,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
                IconButton(
                  onPressed: onAddPlayer,
                  icon: const Icon(Icons.person_add_alt_1, size: 20),
                  color: Theme.of(context).colorScheme.primary,
                  tooltip: 'Agregar jugador',
                  padding: EdgeInsets.zero,
                  visualDensity: VisualDensity.compact,
                  constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                ),
              ],
            ),
            const SizedBox(height: 2),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    '$playingCount / ${players.length} jugando',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                      fontSize: 10,
                    ),
                  ),
                ),
                const Spacer(),
                if (players.isNotEmpty)
                  InkWell(
                    onTap: () => onSetAll(playingCount < players.length),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                      child: Text(
                        playingCount < players.length ? 'Todos' : 'Ninguno',
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: Colors.blue,
                          letterSpacing: 0.3,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Fila de jugador ──────────────────────────────────

class _PlayerRow extends StatelessWidget {
  final Player player;
  final bool playing;
  final int count;
  final VoidCallback onTogglePlaying;
  final VoidCallback onPlus;
  final VoidCallback? onMinus;
  const _PlayerRow({
    required this.player,
    required this.playing,
    required this.count,
    required this.onTogglePlaying,
    required this.onPlus,
    required this.onMinus,
  });

  @override
  Widget build(BuildContext context) {
    final textColor = playing ? Colors.black : Colors.grey.shade400;
    return Container(
      decoration: BoxDecoration(
        color: count > 0 ? Colors.amber.shade50 : null,
        border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
      child: Row(
        children: [
          InkResponse(
            onTap: onTogglePlaying,
            radius: 18,
            child: Container(
              width: 28,
              height: 28,
              alignment: Alignment.center,
              child: Icon(
                playing ? Icons.check_circle : Icons.radio_button_unchecked,
                size: 20,
                color: playing ? Colors.green.shade600 : Colors.grey.shade400,
              ),
            ),
          ),
          Expanded(
            child: Text(
              player.name,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontWeight: count > 0 ? FontWeight.w900 : FontWeight.w600,
                fontSize: 14,
                height: 1.15,
                color: textColor,
              ),
            ),
          ),
          const SizedBox(width: 2),
          _CompactCounter(count: count, onMinus: onMinus, onPlus: onPlus),
        ],
      ),
    );
  }
}

class _CompactCounter extends StatelessWidget {
  final int count;
  final VoidCallback? onMinus;
  final VoidCallback onPlus;
  const _CompactCounter({
    required this.count,
    required this.onMinus,
    required this.onPlus,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        InkResponse(
          onTap: onMinus,
          radius: 22,
          child: Container(
            width: 32,
            height: 32,
            alignment: Alignment.center,
            child: Icon(
              Icons.remove_circle_outline,
              size: 24,
              color: count > 0 ? Colors.redAccent : Colors.grey.shade300,
            ),
          ),
        ),
        SizedBox(
          width: 24,
          child: Text('$count',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 17,
                color: count > 0 ? Theme.of(context).colorScheme.primary : Colors.grey.shade400,
              )),
        ),
        InkResponse(
          onTap: onPlus,
          radius: 22,
          child: Container(
            width: 32,
            height: 32,
            alignment: Alignment.center,
            child: const Icon(Icons.add_circle, size: 26, color: Colors.green),
          ),
        ),
      ],
    );
  }
}

// ─── Sheet: Agregar jugador ───────────────────────────

class AddPlayerSheet extends StatefulWidget {
  final StagingService service;
  final int tournamentId;
  final int teamId;
  final String teamName;
  final Set<String> existingInTeam; // lowercase

  const AddPlayerSheet({
    super.key,
    required this.service,
    required this.tournamentId,
    required this.teamId,
    required this.teamName,
    required this.existingInTeam,
  });

  @override
  State<AddPlayerSheet> createState() => _AddPlayerSheetState();
}

class _AddPlayerSheetState extends State<AddPlayerSheet> {
  final _ctrl = TextEditingController();
  List<GlobalPlayer> _all = [];
  bool _loading = true;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
    _ctrl.addListener(() => setState(() {}));
  }

  Future<void> _load() async {
    try {
      final players = await widget.service.fetchAllGlobalPlayers();
      if (!mounted) return;
      setState(() {
        _all = players;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _add(String name) async {
    setState(() => _saving = true);
    try {
      await widget.service.addPlayerToTeam(
        name: name.trim(),
        teamId: widget.teamId,
        tournamentId: widget.tournamentId,
      );
      if (!mounted) return;
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.redAccent),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final query = _ctrl.text.trim();
    final lowered = query.toLowerCase();
    final filtered = lowered.isEmpty
        ? _all
        : _all.where((p) => p.name.toLowerCase().contains(lowered)).toList();
    final exactMatch = lowered.isNotEmpty &&
        _all.any((p) => p.name.toLowerCase() == lowered);

    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      expand: false,
      builder: (_, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  margin: const EdgeInsets.only(top: 10, bottom: 8),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Agregar jugador a ${widget.teamName}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Busca un jugador existente o créalo si no aparece.',
                        style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: _ctrl,
                        autofocus: true,
                        textCapitalization: TextCapitalization.words,
                        decoration: InputDecoration(
                          hintText: 'Nombre o apodo',
                          prefixIcon: const Icon(Icons.search),
                          suffixIcon: _ctrl.text.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(Icons.clear),
                                  onPressed: () => _ctrl.clear(),
                                )
                              : null,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 12),
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: _buildList(filtered, scrollController),
                ),
                if (query.isNotEmpty && !exactMatch)
                  SafeArea(
                    top: false,
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                      child: FilledButton.icon(
                        onPressed: _saving ? null : () => _add(query),
                        icon: _saving
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2, color: Colors.white),
                              )
                            : const Icon(Icons.add),
                        label: Text(_saving ? 'Creando...' : 'Crear "$query"'),
                        style: FilledButton.styleFrom(
                          minimumSize: const Size.fromHeight(50),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildList(List<GlobalPlayer> items, ScrollController controller) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Error: $_error', textAlign: TextAlign.center),
              const SizedBox(height: 12),
              FilledButton(onPressed: _load, child: const Text('Reintentar')),
            ],
          ),
        ),
      );
    }
    if (items.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            _ctrl.text.isEmpty
                ? 'No hay jugadores en el sistema todavía.'
                : 'Ningún jugador coincide. Crea uno con el botón de abajo.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey.shade600),
          ),
        ),
      );
    }
    return ListView.separated(
      controller: controller,
      itemCount: items.length,
      separatorBuilder: (_, _) => Divider(height: 1, color: Colors.grey.shade200),
      itemBuilder: (_, i) {
        final p = items[i];
        final alreadyInTeam = widget.existingInTeam.contains(p.name.toLowerCase());
        return ListTile(
          dense: true,
          title: Text(p.name, style: const TextStyle(fontWeight: FontWeight.w600)),
          trailing: alreadyInTeam
              ? Icon(Icons.check_circle, color: Colors.green.shade400, size: 20)
              : const Icon(Icons.add_circle_outline, color: Colors.green, size: 22),
          subtitle: alreadyInTeam
              ? Text('Ya está en ${widget.teamName}',
                  style: TextStyle(color: Colors.green.shade700, fontSize: 11))
              : null,
          enabled: !alreadyInTeam && !_saving,
          onTap: alreadyInTeam ? null : () => _add(p.name),
        );
      },
    );
  }
}

// ─── Sheet: Historial cronológico ─────────────────────

class GoalHistorySheet extends StatelessWidget {
  final List<GoalEvent> goals;
  final int homeTeamId;
  final String homeName;
  final String awayName;
  final void Function(GoalEvent) onRemove;
  const GoalHistorySheet({
    super.key,
    required this.goals,
    required this.homeTeamId,
    required this.homeName,
    required this.awayName,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final sorted = [...goals]..sort((a, b) {
        if (a.minute == null && b.minute == null) return 0;
        if (a.minute == null) return 1;
        if (b.minute == null) return -1;
        return a.minute!.compareTo(b.minute!);
      });

    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      maxChildSize: 0.95,
      minChildSize: 0.3,
      expand: false,
      builder: (_, controller) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.only(top: 10, bottom: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const Padding(
              padding: EdgeInsets.fromLTRB(16, 4, 16, 12),
              child: Row(
                children: [
                  Icon(Icons.list_alt, size: 20),
                  SizedBox(width: 8),
                  Text('Historial de goles',
                      style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                ],
              ),
            ),
            Expanded(
              child: sorted.isEmpty
                  ? const Center(
                      child: Padding(
                        padding: EdgeInsets.all(24),
                        child: Text('No hay goles registrados todavía.',
                            style: TextStyle(color: Colors.black54)),
                      ),
                    )
                  : ListView.separated(
                      controller: controller,
                      itemCount: sorted.length,
                      separatorBuilder: (_, _) =>
                          Divider(height: 1, color: Colors.grey.shade200),
                      itemBuilder: (_, i) {
                        final g = sorted[i];
                        final isHome = g.teamId == homeTeamId;
                        return ListTile(
                          dense: true,
                          leading: Container(
                            width: 44,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: Colors.black,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 4),
                            child: Text(
                              g.minute != null ? "${g.minute}'" : '—',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w900,
                                fontSize: 13,
                              ),
                            ),
                          ),
                          title: Text(g.playerName,
                              style: const TextStyle(fontWeight: FontWeight.w800)),
                          subtitle: Text(isHome ? homeName : awayName,
                              style: TextStyle(
                                color: Colors.grey.shade600,
                                fontSize: 11,
                              )),
                          trailing: IconButton(
                            icon: const Icon(Icons.delete_outline,
                                color: Colors.redAccent),
                            tooltip: 'Quitar este gol',
                            onPressed: () {
                              onRemove(g);
                              Navigator.pop(context);
                            },
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
