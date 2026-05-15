class Player {
  final int id;
  final String name;
  final int teamId;
  final String? teamName;

  Player({required this.id, required this.name, required this.teamId, this.teamName});

  factory Player.fromJson(Map<String, dynamic> j) => Player(
        id: j['id'] as int,
        name: j['name']?.toString() ?? 'Sin nombre',
        teamId: j['team_id'] as int,
        teamName: j['team_name']?.toString(),
      );
}
