import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/home/screens/campaign_feed_screen.dart';
import '../../features/discover/screens/creator_discover_screen.dart';
import '../../features/chat/screens/chat_list_screen.dart';
import '../../features/work/screens/active_collaborations_screen.dart';
import '../../features/profile/screens/profile_screen.dart';

class AppNavigator extends ConsumerStatefulWidget {
  const AppNavigator({super.key});

  @override
  ConsumerState<AppNavigator> createState() => _AppNavigatorState();
}

class _AppNavigatorState extends ConsumerState<AppNavigator> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    CampaignFeedScreen(),
    CreatorDiscoverScreen(),
    ChatListScreen(),
    ActiveCollaborationsScreen(),
    ProfileScreen(),
  ];

  final List<String> _labels = const ['Home', 'Discover', 'Messages', 'My Work', 'Profile'];

  final List<IconData> _icons = const [
    Icons.home_rounded,
    Icons.explore_rounded,
    Icons.chat_rounded,
    Icons.work_rounded,
    Icons.person_rounded,
  ];

  final List<IconData> _activeIcons = const [
    Icons.home_rounded,
    Icons.explore_rounded,
    Icons.chat_bubble_rounded,
    Icons.work_rounded,
    Icons.person_rounded,
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
        selectedFontSize: 12,
        unselectedFontSize: 11,
        items: List.generate(_labels.length, (i) {
          final isActive = i == _currentIndex;
          return BottomNavigationBarItem(
            icon: Icon(
              isActive ? _activeIcons[i] : _icons[i],
              size: 26,
            ),
            label: _labels[i],
          );
        }),
      ),
    );
  }
}
