import 'package:flutter/material.dart';
import '../models/submission.dart';
import '../services/staging_service.dart';

class SubmissionsHistoryScreen extends StatefulWidget {
  const SubmissionsHistoryScreen({super.key});

  @override
  State<SubmissionsHistoryScreen> createState() =>
      _SubmissionsHistoryScreenState();
}

class _SubmissionsHistoryScreenState extends State<SubmissionsHistoryScreen> {
  final _service = StagingService();
  String? _filter; // null = todos
  late Future<List<Submission>> _future;

  @override
  void initState() {
    super.initState();
    _future = _service.fetchSubmissions(status: _filter);
  }

  Future<void> _refresh() async {
    setState(() {
      _future = _service.fetchSubmissions(status: _filter);
    });
    await _future;
  }

  void _setFilter(String? s) {
    setState(() {
      _filter = s;
      _future = _service.fetchSubmissions(status: s);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mis envíos'),
        actions: [
          IconButton(onPressed: _refresh, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: Column(
        children: [
          _FilterBar(current: _filter, onChange: _setFilter),
          Expanded(
            child: FutureBuilder<List<Submission>>(
              future: _future,
              builder: (ctx, snap) {
                if (snap.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snap.hasError) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.error_outline,
                              size: 48, color: Colors.redAccent),
                          const SizedBox(height: 12),
                          Text(snap.error.toString(),
                              textAlign: TextAlign.center,
                              style: const TextStyle(fontSize: 12)),
                          const SizedBox(height: 16),
                          FilledButton(
                              onPressed: _refresh,
                              child: const Text('Reintentar')),
                        ],
                      ),
                    ),
                  );
                }
                final items = snap.data ?? [];
                if (items.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.inbox_outlined,
                              size: 56, color: Colors.grey.shade300),
                          const SizedBox(height: 12),
                          Text(
                            _filter == null
                                ? 'Todavía no enviaste ningún resultado.'
                                : 'No hay envíos con ese estado.',
                            style: TextStyle(color: Colors.grey.shade600),
                          ),
                        ],
                      ),
                    ),
                  );
                }
                return RefreshIndicator(
                  onRefresh: _refresh,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(12),
                    itemCount: items.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 8),
                    itemBuilder: (_, i) => _SubmissionCard(
                      sub: items[i],
                      onTap: () => _openDetail(items[i]),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _openDetail(Submission sub) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _SubmissionDetailSheet(sub: sub),
    );
  }
}

class _FilterBar extends StatelessWidget {
  final String? current;
  final void Function(String?) onChange;
  const _FilterBar({required this.current, required this.onChange});

  @override
  Widget build(BuildContext context) {
    Widget chip(String? value, String label) {
      final selected = current == value;
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4),
        child: ChoiceChip(
          label: Text(label),
          selected: selected,
          onSelected: (_) => onChange(value),
          selectedColor: Theme.of(context).colorScheme.primary,
          labelStyle: TextStyle(
            color: selected ? Colors.white : Colors.black87,
            fontWeight: FontWeight.w800,
            fontSize: 12,
          ),
          backgroundColor: Colors.grey.shade100,
          side: BorderSide(color: Colors.grey.shade300),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
        ),
      );
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            chip(null, 'Todos'),
            chip('pending', 'Pendientes'),
            chip('approved', 'Aprobados'),
            chip('rejected', 'Rechazados'),
          ],
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String status;
  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    final cfg = switch (status) {
      'approved' => (
          'Aprobado',
          Colors.green.shade100,
          Colors.green.shade800,
          Icons.check_circle
        ),
      'rejected' => (
          'Rechazado',
          Colors.red.shade100,
          Colors.red.shade800,
          Icons.cancel
        ),
      _ => (
          'Pendiente',
          Colors.amber.shade100,
          Colors.amber.shade900,
          Icons.schedule
        ),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: cfg.$2,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(cfg.$4, size: 12, color: cfg.$3),
          const SizedBox(width: 4),
          Text(cfg.$1,
              style: TextStyle(
                color: cfg.$3,
                fontWeight: FontWeight.w900,
                fontSize: 10,
                letterSpacing: 0.5,
              )),
        ],
      ),
    );
  }
}

String _fmtDateTime(DateTime? d) {
  if (d == null) return '—';
  final local = d.toLocal();
  String two(int n) => n.toString().padLeft(2, '0');
  return '${two(local.day)}/${two(local.month)} · ${two(local.hour)}:${two(local.minute)}';
}

