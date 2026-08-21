import 'package:intl/intl.dart';
import 'package:flutter/services.dart';
import '../theme/app_theme.dart';

class Helpers {
  static String formatCurrency(double amount) {
    final formatter = NumberFormat.currency(
      symbol: '\$',
      decimalDigits: 2,
    );
    return formatter.format(amount);
  }

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

  static String formatNumber(int number) {
    final formatter = NumberFormat('#,###');
    return formatter.format(number);
  }

  static Future<void> copyToClipboard(String text) async {
    await Clipboard.setData(ClipboardData(text: text));
  }

  static bool isValidEmail(String email) {
    final regex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    return regex.hasMatch(email);
  }

  static bool isValidPhone(String phone) {
    final regex = RegExp(r'^\+?[1-9]\d{9,14}$');
    return regex.hasMatch(phone.replaceAll(RegExp(r'[\s-]'), ''));
  }

  static String maskPhone(String phone) {
    if (phone.length <= 4) return phone;
    final visible = phone.substring(phone.length - 4);
    return '••••$visible';
  }

  static String maskEmail(String email) {
    final parts = email.split('@');
    if (parts.length != 2) return email;
    final name = parts[0];
    final masked = name.length <= 2
        ? '${name[0]}•'
        : '${name.substring(0, 2)}${'•' * (name.length - 2)}';
    return '$masked@${parts[1]}';
  }

  static Color getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
      case 'APPROVED':
      case 'COMPLETED':
      case 'SUCCESS':
      case 'VERIFIED':
        return AppTheme.successColor;
      case 'PENDING':
      case 'IN_PROGRESS':
      case 'PROCESSING':
      case 'SUBMITTED':
      case 'COUNTERED':
      case 'REVISION_REQUESTED':
        return AppTheme.warningColor;
      case 'REJECTED':
      case 'CANCELLED':
      case 'FAILED':
      case 'DISPUTED':
      case 'ERROR':
        return AppTheme.errorColor;
      case 'DRAFT':
      case 'CLOSED':
        return AppTheme.textTertiary;
      default:
        return AppTheme.infoColor;
    }
  }

  static String getFileExtension(String fileName) {
    final parts = fileName.split('.');
    if (parts.length > 1) return parts.last.toUpperCase();
    return 'FILE';
  }

  static bool isImageFile(String fileName) {
    final ext = getFileExtension(fileName).toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].contains(ext);
  }
}
