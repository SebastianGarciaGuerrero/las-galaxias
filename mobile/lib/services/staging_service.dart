import '../api/api_client.dart';
import '../models/tournament.dart';
import '../models/match.dart';
import '../models/player.dart';
import '../models/submission.dart';

/// Representa un jugador del pool global (de la tabla `players`),
/// no necesariamente inscrito todavía en un torneo/equipo.
class GlobalPlayer {
  final int id;
  final String name;
  GlobalPlayer({required this.id, required this.name});
  factory GlobalPlayer.fromJson(Map<String, dynamic> j) =>
      GlobalPlayer(id: j['id'] as int, name: j['name']?.toString() ?? '');
}

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

  /// Lista todos los jugadores del pool global (tabla `players`).
  /// Sirve para autocompletar cuando agregas alguien en cancha.
  Future<List<GlobalPlayer>> fetchAllGlobalPlayers() async {
    final raw = await _api.getJsonList('/api/league-admin/players');
    return raw.map((j) => GlobalPlayer.fromJson(j as Map<String, dynamic>)).toList();
  }

  /// Agrega un jugador a un equipo dentro de un torneo. El backend:
  ///   - si el nombre ya existe globalmente, reutiliza ese player_id
  ///   - si no, lo crea
  ///   - inserta en tournament_players (409 si ya estaba en ese equipo+torneo)
  Future<void> addPlayerToTeam({
    required String name,
    required int teamId,
    required int tournamentId,
  }) async {
    await _api.postJson('/api/league-admin/players', {
      'name': name,
      'team_id': teamId,
      'tournament_id': tournamentId,
    });
  }

  /// Lista los envíos previos hechos desde la app (los que el admin valida).
  /// Si `status` es null, devuelve todos.
  Future<List<Submission>> fetchSubmissions({String? status}) async {
    final qs = status != null ? '?status=$status' : '';
    final raw = await _api.getJsonList('/api/staging/submissions$qs');
    return raw.map((j) => Submission.fromJson(j as Map<String, dynamic>)).toList();
  }

  /// Envía un resultado pendiente. Cada gol es una fila individual:
  /// `{ player_id, team_id, minute? }`. Si el minuto es null, significa
  /// que el reloj no se usó.
  Future<int> submitResult({
    required int matchId,
    required int homeScore,
    required int awayScore,
    required String deviceLabel,
    required List<GoalEvent> goals,
  }) async {
    final payload = goals
        .map((g) => {
              'player_id': g.playerId,
              'team_id': g.teamId,
              'count': 1,
              if (g.minute != null) 'minute': g.minute,
            })
        .toList();

    final res = await _api.postJson('/api/staging/submissions', {
      'match_id': matchId,
      'home_score': homeScore,
      'away_score': awayScore,
      'device_label': deviceLabel,
      'goals': payload,
    });
    return res['id'] as int;
  }
}

/// Un gol individual con minuto opcional. Cada tap al + genera uno.
class GoalEvent {
  final int playerId;
  final int teamId;
  final String playerName;
  final int? minute;
  GoalEvent({
    required this.playerId,
    required this.teamId,
    required this.playerName,
    this.minute,
  });
}
