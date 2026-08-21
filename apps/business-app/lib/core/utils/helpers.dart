import 'package:intl/intl.dart';
import 'package:flutter/services.dart';
import '../theme/app_theme.dart';

class Helpers {
  static String formatCurrencyINR(double amount) {
    final formatter = NumberFormat.currency(
      symbol: '₹',
      decimalDigits: 0,
      locale: 'en_IN',
    );
    return formatter.format(amount);
  }

  static String formatDate(DateTime date) {
    final formatter = DateFormat('MMM dd, yyyy');
    return formatter.format(date);
  }

  static String formatDateTime(DateTime date) {
    final formatter = DateFormat('MMM dd, yyyy • hh:mm a');
    return formatter.format(date);
  }

  static String formatShortDate(DateTime date) {
    final formatter = DateFormat('dd MMM');
    return formatter.format(date);
  }

  static String getTimeAgo(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inSeconds < 60) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    if (diff.inDays < 30) return '${(diff.inDays / 7).floor()}w ago';
    return formatShortDate(date);
  }

  static String getFollowerCount(int count) {
    if (count >= 1000000) {
      return '${(count / 1000000).toStringAsFixed(1)}M';
    }
    if (count >= 1000) {
      return '${(count / 1000).toStringAsFixed(1)}K';
    }
    return count.toString();
  }

  static Future<void> copyToClipboard(String text) async {
    await Clipboard.setData(ClipboardData(text: text));
  }

  static Color getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
      case 'APPROVED':
      case 'COMPLETED':
      case 'SUCCESS':
      case 'VERIFIED':
      case 'ESCROW_FUNDED':
      case 'RESOLVED_BUSINESS':
      case 'RESOLVED_CREATOR':
        return AppTheme.successColor;
      case 'PENDING':
      case 'IN_PROGRESS':
      case 'PROCESSING':
      case 'SUBMITTED':
      case 'COUNTERED':
      case 'REVISION_REQUESTED':
      case 'UNDER_REVIEW':
        return AppTheme.warningColor;
      case 'REJECTED':
      case 'CANCELLED':
      case 'FAILED':
      case 'DISPUTED':
      case 'OPEN':
      case 'ERROR':
        return AppTheme.errorColor;
      case 'DRAFT':
      case 'CLOSED':
        return AppTheme.textTertiary;
      default:
        return AppTheme.infoColor;
    }
  }
}
