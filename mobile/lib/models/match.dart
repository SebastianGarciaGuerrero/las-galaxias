class TeamInfo {
  final int id;
  final String name;
  TeamInfo({required this.id, required this.name});
  factory TeamInfo.fromJson(Map<String, dynamic> j) =>
      TeamInfo(id: j['id'] as int, name: j['name']?.toString() ?? '—');
}

class MatchItem {
  final int id;
  final DateTime? matchDate;
  final int? round;
  final String? status;
  final TeamInfo home;
  final TeamInfo away;

  MatchItem({
    required this.id,
    required this.matchDate,
    required this.round,
    required this.status,
    required this.home,
    required this.away,
  });

  factory MatchItem.fromJson(Map<String, dynamic> j) => MatchItem(
        id: j['id'] as int,
        matchDate: j['match_date'] != null ? DateTime.tryParse(j['match_date'].toString()) : null,
        round: j['round'] is int ? j['round'] as int : null,
        status: j['status']?.toString(),
        home: TeamInfo.fromJson(j['home'] as Map<String, dynamic>),
        away: TeamInfo.fromJson(j['away'] as Map<String, dynamic>),
      );
}
