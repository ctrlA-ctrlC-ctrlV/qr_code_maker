/// Input type selection widget.
///
/// Renders a horizontal row of [ChoiceChip] widgets corresponding to each
/// supported [QrInputType]. Selection state is managed by the parent widget
/// and communicated via the [onTypeChanged] callback.
library;

import 'package:flutter/material.dart';
import '../models/types.dart';

/// Displays a segmented selector for QR code content types.
///
/// The currently selected type is visually emphasised. Tapping a chip
/// fires [onTypeChanged] with the new [QrInputType] value.
class InputTypeSelector extends StatelessWidget {
  /// Currently selected input type.
  final QrInputType selectedType;

  /// Callback invoked when the user taps a different type.
  final ValueChanged<QrInputType> onTypeChanged;

  const InputTypeSelector({
    super.key,
    required this.selectedType,
    required this.onTypeChanged,
  });

  /// Maps each [QrInputType] variant to a user-facing label.
  static const Map<QrInputType, String> _labels = {
    QrInputType.plainText: 'Text',
    QrInputType.url: 'URL',
    QrInputType.email: 'Email',
    QrInputType.phone: 'Phone',
    QrInputType.wifi: 'Wi-Fi',
  };

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: QrInputType.values.map((type) {
        return ChoiceChip(
          label: Text(_labels[type] ?? type.name),
          selected: selectedType == type,
          onSelected: (_) => onTypeChanged(type),
        );
      }).toList(),
    );
  }
}
