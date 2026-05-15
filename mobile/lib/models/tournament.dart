class Tournament {
  final int id;
  final String name;
  final String? season;
  final String? category;

  Tournament({required this.id, required this.name, this.season, this.category});

  factory Tournament.fromJson(Map<String, dynamic> j) => Tournament(
        id: j['id'] as int,
        name: j['name']?.toString() ?? 'Sin nombre',
        season: j['season']?.toString(),
        category: j['category']?.toString(),
      );
}
