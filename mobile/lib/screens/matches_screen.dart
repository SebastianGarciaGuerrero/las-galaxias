import 'package:flutter/material.dart';
import '../models/tournament.dart';
import '../models/match.dart';
import '../services/staging_service.dart';
import 'goal_tracker_screen.dart';

class MatchesScreen extends StatefulWidget {
  final Tournament tournament;
  const MatchesScreen({super.key, required this.tournament});

  @override
  State<MatchesScreen> createState() => _MatchesScreenState();
}

class _MatchesScreenState extends State<MatchesScreen> {
  final _service = StagingService();
  late Future<List<MatchItem>> _future;

  @override
  void initState() {
    super.initState();
    _future = _service.fetchMatches(widget.tournament.id);
  }

  Future<void> _refresh() async {
    setState(() => _future = _service.fetchMatches(widget.tournament.id));
    await _future;
  }

  String _fmtTime(DateTime? d) {
    if (d == null) return '—';
    final local = d.toLocal();
    final hh = local.hour.toString().padLeft(2, '0');
    final mm = local.minute.toString().padLeft(2, '0');
    final dd = local.day.toString().padLeft(2, '0');
    final mo = local.month.toString().padLeft(2, '0');
    return '$dd/$mo · $hh:$mm';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.tournament.name, overflow: TextOverflow.ellipsis),
        actions: [
          IconButton(onPressed: _refresh, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: FutureBuilder<List<MatchItem>>(
        future: _future,
        builder: (ctx, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) {
            return Center(child: Text('Error: ${snap.error}'));
          }
          final all = snap.data ?? [];
          if (all.isEmpty) {
            return const Center(child: Text('Sin partidos programados.'));
          }

          // Agrupar por jornada
          final byRound = <int, List<MatchItem>>{};
          for (final m in all) {
            final r = m.round ?? 0;
            byRound.putIfAbsent(r, () => []).add(m);
          }
          final sortedRounds = byRound.keys.toList()..sort();

          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                for (final r in sortedRounds) ...[
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.primary,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            r == 0 ? 'Sin jornada' : 'Jornada $r',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  for (final m in byRound[r]!) _matchTile(m),
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _matchTile(MatchItem m) {
    final isFinished = m.status == 'finished';
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(
        side: BorderSide(color: isFinished ? Colors.green.shade300 : const Color(0xFFE2E8F0)),
        borderRadius: BorderRadius.circular(14),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () async {
          final saved = await Navigator.push<bool>(
            context,
            MaterialPageRoute(
              builder: (_) => GoalTrackerScreen(
                tournament: widget.tournament,
                match: m,
              ),
            ),
          );
          if (saved == true) _refresh();
        },
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                width: 70,
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  children: [
                    Text(_fmtTime(m.matchDate),
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: Colors.black54,
                        ),
                        textAlign: TextAlign.center),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(m.home.name,
                        style: const TextStyle(fontWeight: FontWeight.w800)),
                    const SizedBox(height: 4),
                    Text(m.away.name,
                        style: const TextStyle(fontWeight: FontWeight.w800)),
                  ],
                ),
              ),
              if (isFinished)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text('FINALIZADO',
                      style: TextStyle(
                        fontSize: 10,
                        color: Colors.green,
                        fontWeight: FontWeight.w900,
                      )),
                )
              else
                const Icon(Icons.chevron_right),
            ],
          ),
        ),
      ),
    );
  }
}
