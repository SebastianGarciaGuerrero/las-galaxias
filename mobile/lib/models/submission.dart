class SubmissionGoal {
  final int playerId;
  final String playerName;
  final int teamId;
  final String teamName;
  final int count;
  final int? minute;

  SubmissionGoal({
    required this.playerId,
    required this.playerName,
    required this.teamId,
    required this.teamName,
    required this.count,
    this.minute,
  });

  factory SubmissionGoal.fromJson(Map<String, dynamic> j) => SubmissionGoal(
        playerId: j['player_id'] as int,
        playerName: j['player_name']?.toString() ?? '—',
        teamId: j['team_id'] as int,
        teamName: j['team_name']?.toString() ?? '',
        count: (j['count'] as num?)?.toInt() ?? 1,
        minute: (j['minute'] as num?)?.toInt(),
      );
}

class SubmissionTeam {
  final int id;
  final String name;
  SubmissionTeam({required this.id, required this.name});
  factory SubmissionTeam.fromJson(Map<String, dynamic> j) => SubmissionTeam(
        id: j['id'] as int,
        name: j['name']?.toString() ?? '—',
      );
}

class SubmissionTournament {
  final int id;
  final String name;
  final String? season;
  SubmissionTournament({required this.id, required this.name, this.season});
  factory SubmissionTournament.fromJson(Map<String, dynamic> j) =>
      SubmissionTournament(
        id: j['id'] as int,
        name: j['name']?.toString() ?? '—',
        season: j['season']?.toString(),
      );
}

class SubmissionMatchInfo {
  final int? round;
  final DateTime? matchDate;
  final SubmissionTeam home;
  final SubmissionTeam away;
  final SubmissionTournament? tournament;

  SubmissionMatchInfo({
    required this.round,
    required this.matchDate,
    required this.home,
    required this.away,
    required this.tournament,
  });

  factory SubmissionMatchInfo.fromJson(Map<String, dynamic> j) =>
      SubmissionMatchInfo(
        round: (j['round'] as num?)?.toInt(),
        matchDate: j['match_date'] != null
            ? DateTime.tryParse(j['match_date'].toString())
            : null,
        home: SubmissionTeam.fromJson(j['home'] as Map<String, dynamic>),
        away: SubmissionTeam.fromJson(j['away'] as Map<String, dynamic>),
        tournament: j['tournament'] != null
            ? SubmissionTournament.fromJson(j['tournament'] as Map<String, dynamic>)
            : null,
      );
}

class Submission {
  final int id;
  final int homeScore;
  final int awayScore;
  final String? deviceLabel;
  final String status; // pending | approved | rejected
  final DateTime? createdAt;
  final DateTime? reviewedAt;
  final String? reviewNotes;
  final SubmissionMatchInfo? match;
  final List<SubmissionGoal> goals;

  Submission({
    required this.id,
    required this.homeScore,
    required this.awayScore,
    required this.deviceLabel,
    required this.status,
    required this.createdAt,
    required this.reviewedAt,
    required this.reviewNotes,
    required this.match,
    required this.goals,
  });

  factory Submission.fromJson(Map<String, dynamic> j) => Submission(
        id: j['id'] as int,
        homeScore: (j['home_score'] as num?)?.toInt() ?? 0,
        awayScore: (j['away_score'] as num?)?.toInt() ?? 0,
        deviceLabel: j['device_label']?.toString(),
        status: j['status']?.toString() ?? 'pending',
        createdAt: j['created_at'] != null
            ? DateTime.tryParse(j['created_at'].toString())
            : null,
        reviewedAt: j['reviewed_at'] != null
            ? DateTime.tryParse(j['reviewed_at'].toString())
            : null,
        reviewNotes: j['review_notes']?.toString(),
        match: j['match'] != null
            ? SubmissionMatchInfo.fromJson(j['match'] as Map<String, dynamic>)
            : null,
        goals: ((j['goals'] as List?) ?? const [])
            .map((g) => SubmissionGoal.fromJson(g as Map<String, dynamic>))
            .toList(),
      );
}
