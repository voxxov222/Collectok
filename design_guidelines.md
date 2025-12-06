# CollecTok Design Guidelines

## Architecture Decisions

### Authentication
**Auth Required** - The app requires multi-provider authentication:
- **Primary SSO Providers**:
  - Google Sign-In (primary)
  - GitHub Sign-In
  - Apple Sign-In (iOS requirement)
- **Smart Wallet Integration**: Mock wallet connection flow for future blockchain integration
- **Auth Flow**:
  - Login/signup screen with provider buttons (large, branded)
  - Privacy policy & terms of service links at bottom
  - Skip to guest mode option (limited features - view only, no saves)
  - First-time users proceed to onboarding after successful auth
- **Account Management**:
  - Profile screen includes log out with confirmation
  - Settings > Account > Delete Account (double confirmation with warning about project loss)

### Navigation
**Tab Navigation (4 Tabs + Floating Action Button)**:
1. **Discover** (Home) - Main video grid feed
2. **Live** - Live streamer feeds
3. **[Floating Action Button]** - Create New Project (center position)
4. **Projects** - Saved projects and collections
5. **Profile** - User settings and saved content

**Modal Screens**:
- Video Detail Overlay (full-screen with gesture dismissal)
- Project Canvas (immersive 3D workspace, custom header)
- Topic Selection (onboarding)

## Screen Specifications

### 1. Onboarding - Topic Selection
- **Purpose**: Personalize content algorithm with 6 topic preferences
- **Layout**:
  - Custom transparent header with "Skip" button (top-right)
  - Full-screen scrollable view
  - Progress indicator: "Step 1 of 1" or "Choose 6 topics"
- **Content**:
  - Title: "What interests you?"
  - Subtitle: "Pick 6 topics to customize your feed"
  - Grid of 12+ topic cards (2 columns)
  - Each card: Icon + Label (e.g., Comedy, Sports, Music, Gaming, Tech, Lifestyle, Food, Travel, Fashion, Art, Fitness, Education)
  - Selected state: checkmark overlay + border highlight
  - Continue button (bottom, disabled until 6 selected)
- **Safe Area**: 
  - Top: insets.top + Spacing.xl
  - Bottom: insets.bottom + Spacing.xl

### 2. Discover Feed (Main Screen)
- **Purpose**: Browse trending viral videos in grid layout
- **Layout**:
  - Transparent header with "CollecTok" logo (centered), search icon (right)
  - Scrollable grid: 3 columns × infinite rows
  - Pull-to-refresh at top
  - Tab bar navigation at bottom
- **Components**:
  - Video thumbnail cards with gradient overlay
  - View count, creator name overlaid on bottom
  - Tap to open video detail overlay
  - Loading shimmer for new content
- **Safe Area**:
  - Top: headerHeight + Spacing.xl
  - Bottom: tabBarHeight + Spacing.xl

### 3. Live Streams Tab
- **Purpose**: Horizontal scrollable live streamer feeds
- **Layout**:
  - Standard navigation header: "Live Now" title
  - Horizontal scroll list of live stream cards
  - Large featured stream at top (if available)
- **Components**:
  - Live indicator badge (red dot + "LIVE")
  - Viewer count
  - Stream thumbnail with gradient
  - Creator avatar + name
- **Safe Area**:
  - Top: Spacing.xl
  - Bottom: tabBarHeight + Spacing.xl

### 4. Video Detail Overlay
- **Purpose**: Full-screen video playback with action menu
- **Layout**:
  - Native modal (gesture dismissal)
  - Overlay controls fade after 3s of inactivity
  - Header: Back button (top-left), Share/More (top-right)
  - Bottom action bar (persistent)
- **Components**:
  - Video player (full-screen, pinch-to-zoom)
  - Action buttons (floating at bottom-right):
    - Save Video (bookmark icon)
    - Pin to Project (pin icon)
    - Add to Favorites (heart icon)
  - Creator info bar at bottom-left
- **Safe Area**: Full-screen with floating elements
  - Action buttons: bottom: insets.bottom + Spacing.xl, right: Spacing.xl

### 5. Project Canvas (3D Environment)
- **Purpose**: Interactive workspace for video manipulation and composition
- **Layout**:
  - Custom dark header with "Project Name" (editable), Done (right), Close (left)
  - Full 3D canvas area
  - Bottom toolbar (always visible)
- **Components**:
  - **Bottom Toolbar Icons** (horizontal scroll):
    - Add Video (+)
    - Add Image
    - Playback controls (play/pause)
    - Speed selector (0.25x - 4x)
    - Transform tools (resize, rotate, perspective)
    - Timeline/duration slider
  - **Canvas Controls**:
    - Pinch/zoom gestures
    - Drag to reposition
    - Two-finger rotate
    - Vertical drag for perspective tilt
  - **Floating Export Button**: Share icon (top-right of canvas area)
    - Opens export modal: Save to Device, Share to Instagram, Facebook, YouTube, TikTok
