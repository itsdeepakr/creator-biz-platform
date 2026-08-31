import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:business_app/main.dart';

void main() {
  testWidgets('CreatorBizBusinessApp builds without errors', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: CreatorBizBusinessApp()));
    expect(find.byType(CreatorBizBusinessApp), findsOneWidget);
  });
}
