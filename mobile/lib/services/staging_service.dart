import '../api/api_client.dart';
import '../models/tournament.dart';
import '../models/match.dart';
import '../models/player.dart';

class StagingService {
  final ApiClient _api = ApiClient();

  Future<List<Tournament>> fetchTournaments() async {
    final raw = await _api.getJsonList('/api/staging/tournaments');
    return raw.map((j) => Tournament.fromJson(j as Map<String, dynamic>)).toList();
  }

  Future<List<MatchItem>> fetchMatches(int tournamentId) async {
    final raw = await _api.getJsonList('/api/staging/tournaments/$tournamentId/matches');
    return raw.map((j) => MatchItem.fromJson(j as Map<String, dynamic>)).toList();
  }

  Future<List<Player>> fetchPlayers(int tournamentId) async {
    final raw = await _api.getJsonList('/api/staging/tournaments/$tournamentId/players');
    return raw.map((j) => Player.fromJson(j as Map<String, dynamic>)).toList();
  }

  /// goalsByPlayer: { playerId: { 'team_id': X, 'count': N } }
  Future<int> submitResult({
    required int matchId,
    required int homeScore,
    required int awayScore,
    required String deviceLabel,
    required Map<int, Map<String, int>> goalsByPlayer,
  }) async {
    final goals = goalsByPlayer.entries
        .where((e) => (e.value['count'] ?? 0) > 0)
        .map((e) => {
              'player_id': e.key,
              'team_id': e.value['team_id'],
              'count': e.value['count'],
            })
        .toList();

    final res = await _api.postJson('/api/staging/submissions', {
      'match_id': matchId,
      'home_score': homeScore,
      'away_score': awayScore,
      'device_label': deviceLabel,
      'goals': goals,
    });
    return res['id'] as int;
  }
}
