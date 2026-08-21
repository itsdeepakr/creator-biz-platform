import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/campaigns/screens/campaign_list_screen.dart';
import '../../features/discover/screens/creator_search_screen.dart';
import '../../features/collaborations/screens/collaborations_list_screen.dart';
import '../../features/chat/screens/chat_list_screen.dart';
import '../../features/profile/screens/business_profile_screen.dart';

class AppNavigator extends ConsumerStatefulWidget {
  const AppNavigator({super.key});

  @override
  ConsumerState<AppNavigator> createState() => _AppNavigatorState();
}

class _AppNavigatorState extends ConsumerState<AppNavigator> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    CampaignListScreen(),
    CreatorSearchScreen(),
    CollaborationsListScreen(),
    ChatListScreen(),
    BusinessProfileScreen(),
  ];

  final List<String> _labels = const [
    'Campaigns',
    'Find Creators',
    'Deals',
    'Messages',
    'Company',
  ];

  final List<IconData> _icons = const [
    Icons.campaign_outlined,
    Icons.person_search_outlined,
    Icons.handshake_outlined,
    Icons.chat_bubble_outline_rounded,
    Icons.business_outlined,
  ];

  final List<IconData> _activeIcons = const [
    Icons.campaign_rounded,
    Icons.person_search_rounded,
    Icons.handshake_rounded,
    Icons.chat_bubble_rounded,
    Icons.business_rounded,
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        showSelectedLabels: true,
        showUnselectedLabels: true,
        selectedFontSize: 11,
        unselectedFontSize: 10,
        items: List.generate(_labels.length, (i) {
          final isActive = i == _currentIndex;
          return BottomNavigationBarItem(
            icon: Icon(isActive ? _activeIcons[i] : _icons[i], size: 24),
            label: _labels[i],
          );
        }),
      ),
    );
  }
}
