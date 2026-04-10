/// Customisation panel widget.
///
/// Provides controls for adjusting: QR code size (slider), error correction
/// level (dropdown), and foreground/background colours (colour wells).
/// All changes propagate via callbacks so the parent can rebuild the
/// QR code preview in real time.
library;

import 'package:flutter/material.dart';
import '../models/types.dart';

/// Renders customisation controls for the QR code visual properties.
class CustomisationPanel extends StatelessWidget {
  /// Current QR code size in logical pixels.
  final double size;

  /// Callback to update size.
  final ValueChanged<double> onSizeChanged;

  /// Current error correction level.
  final ErrorCorrectionLevel errorCorrectionLevel;

  /// Callback to update error correction level.
  final ValueChanged<ErrorCorrectionLevel> onErrorCorrectionChanged;

  /// Current foreground colour as an ARGB integer.
  final int foregroundColor;

  /// Callback to update foreground colour.
  final ValueChanged<int> onForegroundColorChanged;

  /// Current background colour as an ARGB integer.
  final int backgroundColor;

  /// Callback to update background colour.
  final ValueChanged<int> onBackgroundColorChanged;

  const CustomisationPanel({
    super.key,
    required this.size,
    required this.onSizeChanged,
    required this.errorCorrectionLevel,
    required this.onErrorCorrectionChanged,
    required this.foregroundColor,
    required this.onForegroundColorChanged,
    required this.backgroundColor,
    required this.onBackgroundColorChanged,
  });

  /// Labels for the error correction level dropdown.
  static const List<({ErrorCorrectionLevel level, String label})>
      _ecLabels = [
    (level: ErrorCorrectionLevel.low, label: 'Low (L) - ~7% recovery'),
    (level: ErrorCorrectionLevel.medium, label: 'Medium (M) - ~15% recovery'),
    (level: ErrorCorrectionLevel.quartile, label: 'Quartile (Q) - ~25% recovery'),
    (level: ErrorCorrectionLevel.high, label: 'High (H) - ~30% recovery'),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Customisation',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 12),

        /* ---- Size slider ---- */
        Text(
          'Size: ${size.round()}px',
          style: Theme.of(context).textTheme.bodySmall,
        ),
        Slider(
          value: size,
          min: QrDefaults.minSize,
          max: QrDefaults.maxSize,
          divisions: ((QrDefaults.maxSize - QrDefaults.minSize) / 16).round(),
          label: '${size.round()}px',
          onChanged: onSizeChanged,
        ),
        const SizedBox(height: 8),

        /* ---- Error correction dropdown ---- */
        DropdownButtonFormField<ErrorCorrectionLevel>(
          value: errorCorrectionLevel,
          decoration: const InputDecoration(
            labelText: 'Error Correction',
          ),
          items: _ecLabels
              .map(
                (e) => DropdownMenuItem(
                  value: e.level,
                  child: Text(e.label),
                ),
              )
              .toList(),
          onChanged: (v) {
            if (v != null) onErrorCorrectionChanged(v);
          },
        ),
        const SizedBox(height: 16),

        /* ---- Colour pickers ---- */
        Row(
          children: [
            Expanded(
              child: _ColorWell(
                label: 'Foreground',
                color: Color(foregroundColor),
                onColorChanged: (c) => onForegroundColorChanged(c.toARGB32()),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _ColorWell(
                label: 'Background',
                color: Color(backgroundColor),
                onColorChanged: (c) => onBackgroundColorChanged(c.toARGB32()),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

/// A simple colour well that opens a basic colour picker dialog.
///
/// Displays a circular swatch of the current [color] alongside a [label].
/// Tapping the swatch opens a dialog with a predefined palette.
class _ColorWell extends StatelessWidget {
  final String label;
  final Color color;
  final ValueChanged<Color> onColorChanged;

  const _ColorWell({
    required this.label,
    required this.color,
    required this.onColorChanged,
  });

  /// Predefined palette of common QR code colours.
  static const List<Color> _palette = [
    Color(0xFF000000),
    Color(0xFF1A1A2E),
    Color(0xFF0F3460),
    Color(0xFF16213E),
    Color(0xFF2196F3),
    Color(0xFF4CAF50),
    Color(0xFFF44336),
    Color(0xFFFF9800),
    Color(0xFF9C27B0),
    Color(0xFFFFFFFF),
    Color(0xFFF5F5F5),
    Color(0xFFE0E0E0),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 4),
        GestureDetector(
          onTap: () => _showColorPicker(context),
          child: Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: color,
              border: Border.all(color: Colors.grey.shade300),
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
      ],
    );
  }

  /// Opens a dialog displaying the predefined colour palette.
  void _showColorPicker(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: Text('Select $label Colour'),
          content: Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _palette.map((c) {
              return GestureDetector(
                onTap: () {
                  onColorChanged(c);
                  Navigator.of(ctx).pop();
                },
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: c,
                    border: Border.all(
                      color: c == color ? Colors.blue : Colors.grey.shade300,
                      width: c == color ? 3 : 1,
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              );
            }).toList(),
          ),
        );
      },
    );
  }
}