- **Safe Area**:
  - Top: Spacing.xl
  - Bottom: insets.bottom + Spacing.xl
  - Toolbar fixed above safe area

### 6. Projects Tab
- **Purpose**: Manage saved projects and video collections
- **Layout**:
  - Standard header: "My Projects" title, filter icon (right)
  - Scrollable list/grid toggle
  - Empty state: Illustration + "Create your first project"
- **Components**:
  - Project cards with preview thumbnail (canvas screenshot)
  - Project name, last edited timestamp
  - Quick actions: Open, Duplicate, Delete (swipe-to-reveal)
- **Safe Area**:
  - Top: Spacing.xl
  - Bottom: tabBarHeight + Spacing.xl

### 7. Profile Tab
- **Purpose**: User account, settings, saved content
- **Layout**:
  - Transparent header with Settings gear icon (right)
  - Scrollable profile view
- **Components**:
  - User avatar (tap to change)
  - Display name (editable)
  - Stats row: Projects count, Saved Videos, Favorites
  - Sections:
    - My Content (tabs: Saved Videos, Favorites)
    - Account Settings
    - App Preferences (theme, notifications)
    - Support & About
- **Safe Area**:
  - Top: headerHeight + Spacing.xl
  - Bottom: tabBarHeight + Spacing.xl

## Design System

### Color Palette
- **Primary**: #FF0050 (vibrant pink, TikTok-inspired)
- **Secondary**: #00F2EA (electric cyan)
- **Background Dark**: #0A0A0A (near-black for video focus)
- **Background Light**: #FFFFFF
- **Surface**: #1C1C1E (dark card background)
- **Text Primary**: #FFFFFF
- **Text Secondary**: #8E8E93
- **Success**: #30D158
- **Warning**: #FFD60A
- **Error**: #FF453A
- **Live Indicator**: #FF3B30

### Typography
- **Heading 1**: 32px, Bold, Primary Color
- **Heading 2**: 24px, Semibold, White
- **Body Large**: 17px, Regular, White
- **Body**: 15px, Regular, Text Secondary
- **Caption**: 13px, Regular, Text Secondary
- **Button**: 16px, Semibold, White

### Spacing Scale
- xs: 4px, sm: 8px, md: 12px, lg: 16px, xl: 24px, 2xl: 32px, 3xl: 48px

### Component Specifications

**Video Grid Cards**:
- Aspect ratio: 9:16 (portrait)
- Border radius: 8px
- Gradient overlay: linear from transparent to rgba(0,0,0,0.7) at bottom
- Tap feedback: scale to 0.98

**Floating Action Button (Create Project)**:
- Size: 56x56px circular
- Primary gradient background
- Plus icon (white, 24px)
- Shadow: width: 0, height: 2, opacity: 0.10, radius: 2
- Tap feedback: scale to 0.95

**Tab Bar**:
- Height: 60px + bottom safe area
- Icons: Feather icons, 24px
- Active tint: Primary color
- Inactive tint: Text Secondary
- Labels: Caption size

**Action Buttons (Video Overlay)**:
- Size: 48x48px circular
- Semi-transparent background: rgba(28,28,30,0.8)
- Backdrop blur: 20px
- Icon: 24px white
- Vertical stack, 12px spacing
- Shadow: width: 0, height: 2, opacity: 0.10, radius: 2

**Project Canvas Toolbar**:
- Height: 72px
- Dark background: Surface color
- Icons: 28px, horizontal scroll
- Active tool: Primary color highlight
- Backdrop blur for glass effect

### Critical Assets
1. **CollecTok Logo**: Wordmark with play button icon integration (generate)
2. **Topic Icons**: 12 category icons matching aesthetic (Comedy mask, Sports ball, Music note, Game controller, Tech chip, Lifestyle home, Food fork/knife, Travel plane, Fashion hanger, Art palette, Fitness dumbbell, Education book)
3. **Empty States**: 
   - No projects illustration (3D canvas concept)
   - No saved videos (bookmark icon with stars)
4. **Profile Avatars**: 6 preset geometric/abstract avatars with vibrant gradients (user selectable)

### Accessibility
- Minimum touch target: 44x44px
- Color contrast ratio: 4.5:1 for text
- VoiceOver labels for all interactive elements
- Haptic feedback on important actions (save, pin, delete)
- Alternative to gesture-only controls (provide button alternatives)
- Video captions support in player
- Dark mode optimized (default dark theme)