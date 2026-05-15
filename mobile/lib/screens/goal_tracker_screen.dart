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
  late Future<List<Player>> _futurePlayers;

  // playerId -> count
  final Map<int, int> _goals = {};
  // playerId -> teamId (para enviar al backend)
  final Map<int, int> _teamOf = {};

  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _futurePlayers = _service.fetchPlayers(widget.tournament.id);
  }

  int get _homeScore => _goals.entries
      .where((e) => _teamOf[e.key] == widget.match.home.id)
      .fold(0, (sum, e) => sum + e.value);

  int get _awayScore => _goals.entries
      .where((e) => _teamOf[e.key] == widget.match.away.id)
      .fold(0, (sum, e) => sum + e.value);

  void _adjust(Player p, int delta) {
    setState(() {
      final current = _goals[p.id] ?? 0;
      final next = current + delta;
      if (next <= 0) {
        _goals.remove(p.id);
      } else {
        _goals[p.id] = next;
        _teamOf[p.id] = p.teamId;
      }
    });
  }

  Future<void> _submit() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Enviar resultado'),
        content: Text(
          '${widget.match.home.name} $_homeScore - $_awayScore ${widget.match.away.name}\n\n'
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

      final goalsByPlayer = <int, Map<String, int>>{};
      _goals.forEach((pid, count) {
        goalsByPlayer[pid] = {'team_id': _teamOf[pid]!, 'count': count};
      });

      await _service.submitResult(
        matchId: widget.match.id,
        homeScore: _homeScore,
        awayScore: _awayScore,
        deviceLabel: deviceLabel,
        goalsByPlayer: goalsByPlayer,
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.match.home.name} vs ${widget.match.away.name}',
            overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 16)),
      ),
      body: FutureBuilder<List<Player>>(
        future: _futurePlayers,
        builder: (ctx, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) {
            return Center(child: Text('Error: ${snap.error}'));
          }
          final players = snap.data ?? [];
          final homePlayers = players.where((p) => p.teamId == widget.match.home.id).toList();
          final awayPlayers = players.where((p) => p.teamId == widget.match.away.id).toList();

          return Column(
            children: [
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
                        goals: _goals,
                        onAdjust: _adjust,
                      ),
                    ),
                    const VerticalDivider(width: 1),
                    Expanded(
                      child: _TeamColumn(
                        title: widget.match.away.name,
                        players: awayPlayers,
                        goals: _goals,
                        onAdjust: _adjust,
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
                            width: 18, height: 18,
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
        },
      ),
    );
  }
}

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
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 14)),
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
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 14)),
          ),
        ],
      ),
    );
  }
}

class _TeamColumn extends StatelessWidget {
  final String title;
  final List<Player> players;
  final Map<int, int> goals;
  final void Function(Player, int) onAdjust;
  const _TeamColumn({
    required this.title,
    required this.players,
    required this.goals,
    required this.onAdjust,
  });

  @override
  Widget build(BuildContext context) {
    if (players.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Text('Sin jugadores inscritos en $title',
              textAlign: TextAlign.center, style: const TextStyle(color: Colors.black54)),
        ),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: players.length,
      itemBuilder: (_, i) {
        final p = players[i];
        final count = goals[p.id] ?? 0;
        return InkWell(
          onTap: () => onAdjust(p, 1),
          onLongPress: () => onAdjust(p, -1),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
              color: count > 0 ? Colors.amber.shade50 : null,
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(p.name,
                      style: TextStyle(
                        fontWeight: count > 0 ? FontWeight.w900 : FontWeight.w600,
                        fontSize: 15,
                      )),
                ),
                _CounterBadge(
                  count: count,
                  onMinus: () => onAdjust(p, -1),
                  onPlus: () => onAdjust(p, 1),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _CounterBadge extends StatelessWidget {
  final int count;
  final VoidCallback onMinus;
  final VoidCallback onPlus;
  const _CounterBadge({required this.count, required this.onMinus, required this.onPlus});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          icon: const Icon(Icons.remove_circle_outline),
          color: Colors.redAccent,
          onPressed: count > 0 ? onMinus : null,
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
        ),
        Container(
          width: 36,
          alignment: Alignment.center,
          child: Text('$count',
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 18,
                color: count > 0 ? Theme.of(context).colorScheme.primary : Colors.grey,
              )),
        ),
        IconButton(
          icon: const Icon(Icons.add_circle),
          color: Colors.green,
          onPressed: onPlus,
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
        ),
      ],
    );
  }
}
