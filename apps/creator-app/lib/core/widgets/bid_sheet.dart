import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../theme/app_theme.dart';
import '../utils/helpers.dart';
import '../../providers/app_providers.dart';

class BidSheet extends ConsumerStatefulWidget {
  final String campaignId;
  final String campaignTitle;
  final double campaignBudget;
  final List<String> availableDeliverables;

  const BidSheet({
    super.key,
    required this.campaignId,
    required this.campaignTitle,
    required this.campaignBudget,
    required this.availableDeliverables,
  });

  static void show(
    BuildContext context, {
    required String campaignId,
    required String campaignTitle,
    required double campaignBudget,
    required List<String> availableDeliverables,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => BidSheet(
        campaignId: campaignId,
        campaignTitle: campaignTitle,
        campaignBudget: campaignBudget,
        availableDeliverables: availableDeliverables,
      ),
    );
  }

  @override
  ConsumerState<BidSheet> createState() => _BidSheetState();
}

class _BidSheetState extends ConsumerState<BidSheet> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _proposalController = TextEditingController();
  final _timelineController = TextEditingController();
  final Set<String> _selectedDeliverables = {};
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _amountController.text = widget.campaignBudget.toInt().toString();
    _selectedDeliverables.addAll(widget.availableDeliverables);
  }

  @override
  void dispose() {
    _amountController.dispose();
    _proposalController.dispose();
    _timelineController.dispose();
    super.dispose();
  }

  Future<void> _submitBid() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedDeliverables.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select at least one deliverable')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      await ref.read(campaignServiceProvider).placeBid(
            campaignId: widget.campaignId,
            amount: double.parse(_amountController.text),
            proposal: _proposalController.text.trim(),
            deliverables: _selectedDeliverables.toList(),
            estimatedTimeline: _timelineController.text.trim().isEmpty
                ? '7 days'
                : _timelineController.text.trim(),
          );

      ref.invalidate(myBidsProvider);

      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Row(
              children: [
                Icon(Icons.check_circle_rounded, color: Colors.white),
                SizedBox(width: 12),
                Expanded(child: Text('Pitch & bid submitted successfully!')),
              ],
            ),
            backgroundColor: AppTheme.successColor,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to submit bid: $e'),
            backgroundColor: AppTheme.errorColor,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.88,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                margin: const EdgeInsets.only(top: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.textTertiary,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Padding(
                padding: EdgeInsets.only(
                  left: 20,
                  right: 20,
                  top: 16,
                  bottom: 20 + MediaQuery.of(context).viewInsets.bottom,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Place Your Pitch & Bid',
                                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                      fontWeight: FontWeight.w700,
                                    ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                widget.campaignTitle,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: AppTheme.textSecondary,
                                    ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: AppTheme.successColor.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            'Budget: ${Helpers.formatCurrencyINR(widget.campaignBudget)}',
                            style: const TextStyle(
                              color: AppTheme.successColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),
                    Text(
                      'Your Proposed Bid Amount (INR) *',
                      style: Theme.of(context).textTheme.labelLarge,
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _amountController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(
                        hintText: 'Enter amount in INR',
                        prefixIcon: Icon(Icons.currency_rupee_rounded),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter a bid amount';
                        }
                        final amount = double.tryParse(value);
                        if (amount == null || amount <= 0) {
                          return 'Please enter a valid amount';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    Text(
                      'Select Committed Deliverables *',
                      style: Theme.of(context).textTheme.labelLarge,
                    ),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 8,
                      runSpacing: 6,
                      children: widget.availableDeliverables.map((deliverable) {
                        final isSelected = _selectedDeliverables.contains(deliverable);
                        return FilterChip(
                          label: Text(deliverable),
                          selected: isSelected,
                          onSelected: (selected) {
                            setState(() {
                              if (selected) {
                                _selectedDeliverables.add(deliverable);
                              } else {
                                _selectedDeliverables.remove(deliverable);
                              }
                            });
                          },
                          selectedColor: AppTheme.primaryLight.withOpacity(0.3),
                          checkmarkColor: AppTheme.primaryColor,
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      'Creator Pitch & Concept Proposal *',
                      style: Theme.of(context).textTheme.labelLarge,
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _proposalController,
                      maxLines: 4,
                      decoration: const InputDecoration(
                        hintText: 'Describe your creative hook, visual concept, and audience fit...',
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Please provide a proposal pitch';
                        }
                        if (value.trim().length < 10) {
                          return 'Pitch should be at least 10 characters';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    Text(
                      'Estimated Timeline',
                      style: Theme.of(context).textTheme.labelLarge,
                    ),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _timelineController,
                      decoration: const InputDecoration(
                        hintText: 'e.g. 5 days from receiving product sample',
                        prefixIcon: Icon(Icons.schedule_rounded),
                      ),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isSubmitting ? null : _submitBid,
                        child: _isSubmitting
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                ),
                              )
                            : const Text('Submit Pitch & Bid'),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
