import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'core/navigation/app_navigator.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/auth/screens/register_screen.dart';
import 'features/auth/screens/business_kyc_screen.dart';
import 'features/campaigns/screens/create_campaign_wizard_screen.dart';
import 'features/payments/screens/payment_history_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const ProviderScope(
      child: CreatorBizBusinessApp(),
    ),
  );
}

class CreatorBizBusinessApp extends StatelessWidget {
  const CreatorBizBusinessApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CreatorBiz Brands',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const AppNavigator(),
      routes: {
        '/login': (_) => const LoginScreen(),
        '/register': (_) => const RegisterScreen(),
        '/kyc': (_) => const BusinessKycScreen(),
        '/home': (_) => const AppNavigator(),
        '/create-campaign': (_) => const CreateCampaignWizardScreen(),
        '/payment-history': (_) => const PaymentHistoryScreen(),
      },
    );
  }
}
