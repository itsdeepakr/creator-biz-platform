import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:creator_app/main.dart';

void main() {
  testWidgets('CreatorApp builds without errors', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: CreatorApp()));
    expect(find.byType(CreatorApp), findsOneWidget);
  });
}
