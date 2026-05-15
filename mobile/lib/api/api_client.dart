import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

class ApiException implements Exception {
  final String message;
  ApiException(this.message);
  @override
  String toString() => message;
}

class ApiClient {
  Future<List<dynamic>> getJsonList(String path) async {
    final res = await http.get(Uri.parse('${AppConfig.apiUrl}$path'));
    if (res.statusCode >= 400) {
      throw ApiException('HTTP ${res.statusCode}: ${res.body}');
    }
    return jsonDecode(res.body) as List<dynamic>;
  }

  Future<Map<String, dynamic>> postJson(String path, Map<String, dynamic> body) async {
    final res = await http.post(
      Uri.parse('${AppConfig.apiUrl}$path'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
    if (res.statusCode >= 400) {
      String msg = 'HTTP ${res.statusCode}';
      try {
        final j = jsonDecode(res.body);
        if (j is Map && j['error'] != null) msg = j['error'].toString();
      } catch (_) {}
      throw ApiException(msg);
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }
}
