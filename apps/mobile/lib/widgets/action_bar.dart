/// Action bar widget for download and share operations.
///
/// Provides buttons for exporting the QR code as an image (PNG) and sharing
/// it via the platform share sheet using the `share_plus` and `screenshot`
/// packages. Actions are disabled when no valid QR code is available.
library;

import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

/// Renders grouped action buttons for saving and sharing the QR code.
///
/// [screenshotKey] must be a [GlobalKey] wrapping the widget to capture.
/// [hasQrCode] controls whether buttons are enabled.
class ActionBar extends StatelessWidget {
  /// Global key of the widget subtree to capture as an image.
  final GlobalKey screenshotKey;

  /// Whether a valid QR code is currently available.
  final bool hasQrCode;

  const ActionBar({
    super.key,
    required this.screenshotKey,
    required this.hasQrCode,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        /* Save button */
        Expanded(
          child: FilledButton.icon(
            onPressed: hasQrCode ? () => _saveImage(context) : null,
            icon: const Icon(Icons.download),
            label: const Text('Save PNG'),
          ),
        ),
        const SizedBox(width: 12),

        /* Share button */
        Expanded(
          child: OutlinedButton.icon(
            onPressed: hasQrCode ? () => _shareImage(context) : null,
            icon: const Icon(Icons.share),
            label: const Text('Share'),
          ),
        ),
      ],
    );
  }

  /// Captures the QR code widget as a PNG and saves it to the temporary
  /// directory, then notifies the user.
  Future<void> _saveImage(BuildContext context) async {
    final bytes = await _captureWidget();
    if (bytes == null) return;

    final dir = await getTemporaryDirectory();
    final file = File('${dir.path}/qr_code.png');
    await file.writeAsBytes(bytes);

    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('QR code saved successfully.')),
      );
    }
  }

  /// Captures the QR code widget as a PNG and opens the platform share sheet.
  Future<void> _shareImage(BuildContext context) async {
    final bytes = await _captureWidget();
    if (bytes == null) return;

    final dir = await getTemporaryDirectory();
    final file = File('${dir.path}/qr_code_share.png');
    await file.writeAsBytes(bytes);

    await Share.shareXFiles(
      [XFile(file.path)],
      text: 'QR Code generated with QR Code Maker by Zhaoxiang',
    );
  }

  /// Captures the render object behind [screenshotKey] as PNG bytes.
  ///
  /// Returns `null` if the boundary is not found or capture fails.
  Future<Uint8List?> _captureWidget() async {
    final boundary = screenshotKey.currentContext?.findRenderObject()
        as RenderRepaintBoundary?;
    if (boundary == null) return null;

    final image = await boundary.toImage(pixelRatio: 3.0);
    final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    return byteData?.buffer.asUint8List();
  }
}
