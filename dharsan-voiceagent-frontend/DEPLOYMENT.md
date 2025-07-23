# Voice Agent Frontend Deployment Guide

## 🚀 Vercel Deployment

### Prerequisites
- Node.js 18.17.1 or higher
- npm 10.8.2 or higher
- Vercel CLI (optional)

### Quick Deploy

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Fix dependency conflicts for Vercel deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Set build settings:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install --legacy-peer-deps`

### Environment Variables

Set these in your Vercel project settings:

```env
VITE_BACKEND_URL=https://your-backend-url.modal.run
VITE_WEBSOCKET_URL=wss://your-backend-url.modal.run/ws
VITE_CLOUD_STORAGE_URL=https://your-backend-url.modal.run/cloud
```

### Manual Deployment

1. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Deploy to Vercel**
   ```bash
   npx vercel --prod
   ```

### Troubleshooting

#### Peer Dependency Conflicts
If you encounter peer dependency conflicts:
```bash
npm install --legacy-peer-deps
```

#### Build Failures
1. Clear cache and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

2. Check TypeScript errors:
   ```bash
   npm run build
   ```

#### Platform-Specific Issues
- Remove platform-specific dependencies from package.json
- Use cross-platform alternatives

### Build Output
- **HTML**: `dist/index.html`
- **CSS**: `dist/assets/index-*.css`
- **JS**: `dist/assets/index-*.js`

### Performance
- Bundle size: ~263KB (70KB gzipped)
- CSS size: ~41KB (7KB gzipped)
- Build time: ~4 seconds

## 🔧 Development

### Local Development
```bash
npm run dev
```

### Testing
```bash
npm run test
npm run test:watch
```

### Linting
```bash
npm run lint
```

## 📁 Project Structure
```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

## 🌐 Backend Integration
- WebSocket connection for real-time communication
- REST API for cloud storage operations
- Audio streaming for TTS playback 