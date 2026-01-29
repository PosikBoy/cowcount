# Frontend - Next.js Application

Next.js frontend with Material UI for the Cow Detection System.

## Features

- 🎨 Material UI v5 components
- 💅 SCSS Modules for styling
- 📱 Responsive design
- 🔄 Real-time image upload and detection
- 📊 History view with grid layout
- 🎯 Visual cow count representation (squares)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
# Скопируйте .env.example в .env.local
cp .env.example .env.local

# Отредактируйте .env.local и укажите URL вашего бэкенда
# По умолчанию: http://localhost:8000
```

3. Run development server:

```bash
npm run dev
```

4. Open browser:

```
http://localhost:3000
```

## Environment Variables

Создайте файл `.env.local` в корне проекта:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

Для продакшена используйте свой домен:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with theme
│   ├── page.tsx            # Main page with tabs
│   ├── theme.ts            # MUI theme configuration
│   └── globals.scss        # Global styles
└── components/
    ├── Recognition/
    │   ├── Recognition.tsx
    │   └── Recognition.module.scss
    └── History/
        ├── History.tsx
        └── History.module.scss
```

## Components

### Recognition Component

- File upload with preview
- Image recognition trigger
- Results display with cow squares
- Loading states and error handling

### History Component

- Grid layout of past recognitions
- Image thumbnails
- Date/time display
- Cow count visualization

## Styling

Uses SCSS Modules for component-scoped styles:

- `Recognition.module.scss` - Recognition page styles
- `History.module.scss` - History page styles
- `globals.scss` - Global application styles

## API Integration

Connects to backend API (configured via environment variables):

- `POST /detect` - Upload and detect cows in image
- `GET /detect/history` - Fetch detection history
- `GET /detect/{id}` - Get specific detection
- `DELETE /detect/{id}` - Delete detection
- `POST /video/analyze` - Analyze video file
- `GET /video/stream/{filename}` - Stream video
- `WS /stream/video` - Real-time video stream processing

## Build

```bash
# Production build
npm run build

# Start production server
npm run start
```

## Technologies

- Next.js 14 (App Router)
- React 18
- TypeScript
- Material UI v5
- SCSS
- Axios
