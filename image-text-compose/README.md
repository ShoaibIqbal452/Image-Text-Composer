# Image Text Composer

A modern, professional web application for creating beautiful text overlays on images. Built with Next.js, TypeScript, and Fabric.js for high-quality image composition with advanced typography controls.

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Setup and Run

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd image-text-compose
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Docker Setup (Optional)

For containerized development and production:

```bash
# Development with hot reload
./run.sh dev

# Production build
./run.sh prod

# View logs
./run.sh logs

# Stop containers
./run.sh stop
```

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React UI      │    │   Zustand Store  │    │   Fabric.js     │
│   Components    │◄──►│   State Mgmt     │◄──►│   Canvas API    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js       │    │   LocalStorage   │    │   Google Fonts  │
│   Framework     │    │   Persistence    │    │   API           │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Component Structure

- **ImageUploader**: Background image upload and processing
- **Canvas**: Core Fabric.js integration for text rendering and manipulation
- **LayerPanel**: Sidebar for layer management (add, delete, reorder, lock)
- **TextControls**: Typography controls (font, size, color, shadows, spacing)
- **HistoryPanel**: Undo/redo timeline with visual history
- **FontManagement**: Custom font upload and Google Fonts integration
- **ErrorBoundary**: Global error handling with user-friendly fallbacks
- **Toast System**: User feedback for actions and errors

### State Management

- **Zustand**: Lightweight state management with persistence
- **Editor Store**: Canvas state, text layers, selections
- **History Store**: Undo/redo functionality with 20+ steps
- **Font Store**: Custom font management and loading
- **LocalStorage**: Automatic state persistence across sessions

## Technology Choices and Trade-offs

### Core Technologies

| Technology | Choice | Trade-offs |
|------------|--------|------------|
| **Framework** | Next.js 15 | SSR, optimization, deployment ease
| **Canvas Library** | Fabric.js v6 | Rich text features, transformations
| **State Management** | Zustand | Lightweight, TypeScript-first<br>Less ecosystem than Redux |
| **Styling** | TailwindCSS | Rapid development, consistency<br>Large HTML classes |
| **Font Loading** | Google Fonts API + WebFontLoader | 1000+ fonts, reliable CDN<br>External dependency |

### Architecture Decisions

**1. Canvas vs SVG vs DOM**
- **Chosen**: Fabric.js (Canvas-based)
- **Why**: Superior text rendering, transformation handles, export quality
- **Trade-off**: More complex than DOM manipulation but much more powerful

**2. State Management**
- **Chosen**: Zustand over Redux/Context
- **Why**: Simpler API, better TypeScript support, smaller bundle
- **Trade-off**: Less mature ecosystem but sufficient for this use case

**3. Persistence Strategy**
- **Chosen**: LocalStorage with automatic serialization
- **Why**: No backend required, instant saves, works offline
- **Trade-off**: Limited storage size but adequate for text layers

**4. Font Management**
- **Chosen**: Hybrid approach (Google Fonts + Custom uploads)
- **Why**: Best of both worlds - variety + customization
- **Trade-off**: More complex implementation but better user experience

## Implemented Bonus Features

### Core Bonus Features
- **Custom Font Upload** - TTF/OTF/WOFF support with preview
- **Advanced Typography** - Line height, letter spacing, text shadows
- **Layer Management** - Lock/unlock, reorder, duplicate layers
- **Smart Spacing** - Auto-distribute layers with visual guides
- **Keyboard Shortcuts** - Arrow nudging, Ctrl+E spacing
- **Multi-selection** - Ctrl+click, Shift+click range selection
- **Visible History** - 20+ step undo/redo with timeline
- **Error Boundaries** - Graceful error handling
- **Toast Notifications** - User feedback system

### Technical Bonus Features
- **Docker Support** - Full containerization with dev/prod configs
- **TypeScript** - Full type safety throughout
- **Performance Optimization** - Code splitting, lazy loading
- **Accessibility** - Keyboard navigation, ARIA labels
- **SEO Ready** - Next.js SSR optimization
- **Production Ready** - Error handling, logging, monitoring

### UX Enhancements
- **Real-time Preview** - Instant visual feedback
- **Professional UI** - Clean, modern interface
- **Drag & Drop** - Intuitive file uploads
- **Loading States** - Progress indicators
- **Validation** - File type/size checking
- **Auto-save** - Persistent state across sessions

## Known Limitations

### Technical Limitations
1. **Browser Compatibility**
   - Requires modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
   - Canvas API and ES6+ features required

2. **Performance Constraints**
   - Large images (>4K) may cause slower rendering
   - Many text layers (50+) can impact performance
   - Custom fonts increase memory usage

3. **File Format Support**
   - Export limited to PNG format only
   - Background images: PNG support only
   - Custom fonts: No WOFF2 support yet

### Functional Limitations
1. **Text Features**
   - No curved/path text (complex to implement with Fabric.js)
   - Limited text effects (no gradients, patterns)
   - No text rotation beyond basic angle adjustment

2. **Layer Features**
   - No layer groups or folders
   - No blend modes between layers
   - No layer effects (drop shadow on layer, not text)

### Design Limitations

1. **Collaboration**
   - Single-user application
   - No real-time collaboration features
   - No sharing/commenting system

### Scalability Considerations
1. **Storage**
   - LocalStorage has ~5-10MB limit
   - No cloud storage integration
   - Custom fonts stored in browser memory

2. **Performance**
   - Client-side only processing
   - No server-side image optimization
   - Memory usage grows with complexity

## Deployment

### Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically with minimal to no configuration

### Docker
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Build
```bash
npm run build
npm start
```

## License

This project is built for educational and portfolio purposes.

## Contributing

This is a portfolio project, but feedback and suggestions are welcome!
