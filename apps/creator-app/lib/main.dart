import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'core/navigation/app_navigator.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/auth/screens/register_screen.dart';
import 'features/auth/screens/otp_verification_screen.dart';
import 'features/auth/screens/kyc_screen.dart';
import 'features/bids/screens/my_bids_screen.dart';
import 'features/wallet/screens/wallet_screen.dart';
import 'features/portfolio/screens/portfolio_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: CreatorApp()));
}

class CreatorApp extends ConsumerWidget {
  const CreatorApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp(
      title: 'CreatorBiz - Creator Mobile App',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.light,
      home: const LoginScreen(),
      routes: {
        '/login': (context) => const LoginScreen(),
        '/register': (context) => const RegisterScreen(),
        '/otp-verification': (context) => const OtpVerificationScreen(),
        '/kyc': (context) => const KycScreen(),
        '/home': (context) => const AppNavigator(),
        '/my-bids': (context) => const MyBidsScreen(),
        '/wallet': (context) => const WalletScreen(),
        '/portfolio': (context) => const PortfolioScreen(),
      },
    );
  }
}
