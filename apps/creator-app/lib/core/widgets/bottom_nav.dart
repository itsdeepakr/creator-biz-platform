import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class BottomNav extends ConsumerWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const BottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    const labels = ['Home', 'Discover', 'Messages', 'My Work', 'Profile'];
    const activeIcons = [
      Icons.home_rounded,
      Icons.explore_rounded,
      Icons.chat_bubble_rounded,
      Icons.work_rounded,
      Icons.person_rounded,
    ];
    const inactiveIcons = [
      Icons.home_outlined,
      Icons.explore_outlined,
      Icons.chat_bubble_outline_rounded,
      Icons.work_outline_rounded,
      Icons.person_outline_rounded,
    ];

    return BottomNavigationBar(
      currentIndex: currentIndex,
      onTap: onTap,
      type: BottomNavigationBarType.fixed,
      showSelectedLabels: true,
      showUnselectedLabels: true,
      selectedFontSize: 11,
      unselectedFontSize: 10,
      items: List.generate(labels.length, (i) {
        final isActive = i == currentIndex;
        return BottomNavigationBarItem(
          icon: Icon(isActive ? activeIcons[i] : inactiveIcons[i]),
          label: labels[i],
        );
      }),
    );
  }
}