class _SubmissionCard extends StatelessWidget {
  final Submission sub;
  final VoidCallback onTap;
  const _SubmissionCard({required this.sub, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final homeName = sub.match?.home.name ?? 'Local';
    final awayName = sub.match?.away.name ?? 'Visita';

    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey.shade200),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _StatusChip(status: sub.status),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      sub.match?.tournament?.name ?? '',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                          fontSize: 11,
                          color: Colors.grey.shade600,
                          fontWeight: FontWeight.w700),
                    ),
                  ),
                  Text(
                    _fmtDateTime(sub.createdAt),
                    style: TextStyle(
                        fontSize: 10,
                        color: Colors.grey.shade500,
                        fontWeight: FontWeight.w700),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      homeName,
                      textAlign: TextAlign.right,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          fontWeight: FontWeight.w900, fontSize: 14),
                    ),
                  ),
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 10),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '${sub.homeScore} - ${sub.awayScore}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 20,
                      ),
                    ),
                  ),
                  Expanded(
                    child: Text(
                      awayName,
                      textAlign: TextAlign.left,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          fontWeight: FontWeight.w900, fontSize: 14),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                '${sub.goals.length} ${sub.goals.length == 1 ? "gol" : "goles"} · toca para ver detalle',
                style: TextStyle(
                    fontSize: 11,
                    color: Colors.grey.shade500,
                    fontStyle: FontStyle.italic),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SubmissionDetailSheet extends StatelessWidget {
  final Submission sub;
  const _SubmissionDetailSheet({required this.sub});

  @override
  Widget build(BuildContext context) {
    final homeId = sub.match?.home.id;
    final homeGoals = sub.goals.where((g) => g.teamId == homeId).toList()
      ..sort(_sortByMinute);
    final awayGoals = sub.goals.where((g) => g.teamId != homeId).toList()
      ..sort(_sortByMinute);

    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      maxChildSize: 0.95,
      minChildSize: 0.4,
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
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      _StatusChip(status: sub.status),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          sub.match?.tournament?.name ?? '',
                          style: TextStyle(
                              fontWeight: FontWeight.w800,
                              color: Colors.grey.shade700,
                              fontSize: 12),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          sub.match?.home.name ?? 'Local',
                          textAlign: TextAlign.right,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                              fontWeight: FontWeight.w900, fontSize: 16),
                        ),
                      ),
                      Container(
                        margin: const EdgeInsets.symmetric(horizontal: 12),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.black,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '${sub.homeScore} - ${sub.awayScore}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                            fontSize: 24,
                          ),
                        ),
                      ),
                      Expanded(
                        child: Text(
                          sub.match?.away.name ?? 'Visita',
                          textAlign: TextAlign.left,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                              fontWeight: FontWeight.w900, fontSize: 16),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            if (sub.reviewNotes != null && sub.reviewNotes!.isNotEmpty)
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.amber.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.amber.shade200),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.sticky_note_2_outlined,
                        size: 16, color: Colors.amber.shade800),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(sub.reviewNotes!,
                          style: TextStyle(
                              fontSize: 12,
                              color: Colors.amber.shade900,
                              fontStyle: FontStyle.italic)),
                    ),
                  ],
                ),
              ),
            const Divider(height: 1),
            Expanded(
              child: ListView(
                controller: controller,
                padding: const EdgeInsets.all(12),
                children: [
                  _GoalSection(
                      title: sub.match?.home.name ?? 'Local', goals: homeGoals),
                  const SizedBox(height: 12),
                  _GoalSection(
                      title: sub.match?.away.name ?? 'Visita',
                      goals: awayGoals),
                  const SizedBox(height: 16),
                  Center(
                    child: Text(
                      'Enviado el ${_fmtDateTime(sub.createdAt)}'
                      '${sub.deviceLabel != null ? " · ${sub.deviceLabel}" : ""}',
                      style: TextStyle(
                          color: Colors.grey.shade500,
                          fontSize: 11,
                          fontStyle: FontStyle.italic),
                    ),
                  ),
                  if (sub.reviewedAt != null)
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          'Revisado el ${_fmtDateTime(sub.reviewedAt)}',
                          style: TextStyle(
                              color: Colors.grey.shade500,
                              fontSize: 11,
                              fontStyle: FontStyle.italic),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  int _sortByMinute(SubmissionGoal a, SubmissionGoal b) {
    if (a.minute == null && b.minute == null) return 0;
    if (a.minute == null) return 1;
    if (b.minute == null) return -1;
    return a.minute!.compareTo(b.minute!);
  }
}

class _GoalSection extends StatelessWidget {
  final String title;
  final List<SubmissionGoal> goals;
  const _GoalSection({required this.title, required this.goals});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
            ),
            child: Text(
              title,
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 12,
                color: Colors.grey.shade800,
                letterSpacing: 0.5,
              ),
            ),
          ),
          if (goals.isEmpty)
            Padding(
              padding: const EdgeInsets.all(12),
              child: Text(
                'Sin goles',
                style: TextStyle(
                    color: Colors.grey.shade400, fontStyle: FontStyle.italic),
              ),
            )
          else
            ...goals.map((g) => Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    border: Border(
                        bottom: BorderSide(color: Colors.grey.shade100)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        alignment: Alignment.center,
                        padding: const EdgeInsets.symmetric(vertical: 3),
                        decoration: BoxDecoration(
                          color: g.minute != null
                              ? Colors.black
                              : Colors.grey.shade300,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          g.minute != null ? "${g.minute}'" : '—',
                          style: TextStyle(
                            color: g.minute != null
                                ? Colors.white
                                : Colors.grey.shade600,
                            fontWeight: FontWeight.w900,
                            fontSize: 11,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          g.playerName,
                          style: const TextStyle(
                              fontWeight: FontWeight.w700, fontSize: 14),
                        ),
                      ),
                      if (g.count > 1)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.primary,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            '×${g.count}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                              fontSize: 11,
                            ),
                          ),
                        ),
                    ],
                  ),
                )),
        ],
      ),
    );
  }
}
