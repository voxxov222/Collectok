# CollecTok

AI-powered viral video discovery app with TikTok-style video grid, live streamer feeds, and a 3D project canvas for video manipulation.

## Project Overview

CollecTok helps users discover viral content using AI-driven recommendations, save videos for later, and organize them into creative projects on an interactive canvas.

### Key Features

1. **Discover Tab** - 3-column video grid with AI-curated viral content
2. **Live Tab** - Featured live streams and horizontal carousel of streamers
3. **Projects Tab** - Create and manage video projects with 3D canvas
4. **Profile Tab** - Stats, saved videos, favorites, and account settings
5. **Topic Selection** - Personalize feed with 6 topics during onboarding
6. **Guest Mode** - Try the app without creating an account

## Architecture

### Frontend (Expo/React Native)
- **Navigation**: React Navigation 7+ with auth flow
- **State Management**: Zustand with AsyncStorage persistence
- **Styling**: iOS 26 liquid glass design system
- **Data Fetching**: TanStack React Query

### Backend (Express)
- **Port**: 5000
- **Purpose**: API routes and data persistence

### File Structure
```
client/
├── App.tsx                    # App root with providers
├── contexts/
│   └── AuthContext.tsx        # Authentication state
├── lib/
│   ├── store.ts               # Zustand stores (feed, projects)
│   ├── types.ts               # TypeScript interfaces
│   └── query-client.ts        # React Query setup
├── navigation/
│   ├── RootStackNavigator.tsx # Auth + main navigation
│   └── MainTabNavigator.tsx   # Bottom tab navigation
├── screens/
│   ├── LoginScreen.tsx        # Auth options
│   ├── TopicSelectionScreen.tsx # Onboarding
│   ├── DiscoverScreen.tsx     # Video grid
│   ├── LiveScreen.tsx         # Live streams
│   ├── ProjectsScreen.tsx     # Project list
│   ├── ProfileScreen.tsx      # User profile
│   ├── VideoDetailScreen.tsx  # Full-screen video
│   └── ProjectCanvasScreen.tsx # 3D canvas
├── components/
│   ├── ErrorBoundary.tsx      # App crash handler
│   ├── ThemedText.tsx         # Theme-aware text
│   ├── ThemedView.tsx         # Theme-aware views
│   └── Card.tsx               # Elevated card component
└── constants/
    └── theme.ts               # CollecTok colors/spacing
```

## Design System

### Colors
- **Primary**: #FF0050 (CollecTok Red)
- **Secondary**: #00F2EA (Teal)
- **Background**: #000000 (Pure Black)
- **Card Background**: #1a1a1a

### Typography
- Headers: SF Pro Display Bold
- Body: SF Pro Text Regular

### Components
- Glass effect cards with iOS 26 blur
- Spring animations for interactions
- Bottom navigation with floating action button

## Navigation Flow

1. **Unauthenticated**: Login Screen
2. **Authenticated (not onboarded)**: Topic Selection
3. **Authenticated + Onboarded**: Main Tab Navigator
   - Discover (Home)
   - Live
   - Projects
   - Profile
   
### Modal Screens
- VideoDetail: Full-screen video viewer
- ProjectCanvas: 3D project editor

## State Management

### FeedStore (Zustand)
- `savedVideos`: Videos saved for later
- `favorites`: Favorited videos
- `pinnedVideos`: Pinned videos

### ProjectStore (Zustand)
- `projects`: User's video projects
- CRUD operations for projects

## Running the App

```bash
npm run all:dev
```

This starts:
- Expo dev server on port 8081
- Express API server on port 5000

## Testing on Device

Scan the QR code shown in the terminal with Expo Go app.

## Recent Changes

- Initial MVP implementation
- All screens and navigation complete
- Zustand state management with persistence
- iOS 26 liquid glass design system applied
