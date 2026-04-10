# QR Code Maker

A fast, efficient web and mobile application for generating QR codes locally in the browser/device. Built as a **pnpm monorepo**.

## Project Structure

```
qr_code_maker/
├── packages/
│   └── shared/              # Shared TypeScript types, enums, and constants
├── apps/
│   ├── web/                 # React + Vite web application
│   └── mobile/              # Flutter mobile/cross-platform application
├── pnpm-workspace.yaml
└── package.json
```

## Features

- **QR Code Generation** -- Encode plain text, URLs, email, phone, and Wi-Fi credentials entirely on the client side
- **Customisation** -- Adjust size, error correction level (L/M/Q/H), foreground and background colours
- **Download** -- Export in PNG, SVG, and JPEG formats
- **Sharing** -- Web Share API with fallback platform links (X, Facebook, LinkedIn, WhatsApp, Email)
- **Real-time Preview** -- QR code renders as the user types with debounced encoding
- **Responsive Design** -- Mobile-first two-column layout

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- Flutter >= 3.16 (for mobile app)

### Install Dependencies

```bash
pnpm install
```

### Development (Web)

```bash
pnpm dev
```

### Production Build (Web)

```bash
pnpm build
```

### Flutter Mobile

```bash
cd apps/mobile
flutter pub get
flutter run
```

## Architecture

| Layer | React (Web) | Flutter (Mobile) |
|-------|-------------|-----------------|
| **State** | `useQrConfig` hook (useReducer) | `StatefulWidget` with `QrCodeConfig` |
| **Encoding** | `qrcode` library | `qr_flutter` package |
| **Validation** | `validation.ts` | `validation.dart` |
| **Export** | Canvas + Blob API | `RenderRepaintBoundary` capture |
| **Sharing** | Web Share API + fallback URLs | `share_plus` package |

## Tech Stack

- **React 18** + TypeScript + Vite (web)
- **Flutter 3** + Dart (mobile)
- **pnpm Workspaces** (monorepo)
- **CSS Modules** (scoped styling)
- **qrcode** / **qr_flutter** (client-side QR generation)
