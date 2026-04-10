/// QR code preview widget.
///
/// Renders the generated QR code using [QrImageView] from the `qr_flutter`
/// package. Handles three display states: empty (no content), error (invalid
/// data), and ready (QR code visible).
library;

import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../models/types.dart';
import '../utils/qr_encoder.dart';

/// Displays the QR code preview within a card-like container.
///
/// When [data] is empty, a placeholder message is shown instead.
/// Error correction is mapped from the application's enum to the
/// integer value expected by `qr_flutter`.
class QrPreview extends StatelessWidget {
  /// The raw string data to encode in the QR code.
  final String data;

  /// Rendered size in logical pixels.
  final double size;

  /// Foreground (module) colour.
  final Color foregroundColor;

  /// Background colour.
  final Color backgroundColor;

  /// Error correction level.
  final ErrorCorrectionLevel errorCorrectionLevel;

  const QrPreview({
    super.key,
    required this.data,
    required this.size,
    required this.foregroundColor,
    required this.backgroundColor,
    required this.errorCorrectionLevel,
  });

  @override
  Widget build(BuildContext context) {
    /* Empty state: prompt the user to enter content. */
    if (data.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.qr_code_2,
              size: 48,
              color: Theme.of(context)
                  .colorScheme
                  .onSurfaceVariant
                  .withAlpha(128),
            ),
            const SizedBox(height: 12),
            Text(
              'Enter content to generate a QR code',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    /* QR code rendering state. */
    final ecLevel = mapErrorCorrectionLevel(errorCorrectionLevel);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Theme.of(context).colorScheme.outlineVariant,
        ),
      ),
      child: Center(
        child: QrImageView(
          data: data,
          version: QrVersions.auto,
          size: size.clamp(QrDefaults.minSize, QrDefaults.maxSize),
          errorCorrectionLevel: ecLevel,
          eyeStyle: QrEyeStyle(
            eyeShape: QrEyeShape.square,
            color: foregroundColor,
          ),
          dataModuleStyle: QrDataModuleStyle(
            dataModuleShape: QrDataModuleShape.square,
            color: foregroundColor,
          ),
          backgroundColor: backgroundColor,
          errorStateBuilder: (ctx, err) {
            return Center(
              child: Text(
                'Error generating QR code',
                style: TextStyle(
                  color: Theme.of(context).colorScheme.error,
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
