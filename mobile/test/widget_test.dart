import 'package:flutter_test/flutter_test.dart';

import 'package:las_galaxias_marcador/main.dart';

void main() {
  testWidgets('App boots without crash', (WidgetTester tester) async {
    await tester.pumpWidget(const LasGalaxiasMarcadorApp());
  });
}
