# All-Hands-UI-XP

A modern UI experience for All-Hands.

## Deployment to Vercel

This project is configured for easy deployment to Vercel. Follow these steps to deploy:

1. Fork or clone this repository to your GitHub account
2. Sign up for a [Vercel account](https://vercel.com/signup) if you don't have one
3. Import your GitHub repository in Vercel:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" > "Project"
   - Select your GitHub repository
   - Configure the project settings:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Click "Deploy"

Vercel will automatically deploy your application and provide you with a URL.

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

```bash
npm install
```

### Running locally

```bash
npm run dev
```

### Building for production

```bash
npm run build
```

## TypeScript Errors Fixed

The following TypeScript errors have been fixed in this project:

- Fixed missing ThemeElement import in UserSettings.tsx
- Removed duplicate style attribute in WavingHand.tsx
- Removed unused onClose prop from CanvasHeader interface and component
- Fixed Canvas component by removing theme prop from child components
- Fixed ChatArea component by updating theme type from string to Theme and adding theme prop to GitControls
- Added messagesEndRef to ChatThread.tsx
- Fixed GitControls component by removing unused theme prop from function parameters
- Fixed Message component usage in ChatArea.tsx to match the expected interface
- Removed unused imports from multiple components
- Fixed TopBar and LoadingScreen components by removing unused theme parameter