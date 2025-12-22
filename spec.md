# ZenRoom User & Room Admin Frontend — Specification

> **Purpose**: This document provides complete instructions for building a React-based **User & Room Admin Frontend** for the ZenRoom voice broadcast platform. This is a full website experience that includes marketing pages, user authentication, voice rooms, digital coin recharge, and room management features.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Design System & Theming](#2-design-system--theming)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Site Navigation & Layout](#5-site-navigation--layout)
6. [Pages & Components](#6-pages--components)
7. [Authentication Flow](#7-authentication-flow)
8. [Digital Coins & Recharge System](#8-digital-coins--recharge-system)
9. [API Reference](#9-api-reference)
10. [Socket.IO Events](#10-socketio-events)
11. [MediaSoup WebRTC Integration](#11-mediasoup-webrtc-integration)
12. [User Roles & Permissions](#12-user-roles--permissions)
13. [State Management](#13-state-management)
14. [Audio Handling](#14-audio-handling)
15. [Error Handling](#15-error-handling)
16. [Responsive Design](#16-responsive-design)
17. [Accessibility](#17-accessibility)
18. [Environment Variables](#18-environment-variables)
19. [Testing Strategy](#19-testing-strategy)

---

## 1. Overview

### What This Platform Is

**ZenRoom** is a full-featured voice chat platform website that allows users to connect with friends in fun voice chat rooms. The platform includes:

**Public Website Pages:**

- **Home Page**: Marketing landing page with hero section, features, and call-to-action
- **Voice Rooms**: Browse and join active voice broadcast rooms
- **About Us**: Company information and mission
- **Compliance**: Privacy policy, terms of service, community guidelines
- **Recharge**: Purchase digital coins for in-app purchases and gifting
- **Contact**: Contact form and company information

**User Features:**

- Browse active voice broadcast rooms with thumbnails and descriptions
- Join rooms as listeners (hear audio, see who's speaking)
- Request to speak in a room
- Cancel pending speak requests
- Stop speaking and return to listener mode
- Update their profile and display name
- Recharge digital coins via UPI/payment gateways
- Send and receive virtual gifts

**Room Admin Features (in their rooms):**

- See queue of pending speak requests
- Approve or reject speak requests
- Revoke speaking privileges from current speakers
- Ban users from the room
- Unban previously banned users
- View list of banned users

**Primary Admin Has Additional Privileges:**

- Speak without requesting (auto-approved)
- Cannot be banned or removed

### Platform Characteristics

- **Website-First**: Full website experience with marketing pages and user flows
- **Audio-only**: No video, only voice broadcast in rooms
- **Multi-speaker**: Up to 5 concurrent speakers per room
- **One-to-many**: Speakers broadcast to all listeners
- **Role-based**: Different UI for listeners vs. admins vs. speakers
- **Monetization**: Digital coin system for gifting and premium features

---

## 2. Design System & Theming

### Brand Identity

**Brand Name**: ZenRoom  
**Tagline**: "Connect With Friends In Fun Voice Chat Rooms!"  
**Logo**: A stylized voice waveform icon in gradient pink/coral colors

### Color Palette

| Role | Color | Hex Code | Usage |
|------|-------|----------|-------|
| **Primary** | Deep Purple | `#7C3AED` | Primary buttons, headers, active states |
| **Primary Dark** | Darker Purple | `#5B21B6` | Hover states, emphasis |
| **Primary Light** | Light Purple | `#A78BFA` | Subtle highlights |
| **Primary Muted** | Very Light Purple | `#EDE9FE` | Backgrounds, tags |
| **Accent** | Coral Pink | `#FF5C6C` | CTAs, live indicators, branding accents |
| **Accent Gradient Start** | Light Pink | `#FF8A8A` | Gradient buttons start |
| **Accent Gradient End** | Coral | `#FF5C6C` | Gradient buttons end |
| **Accent Light** | Soft Pink | `#FFE4E6` | Light backgrounds, highlights |
| **Accent Muted** | Very Light Pink | `#FFF5F5` | Section backgrounds |
| **Background** | Off-White | `#FAFAFA` | Page background |
| **Background Pink** | Light Pink Tint | `#FFF8F8` | Hero section, special sections |
| **Surface** | White | `#FFFFFF` | Cards, modals |
| **Surface Elevated** | Light Gray | `#F3F4F6` | Secondary surfaces |
| **Text Primary** | Dark Gray | `#1F2937` | Main text, headings |
| **Text Secondary** | Medium Gray | `#6B7280` | Secondary text, descriptions |
| **Text Muted** | Light Gray | `#9CA3AF` | Hints, timestamps, placeholders |
| **Success** | Green | `#10B981` | Approved, connected, online |
| **Warning** | Amber | `#F59E0B` | Pending, caution |
| **Error** | Red | `#EF4444` | Rejected, errors, bans |
| **Border** | Light Border | `#E5E7EB` | Dividers, card borders |
| **Speaking Glow** | Purple Glow | `rgba(124, 58, 237, 0.4)` | Active speaker indicator |

### Gradient Styles

```css
/* Primary CTA Button Gradient */
.btn-primary-gradient {
  background: linear-gradient(135deg, #FF8A8A 0%, #FF5C6C 100%);
  border-radius: 24px;
  color: white;
  font-weight: 600;
}

/* Hero Section Background */
.hero-bg {
  background: linear-gradient(180deg, #FFFFFF 0%, #FFF5F5 50%, #FFE4E6 100%);
}

/* Feature Icon Circle */
.feature-icon-circle {
  background: linear-gradient(135deg, #FFE4E6 0%, #FFF5F5 100%);
  border-radius: 50%;
}
```

### Live/Active Indicators

```css
/* Pulsing live indicator */
.live-pulse {
  animation: pulse 2s infinite;
  background: #FF5C6C;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

/* Speaking animation (audio wave) */
.speaking-wave {
  animation: wave 0.5s infinite alternate;
}

/* Online dot indicator */
.online-dot {
  width: 8px;
  height: 8px;
  background: #10B981;
  border-radius: 50%;
  animation: pulse-subtle 2s infinite;
}
```

### Typography

```css
/* Font Family */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-display: 'Poppins', 'Inter', sans-serif; /* For headings */

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px - timestamps, badges */
--text-sm: 0.875rem;   /* 14px - secondary text */
--text-base: 1rem;     /* 16px - body text */
--text-lg: 1.125rem;   /* 18px - card titles */
--text-xl: 1.25rem;    /* 20px - section headers */
--text-2xl: 1.5rem;    /* 24px - page titles */
--text-3xl: 1.875rem;  /* 30px - section headings */
--text-4xl: 2.25rem;   /* 36px - hero subtitle */
--text-5xl: 3rem;      /* 48px - hero headline */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Spacing & Sizing

```css
/* Spacing Scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */

/* Container Widths */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1440px;

/* Avatar Sizes */
--avatar-sm: 32px;
--avatar-md: 40px;
--avatar-lg: 56px;
--avatar-xl: 80px;
--avatar-2xl: 120px;

/* Room Card Image */
--room-thumb-sm: 80px;
--room-thumb-md: 120px;
--room-thumb-lg: 160px;

/* Border Radius */
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-3xl: 2rem;     /* 32px */
--radius-full: 9999px;  /* Pill/circle */
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
--shadow-card: 0 2px 8px rgba(0, 0, 0, 0.08);
--shadow-card-hover: 0 8px 24px rgba(0, 0, 0, 0.12);
--shadow-glow-purple: 0 0 20px rgba(124, 58, 237, 0.3);
--shadow-glow-pink: 0 0 20px rgba(255, 92, 108, 0.3);
```

### Design Principles

1. **Friendly & Welcoming**: Warm colors (pink/coral accents), rounded corners, playful imagery
2. **Clean & Modern**: Lots of white space, clear typography hierarchy
3. **Audio-First**: Prominent speaker indicators, audio wave visualizations in rooms
4. **Real-Time Feel**: Live badges, participant counts, pulsing indicators
5. **Mobile-First**: Touch-friendly targets (min 44px), responsive grid layouts
6. **Trust Signals**: SSL badges, secure payment indicators, verified marks
7. **Consistent Branding**: Coral pink accent throughout, purple for primary actions

---

## 3. Technology Stack

### Required Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "socket.io-client": "^4.7.2",
    "mediasoup-client": "^3.7.4",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "framer-motion": "^10.16.0",
    "@headlessui/react": "^1.7.0",
    "react-hot-toast": "^2.4.0",
    "embla-carousel-react": "^8.0.0",
    "react-intersection-observer": "^9.5.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

### Key Libraries

- **mediasoup-client**: WebRTC client for real-time audio
- **socket.io-client**: Real-time events and signaling
- **framer-motion**: Smooth animations for UI transitions
- **zustand**: Lightweight state management
- **react-query**: Server state caching
- **@headlessui/react**: Accessible UI primitives (modals, dropdowns)
- **embla-carousel-react**: Smooth carousels for features/testimonials
- **react-intersection-observer**: Scroll-triggered animations

---

## 4. Project Structure

```
src/
├── main.tsx                    # App entry point
├── App.tsx                     # Root component with router
├── index.css                   # Global styles + Tailwind
│
├── api/
│   ├── client.ts               # Axios instance
│   ├── auth.ts                 # Auth API calls
│   ├── rooms.ts                # Room API calls
│   ├── speakRequests.ts        # Speak request API calls
│   ├── roomBans.ts             # Ban management API calls
│   ├── recharge.ts             # Recharge/payment API calls
│   ├── gifts.ts                # Gift sending API calls
│   └── contact.ts              # Contact form API calls
│
├── socket/
│   ├── client.ts               # Socket.IO singleton
│   ├── events.ts               # Event type definitions
│   └── handlers.ts             # Event handler functions
│
├── mediasoup/
│   ├── client.ts               # MediaSoup device setup
│   ├── transport.ts            # Transport management
│   ├── producer.ts             # Audio producer (for speakers)
│   └── consumer.ts             # Audio consumers (for listeners)
│
├── components/
│   ├── ui/                     # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── Avatar.tsx
│   │   ├── Spinner.tsx
│   │   ├── Toast.tsx
│   │   ├── AudioWave.tsx
│   │   ├── Container.tsx
│   │   ├── Dropdown.tsx
│   │   └── CoinDisplay.tsx
│   │
│   ├── layout/
│   │   ├── RootLayout.tsx      # Main layout wrapper
│   │   ├── Header.tsx          # Site header with navigation
│   │   ├── Footer.tsx          # Site footer
│   │   ├── MobileNav.tsx       # Mobile hamburger menu
│   │   └── PageContainer.tsx
│   │
│   ├── home/
│   │   ├── HeroSection.tsx     # Hero with CTA
│   │   ├── FeaturesSection.tsx # Feature cards grid
│   │   ├── HowItWorks.tsx      # Step-by-step guide
│   │   ├── Testimonials.tsx    # User testimonials carousel
│   │   └── CTASection.tsx      # Final call-to-action
│   │
│   ├── room/
│   │   ├── RoomCard.tsx        # Room listing card
│   │   ├── RoomGrid.tsx        # Grid of room cards
│   │   ├── RoomHeader.tsx
│   │   ├── SpeakerCircle.tsx
│   │   ├── SpeakerGrid.tsx
│   │   ├── ListenerCount.tsx
│   │   ├── SpeakButton.tsx
│   │   ├── LeaveButton.tsx
│   │   └── AdminControls.tsx
│   │
│   ├── speaker/
│   │   ├── SpeakerAvatar.tsx
│   │   ├── SpeakingIndicator.tsx
│   │   └── MuteButton.tsx
│   │
│   ├── queue/
│   │   ├── RequestCard.tsx
│   │   ├── QueueList.tsx
│   │   └── ApproveRejectButtons.tsx
│   │
│   ├── recharge/
│   │   ├── CoinPackage.tsx     # Coin package selection card
│   │   ├── PackageGrid.tsx     # Grid of packages
│   │   ├── PaymentSummary.tsx  # Order summary panel
│   │   ├── PaymentMethods.tsx  # Payment method selection
│   │   └── CustomAmount.tsx    # Custom recharge input
│   │
│   ├── contact/
│   │   ├── ContactForm.tsx     # Contact form
│   │   └── CompanyInfo.tsx     # Company details sidebar
│   │
│   └── user/
│       ├── UserMenu.tsx
│       ├── ProfileForm.tsx
│       ├── UserAvatar.tsx
│       └── BalanceDisplay.tsx
│
├── pages/
│   ├── HomePage.tsx            # Marketing landing page
│   ├── VoiceRoomsPage.tsx      # Room browse/listing
│   ├── RoomPage.tsx            # Active room view
│   ├── AboutPage.tsx           # About us
│   ├── CompliancePage.tsx      # Privacy, Terms, Guidelines
│   ├── RechargePage.tsx        # Coin recharge
│   ├── ContactPage.tsx         # Contact form page
│   ├── LoginPage.tsx           # Phone + OTP login
│   ├── SignupPage.tsx          # Registration
│   ├── SetNamePage.tsx         # Display name setup
│   ├── ProfilePage.tsx         # User profile/settings
│   └── NotFoundPage.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── useSocket.ts
│   ├── useRoom.ts
│   ├── useMediasoup.ts
│   ├── useAudioLevel.ts
│   ├── useSpeakRequest.ts
│   ├── useBalance.ts
│   └── usePayment.ts
│
├── stores/
│   ├── authStore.ts
│   ├── roomStore.ts
│   ├── audioStore.ts
│   ├── balanceStore.ts
│   └── uiStore.ts
│
├── lib/
│   ├── utils.ts
│   ├── cn.ts
│   └── currency.ts
│
├── types/
│   ├── api.ts
│   ├── models.ts
│   ├── socket.ts
│   └── mediasoup.ts
│
└── constants/
    ├── routes.ts
    ├── coinPackages.ts
    └── navigation.ts
```

---

## 5. Site Navigation & Layout

### Header Component

The header is consistent across all pages:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  🎤 ZenRoom          Home    Voice    About Us    Compliance    Recharge        │
│                      ────                                                       │
│                    (active)                                                     │
│                                                                                 │
│                                            Balance: 🪙 3,450    [Sign up/Login] │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Header States:**

1. **Logged Out:**
   - Right side shows: `[Sign up/Login]` button (coral gradient)

2. **Logged In:**
   - Right side shows: `Balance: 🪙 3,450` and user avatar dropdown
   - Avatar dropdown contains: Profile, My Balance, Logout

3. **Mobile (< 768px):**
   - Logo on left, hamburger menu on right
   - Hamburger opens slide-out drawer with full navigation

### Navigation Links

| Link | Path | Description |
|------|------|-------------|
| Home | `/` | Landing page |
| Voice | `/voice` | Voice rooms listing |
| About Us | `/about` | Company information |
| Compliance | `/compliance` | Privacy, Terms, Guidelines |
| Recharge | `/recharge` | Coin purchase page |

### Footer Component

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  🎤 ZenRoom                                                                     │
│                                                                                 │
│  Voice    About Us    Policy    Contact                                         │
│                                                                                 │
│                                            [COMPANY NAME PRIVATE LIMITED]       │
│                                                                                 │
│  ────────────────────────────────────────────────────────────────────────────── │
│  © 2025 ZenRoom All Rights Reserved.                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Footer Links:**

| Section | Links |
|---------|-------|
| **Quick Links** | Voice, About Us, Policy, Contact |
| **Legal** | Privacy Policy, Terms of Service, Community Guidelines |
| **Social** | Instagram, Twitter, YouTube (icons) |

### Route Configuration

```typescript
// constants/routes.ts
export const ROUTES = {
  HOME: '/',
  VOICE: '/voice',
  ROOM: '/voice/:id',
  ABOUT: '/about',
  COMPLIANCE: '/compliance',
  COMPLIANCE_PRIVACY: '/compliance/privacy',
  COMPLIANCE_TERMS: '/compliance/terms',
  COMPLIANCE_GUIDELINES: '/compliance/guidelines',
  RECHARGE: '/recharge',
  CONTACT: '/contact',
  LOGIN: '/login',
  SIGNUP: '/signup',
  SET_NAME: '/set-name',
  PROFILE: '/profile',
} as const;
```

### Breadcrumbs

Show breadcrumbs on interior pages:

```
Home > Voice Room
Home > Recharge
Home > About Us
Home > Compliance > Privacy Policy
```

---

## 6. Pages & Components

### 6.1 Home Page (`/`)

The home page is the main marketing landing page that introduces ZenRoom to new visitors.

#### Hero Section

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [Header with navigation]                                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                                                     ┌───────────────────────┐   │
│   Connect With Friends In                           │                       │   │
│   Fun Voice Chat Rooms!                             │    🎤                 │   │
│                                                     │   [Woman singing      │   │
│   Experience Unique Conversations: Engage in        │    with microphone]   │   │
│   our dynamic voice chat rooms and expand           │                       │   │
│   your circle with intriguing people!               │    🌹 💐              │   │
│                                                     │                       │   │
│   ┌──────────────────────┐                          └───────────────────────┘   │
│   │    Connect Now  →    │  ← Coral gradient button                             │
│   └──────────────────────┘                                                      │
│                                                                                 │
│   (Pink gradient background radiating behind the image)                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Hero Section Specs:**

- **Headline**: Large, bold text (3xl/4xl on mobile, 5xl on desktop)
- **Subheadline**: Secondary text color, relaxed line height
- **CTA Button**: Coral gradient, rounded-full, shadow on hover
- **Hero Image**: Circular pink gradient behind main image, decorative elements (flowers, hearts, gifts)
- **Background**: Light pink gradient fade

#### Features Section

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│              Explore the Fun with ZenRoom!                                      │
│                                                                                 │
│   Unleashing Your Potential: Discover the Magic You Can Make on ZenRoom!        │
│                                                                                 │
│   ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐     │
│   │                     │  │                     │  │                     │     │
│   │    (🎤)             │  │    (🎁)             │  │    (👥)             │     │
│   │    pink circle      │  │    pink circle      │  │    pink circle      │     │
│   │                     │  │                     │  │                     │     │
│   │  Have Fun in        │  │  Explore to         │  │  Looking for        │     │
│   │  Party Room.        │  │  receive various    │  │  interesting        │     │
│   │                     │  │  gifts              │  │  friends.           │     │
│   │  Don't want to show │  │                     │  │                     │     │
│   │  your face? We      │  │  We have animated   │  │  Seeking Connections│     │
│   │  support audio-only │  │  gifts, festival    │  │  Use our platform   │     │
│   │  rooms...           │  │  gifts and daily    │  │  to find amazing    │     │
│   │                     │  │  gifts to share...  │  │  people who share   │     │
│   │                     │  │                     │  │  your interests...  │     │
│   └─────────────────────┘  └─────────────────────┘  └─────────────────────┘     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Features Grid Specs:**

- 3 columns on desktop, stacks on mobile
- Each feature card has:
  - Icon in a light pink circle (64x64px)
  - Bold title
  - Description text in secondary color
- White background with subtle shadow on cards

#### Feature Cards Content

| Icon | Title | Description |
|------|-------|-------------|
| 🎤 Voice waves | **Have Fun in Party Room** | Don't want to show your face? We support audio-only rooms where you can express yourself freely with just your voice! |
| 🎁 Gift box | **Explore to receive various gifts** | We have animated gifts, festival gifts, and daily gifts to share with your favorite hosts and friends! |
| 👥 People | **Looking for interesting friends** | Seeking Connections: Use our platform to find amazing people who share your interests and build lasting friendships! |

#### How It Works Section (Optional)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                        How It Works                                             │
│                                                                                 │
│        ①                    ②                    ③                              │
│   ┌─────────┐          ┌─────────┐          ┌─────────┐                         │
│   │  Sign   │   ──→    │  Join   │   ──→    │  Start  │                         │
│   │   Up    │          │  Room   │          │ Talking │                         │
│   └─────────┘          └─────────┘          └─────────┘                         │
│                                                                                 │
│   Create your          Browse active        Connect with                        │
│   account in           voice rooms          amazing people                      │
│   seconds              and jump in          right away                          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Call-to-Action Section

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   (Light pink background)                                                       │
│                                                                                 │
│              Ready to join the conversation?                                    │
│                                                                                 │
│              ┌──────────────────────┐                                           │
│              │   Get Started Free   │                                           │
│              └──────────────────────┘                                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 6.2 Voice Rooms Page (`/voice`)

The main room listing page where users browse and join active voice rooms.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [Header]                                                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Home > Voice Room                                      (Breadcrumb)            │
│                                                                                 │
│                           Voice Room                                            │
│                                                                                 │
│  ┌─────────────────────────────────────┐  ┌─────────────────────────────────────┐
│  │ ┌───────────┐                       │  │ ┌───────────┐                       │
│  │ │           │  JioSaavn 🎧      📊 0 │  │ │           │  Gujarati shows 🙏📊 0│
│  │ │  [Room    │                       │  │ │  [Room    │                       │
│  │ │   Image]  │  Listen to New &      │  │ │   Image]  │  The Upanishads       │
│  │ │           │  Old Indian &         │  │ │           │  Explained: Swami...  │
│  │ └───────────┘  English Songs        │  │ └───────────┘                       │
│  └─────────────────────────────────────┘  └─────────────────────────────────────┘
│                                                                                 │
│  ┌─────────────────────────────────────┐  ┌─────────────────────────────────────┐
│  │ ┌───────────┐                       │  │ ┌───────────┐                       │
│  │ │           │   Flip The Script 📝📊0│  │ │           │ Truth is Stranger  📊0│
│  │ │  [Room    │                       │  │ │  [Room    │ than Fiction 🔍       │
│  │ │   Image]  │  We speak to people   │  │ │   Image]  │                       │
│  │ │           │  who have taken risks │  │ │           │ Reveals the inside    │
│  │ └───────────┘  and f...             │  │ └───────────┘ story of some...      │
│  └─────────────────────────────────────┘  └─────────────────────────────────────┘
│                                                                                 │
│  ┌─────────────────────────────────────┐  ┌─────────────────────────────────────┐
│  │ ┌───────────┐                       │  │ ┌───────────┐                       │
│  │ │           │  Next Billion     📊 0│  │ │           │ Bhada Nu Makan 🎵     │
│  │ │  [Room    │  Innovations          │  │ │  [Room    │                  📊5014│
│  │ │   Image]  │                       │  │ │   Image]  │                       │
│  │ │           │                       │  │ │           │                       │
│  │ └───────────┘                       │  │ └───────────┘                       │
│  └─────────────────────────────────────┘  └─────────────────────────────────────┘
│                                                                                 │
│  [Load More...]                                                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
│ [Footer]                                                                        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Room Card Component

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌────────────┐                                                     │
│  │            │     Room Name 🎧                           📊 5014  │
│  │   [Room    │                                                     │
│  │   Image    │     Room description text goes here and can         │
│  │   120x120] │     be truncated with ellipsis if too long...       │
│  │            │                                                     │
│  └────────────┘                                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Room Card Specs:**

| Element | Specification |
|---------|---------------|
| **Container** | White background, rounded-xl, subtle shadow, hover:shadow-md |
| **Image** | 120x120px, rounded-lg, object-cover |
| **Room Name** | font-semibold, text-lg, can include emoji |
| **Description** | text-secondary, line-clamp-2 |
| **Listener Count** | 📊 icon + count, positioned top-right |
| **Click Action** | Navigate to `/voice/:roomId` |

**Room Card States:**

1. **Active with Listeners**: Shows listener count badge
2. **Empty Room**: Shows "📊 0" or "No listeners yet"
3. **Live Indicator**: Optional pulsing dot if speakers are active

#### Grid Layout

- **Desktop (≥1024px)**: 2 columns, gap-6
- **Tablet (768-1023px)**: 2 columns, gap-4
- **Mobile (<768px)**: 1 column, gap-4

---

### 6.3 Room Detail Page (`/voice/:id`)

The active room experience where users listen, speak, and interact.

#### Main Room View (Listener)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ← Back                                  Room Name                        ⋮     │
│  Room description goes here...                                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                        🔴 LIVE                                                  │
│                                                                                 │
│         ┌───────────────────────────────────────┐                               │
│         │                                       │                               │
│         │      ╭─────╮        ╭─────╮          │  Speakers                      │
│         │      │ 👤  │        │ 👤  │          │                               │
│         │      │ ))) │        │     │          │                               │
│         │      ╰─────╯        ╰─────╯          │                               │
│         │     John D. ⭐      Jane S.          │                               │
│         │     Speaking...      Listening       │                               │
│         │                                       │                               │
│         │         ╭─────╮        ╭─────╮       │                               │
│         │         │ 👤  │        │ 👤  │       │                               │
│         │         │     │        │     │       │                               │
│         │         ╰─────╯        ╰─────╯       │                               │
│         │        Mike J.       Sarah W.        │                               │
│         │                                       │                               │
│         └───────────────────────────────────────┘                               │
│                                                                                 │
│  ───────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│         👥 45 listeners                                                         │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │              🙋 Request to Speak                                          │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │              Leave Room                                                   │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Speaker Circle States:**

1. **Speaking** (audio waves animated):

   ```
   ╭────────────╮
   │    👤      │  Purple glow border
   │   )))      │  ← Animated audio waves
   ╰────────────╯
   John D. ⭐
   Speaking...
   ```

2. **Not Speaking** (muted or paused):

   ```
   ╭────────────╮
   │    👤      │  Normal border
   │            │
   ╰────────────╯
   Jane S.
   ```

3. **Primary Admin** indicator: ⭐ next to name

#### Room View (When Speaking)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ← Morning Talk                                                          ⋮     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                    🎙️ You're Speaking!                                          │
│                                                                                 │
│              ╭──────────────────────╮                                          │
│              │                      │                                          │
│              │         👤           │ ← Your avatar                             │
│              │        ))))          │   with purple glow                        │
│              │                      │                                          │
│              ╰──────────────────────╯                                          │
│                     You (Me)                                                    │
│                                                                                 │
│  ───────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│  Other Speakers:                                                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                                        │
│  │    👤    │ │    👤    │ │    👤    │                                        │
│  │   )))    │ │          │ │          │                                        │
│  │  John D. │ │ Jane S.  │ │  Empty   │                                        │
│  └──────────┘ └──────────┘ └──────────┘                                        │
│                                                                                 │
│         👥 45 listeners                                                         │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │              🔇 Mute                                                      │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │              ✋ Stop Speaking                                              │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Room View (Pending Request)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  [...room content above...]                                                     │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │  ⏳ Request pending...                                                    │ │
│  │                                                                           │ │
│  │  Waiting for admin to approve your request.                               │ │
│  │                                                                           │ │
│  │              [Cancel Request]                                             │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │              Leave Room                                                   │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Room View (Admin)

Additional controls for room admins:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ← Morning Talk                              [Admin ⚙️]                  ⋮     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  [...speaker grid same as above...]                                             │
│                                                                                 │
│  ───────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│  📋 Speak Requests (3)                                           View All >    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ 👤 Sarah W.           requested 2m ago                                  │   │
│  │                                   [✓ Approve] [✗ Reject]                │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │ 👤 Tom B.             requested 5m ago                                  │   │
│  │                                   [✓ Approve] [✗ Reject]                │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│         👥 45 listeners                                                         │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  [Speak as Admin] or [🔇 Mute] if already speaking                             │
│                                                                                 │
│  [Leave Room]                                                                   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Admin Controls Panel (⚙️ opens):**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Room Admin Controls                                                      ✕    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  👥 Manage Speakers                                                        →   │
│  View and revoke speaking privileges                                            │
│                                                                                 │
│  🚫 Banned Users (2)                                                       →   │
│  View and manage banned users                                                   │
│                                                                                 │
│  📋 All Speak Requests                                                     →   │
│  View pending requests                                                          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 6.4 About Us Page (`/about`)

Company information and mission page.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [Header]                                                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Home > About Us                                                                │
│                                                                                 │
│                              About Us                                           │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │  Our Mission                                                            │   │
│  │                                                                         │   │
│  │  ZenRoom is dedicated to creating meaningful voice connections          │   │
│  │  between people around the world. We believe in the power of            │   │
│  │  authentic conversation to bring joy, knowledge, and friendship.        │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │  Why Voice?                                                             │   │
│  │                                                                         │   │
│  │  In a world of text messages and video calls, we've found that          │   │
│  │  voice-only conversation creates a unique space for authentic           │   │
│  │  connection. Without the pressure of being on camera, people can        │   │
│  │  truly be themselves.                                                   │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │  Our Values                                                             │   │
│  │                                                                         │   │
│  │  🎯 Authenticity - Be yourself, express freely                         │   │
│  │  🤝 Community - Build lasting connections                               │   │
│  │  🛡️ Safety - A respectful space for everyone                           │   │
│  │  🎉 Fun - Entertainment and joy in every room                           │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │  Our Team                                                               │   │
│  │                                                                         │   │
│  │  ZenRoom is created by [COMPANY NAME PRIVATE LIMITED]                   │   │
│  │                                                                         │   │
│  │  A team of passionate engineers, designers, and community builders      │   │
│  │  dedicated to revolutionizing how people connect through voice.         │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
│ [Footer]                                                                        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 6.5 Compliance Page (`/compliance`)

Legal and policy pages with tabbed navigation.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [Header]                                                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Home > Compliance                                                              │
│                                                                                 │
│                              Compliance                                         │
│                                                                                 │
│  ┌──────────────────┬──────────────────┬──────────────────┐                     │
│  │  Privacy Policy  │  Terms of Use    │  Community       │                     │
│  │     (active)     │                  │  Guidelines      │                     │
│  └──────────────────┴──────────────────┴──────────────────┘                     │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                                                                         │   │
│  │  Privacy Policy                                                         │   │
│  │  Last Updated: December 2025                                            │   │
│  │                                                                         │   │
│  │  1. Information We Collect                                              │   │
│  │                                                                         │   │
│  │  We collect the following information when you use ZenRoom:             │   │
│  │  - Phone number for authentication                                      │   │
│  │  - Display name you choose                                              │   │
│  │  - Voice data (not recorded, only streamed live)                        │   │
│  │  - Usage analytics                                                      │   │
│  │                                                                         │   │
│  │  2. How We Use Your Information                                         │   │
│  │  ...                                                                    │   │
│  │                                                                         │   │
│  │  3. Data Security                                                       │   │
│  │  ...                                                                    │   │
│  │                                                                         │   │
│  │  4. Your Rights                                                         │   │
│  │  ...                                                                    │   │
│  │                                                                         │   │
│  │  5. Contact Us                                                          │   │
│  │  For privacy inquiries: [email]                                         │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
│ [Footer]                                                                        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Tab Content:**

| Tab | URL | Content |
|-----|-----|---------|
| Privacy Policy | `/compliance` or `/compliance/privacy` | Data collection, usage, GDPR compliance |
| Terms of Use | `/compliance/terms` | Service terms, user responsibilities |
| Community Guidelines | `/compliance/guidelines` | Behavior rules, content policy, reporting |

---

### 6.6 Recharge Page (`/recharge`)

Coin purchase page for digital currency.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [Header]                                                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Home > Recharge                                                                │
│                                                                                 │
│  Balance: 🪙 0                                                                  │
│                                                                                 │
│  ┌───────────────────────────────────────────┬──────────────────────────────┐  │
│  │                                           │                              │  │
│  │  ┌──────────────┐  ┌──────────────┐       │  Payment Details             │  │
│  │  │ 🪙 3300      │  │ 🪙 10000     │       │                              │  │
│  │  │   ₹ 100     │  │   ₹ 300      │       │  🪙 Digital Coins    3300    │  │
│  │  │  (selected)  │  │              │       │                              │  │
│  │  └──────────────┘  └──────────────┘       │  ─────────────────────────── │  │
│  │                                           │                              │  │
│  │  ┌──────────────┐  ┌──────────────┐       │  Total Payable       ₹ 100   │  │
│  │  │ 🪙 15000     │  │ 🪙 33000     │       │  Amount                      │  │
│  │  │   ₹ 400      │  │   ₹ 800      │       │                              │  │
│  │  │              │  │              │       │  ─────────────────────────── │  │
│  │  └──────────────┘  └──────────────┘       │                              │  │
│  │                                           │  Payment Method              │  │
│  │  ┌──────────────┐                         │                              │  │
│  │  │ 🪙 50000     │                         │  ○ UPI / G Pay / PhonePe    │  │
│  │  │   ₹ 1000     │                         │                      (●)     │  │
│  │  │              │                         │                              │  │
│  │  └──────────────┘                         │  ─────────────────────────── │  │
│  │                                           │                              │  │
│  │  ─────────────────────────────────────    │  ┌────────────────────────┐  │  │
│  │                                           │  │                        │  │  │
│  │  Custom price:  [   1    ] [Confirm]      │  │      Pay now           │  │  │
│  │                                           │  │                        │  │  │
│  │                                           │  └────────────────────────┘  │  │
│  │                                           │                              │  │
│  └───────────────────────────────────────────┴──────────────────────────────┘  │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ 🔒 100% SECURE & SAFE PAYMENT                                           │   │
│  │                                                                         │   │
│  │ Your information is safeguarded with third-party payment methods.       │   │
│  │                                                                         │   │
│  │ 🌐 This site is SSL SECURED        ✓ VERIFIED & SECURED                │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
│ [Footer]                                                                        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Coin Packages

| Coins | Price (₹) | Best For |
|-------|-----------|----------|
| 🪙 3,300 | ₹100 | Starter |
| 🪙 10,000 | ₹300 | Popular |
| 🪙 15,000 | ₹400 | Value |
| 🪙 33,000 | ₹800 | Best Value |
| 🪙 50,000 | ₹1,000 | Premium |
| Custom | ₹1 per 33 coins | Flexible |

#### Package Card Component

```
┌──────────────────────┐
│                      │
│    🪙 3300          │  ← Yellow coin icon + amount
│      ₹ 100           │  ← Price in secondary color
│                      │
└──────────────────────┘
```

**States:**

- **Default**: White background, subtle border
- **Selected**: Light pink background, coral border, coral glow
- **Hover**: Slight scale up, shadow increase

#### Payment Summary Panel

```
┌──────────────────────────────┐
│                              │
│  Payment Details             │
│                              │
│  🪙 Digital Coins    3300   │
│                              │
│  ──────────────────────────  │
│                              │
│  Total Payable       ₹ 100   │
│  Amount                      │
│                              │
│  ──────────────────────────  │
│                              │
│  Payment Method              │
│                              │
│  [UPI] [GPay] [PhonePe] [More]│
│                         (●)  │
│                              │
│  ──────────────────────────  │
│                              │
│  ┌────────────────────────┐  │
│  │       Pay now          │  │  ← Coral gradient button
│  └────────────────────────┘  │
│                              │
└──────────────────────────────┘
```

#### Trust Signals Section

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  🔒 100% SECURE & SAFE PAYMENT                                                 │
│                                                                                 │
│  Your information is safeguarded with third-party payment methods.              │
│                                                                                 │
│  🌐 This site is SSL SECURED              ✓ VERIFIED & SECURED                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 6.7 Contact Page (`/contact`)

Contact form and company information.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [Header]                                                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  (Light pink background section)                                                │
│                                                                                 │
│  ┌──────────────────────────────┬──────────────────────────────────────────┐   │
│  │                              │                                          │   │
│  │  Contact Us                  │  ┌────────────┐  ┌────────────────────┐  │   │
│  │  ────────────────────        │  │ 👤         │  │ ✉️                  │  │   │
│  │                              │  │ Please     │  │ Please enter       │  │   │
│  │  [COMPANY NAME]              │  │ enter name │  │ E-mail             │  │   │
│  │  PRIVATE LIMITED             │  └────────────┘  └────────────────────┘  │   │
│  │                              │                                          │   │
│  │  Contact mail:               │  ┌─────────────────────────────────────┐ │   │
│  │  contact@zenroom.app         │  │ 📱 Please enter Phone               │ │   │
│  │                              │  └─────────────────────────────────────┘ │   │
│  │                              │                                          │   │
│  │  Registered Address:         │  ┌─────────────────────────────────────┐ │   │
│  │  [Full Company Address]      │  │                                     │ │   │
│  │  [City, State]               │  │ Please enter Message                │ │   │
│  │  Pin Code: XXXXXX            │  │                                     │ │   │
│  │                              │  │                                     │ │   │
│  │                              │  │                                     │ │   │
│  │                              │  └─────────────────────────────────────┘ │   │
│  │                              │                                          │   │
│  │                              │         ┌─────────────────┐              │   │
│  │                              │         │      Send       │              │   │
│  │                              │         └─────────────────┘              │   │
│  │                              │                                          │   │
│  └──────────────────────────────┴──────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
│ [Footer]                                                                        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Contact Form Fields

| Field | Type | Placeholder | Required |
|-------|------|-------------|----------|
| Name | text | Please enter name | Yes |
| Email | email | Please enter E-mail | Yes |
| Phone | tel | Please enter Phone | Yes |
| Message | textarea | Please enter Message | Yes |

#### Form Validation

```typescript
const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});
```

---

### 6.8 Authentication Pages

#### Login Page (`/login`)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [Header]                                                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                         ┌─────────────────────────────────┐                     │
│                         │                                 │                     │
│                         │  🎤 Welcome Back to ZenRoom     │                     │
│                         │                                 │                     │
│                         │  ─────────────────────────────  │                     │
│                         │                                 │                     │
│                         │  Enter your phone number        │                     │
│                         │                                 │                     │
│                         │  ┌───────────────────────────┐  │                     │
│                         │  │ +91  │ 9876543210        │  │                     │
│                         │  └───────────────────────────┘  │                     │
│                         │                                 │                     │
│                         │  ┌───────────────────────────┐  │                     │
│                         │  │      Send OTP             │  │                     │
│                         │  └───────────────────────────┘  │                     │
│                         │                                 │                     │
│                         │  ─────────────────────────────  │                     │
│                         │                                 │                     │
│                         │  Don't have an account?         │                     │
│                         │  Sign up                        │                     │
│                         │                                 │                     │
│                         └─────────────────────────────────┘                     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### OTP Verification

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         │                                 │                     │
│                         │  Verify OTP                     │                     │
│                         │                                 │                     │
│                         │  Enter the 6-digit code sent    │                     │
│                         │  to +91 98765 43210             │                     │
│                         │                                 │                     │
│                         │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐  │                     │
│                         │  │  │ │  │ │  │ │  │ │  │ │  │  │                     │
│                         │  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘  │                     │
│                         │                                 │                     │
│                         │  Resend code in 00:30           │                     │
│                         │                                 │                     │
│                         │  ┌───────────────────────────┐  │                     │
│                         │  │      Verify               │  │                     │
│                         │  └───────────────────────────┘  │                     │
│                         │                                 │                     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Set Display Name (`/set-name`)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         │                                 │                     │
│                         │  👋 Welcome to ZenRoom!         │                     │
│                         │                                 │                     │
│                         │  What should we call you?       │                     │
│                         │                                 │                     │
│                         │  ┌───────────────────────────┐  │                     │
│                         │  │ Enter your display name   │  │                     │
│                         │  └───────────────────────────┘  │                     │
│                         │                                 │                     │
│                         │  ┌───────────────────────────┐  │                     │
│                         │  │       Let's Go! 🎉        │  │                     │
│                         │  └───────────────────────────┘  │                     │
│                         │                                 │                     │
│                         │  This is how others will see    │                     │
│                         │  you in rooms.                  │                     │
│                         │                                 │                     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 6.9 User Profile Page (`/profile`)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [Header]                                                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Home > Profile                                                                 │
│                                                                                 │
│                        ╭─────────╮                                              │
│                        │   👤    │                                              │
│                        │         │                                              │
│                        ╰─────────╯                                              │
│                          John D.                                                │
│                       +91 ****** 4567                                           │
│                                                                                 │
│  ───────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│  My Balance                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  🪙 3,450 Digital Coins                              [Recharge →]       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ───────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│  Display Name                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ John D.                                                                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│                           [Update Name]                                         │
│                                                                                 │
│  ───────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│  Transaction History                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Dec 18, 2025    Recharge        +3,300 🪙           ₹100               │   │
│  │ Dec 15, 2025    Gift Sent       -500 🪙              To: @JaneS        │   │
│  │ Dec 10, 2025    Recharge        +10,000 🪙          ₹300               │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ───────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│                           [Logout]                                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
│ [Footer]                                                                        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Authentication Flow

### Login Process

Phone-based OTP authentication flow:

1. **Enter Phone Number**: User enters phone with country code
2. **Request OTP**: Server sends 6-digit OTP via SMS
3. **Verify OTP**: User enters OTP, server validates and returns JWT
4. **Set Display Name**: If first login, prompt for display name
5. **Redirect**: Send to requested page or home

### Token Storage

Store JWT in `localStorage` with key `zvoice_token`:

```typescript
// On successful login
localStorage.setItem('zvoice_token', response.token);

// On logout
localStorage.removeItem('zvoice_token');
```

### Protected Routes

Routes requiring authentication:

- `/profile` - User profile
- `/recharge` - Coin recharge (can view, but pay requires login)
- `/voice/:id` - Room detail (can view, but joining requires login)

### Auth Context

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  updateDisplayName: (name: string) => Promise<void>;
}
```

---

## 8. Digital Coins & Recharge System

### Overview

Digital coins are the in-app currency used for:

- Sending virtual gifts to hosts/speakers
- Premium features (future)
- Tips and donations

### Coin Packages

```typescript
// constants/coinPackages.ts
export const COIN_PACKAGES = [
  { id: 'pack_100', coins: 3300, price: 100, currency: 'INR' },
  { id: 'pack_300', coins: 10000, price: 300, currency: 'INR' },
  { id: 'pack_400', coins: 15000, price: 400, currency: 'INR' },
  { id: 'pack_800', coins: 33000, price: 800, currency: 'INR', popular: true },
  { id: 'pack_1000', coins: 50000, price: 1000, currency: 'INR' },
] as const;

export const COINS_PER_RUPEE = 33;
```

### Balance Store

```typescript
interface BalanceState {
  coins: number;
  isLoading: boolean;
  
  fetchBalance: () => Promise<void>;
  addCoins: (amount: number) => void;
  deductCoins: (amount: number) => void;
}
```

### Payment Flow

1. **Select Package**: User selects coin package or enters custom amount
2. **Review Order**: Show payment summary panel
3. **Select Method**: Choose UPI/GPay/PhonePe/etc.
4. **Initiate Payment**: Create payment order via API
5. **Process Payment**: Redirect to payment gateway or show QR
6. **Verify Payment**: Webhook or polling confirms payment
7. **Credit Coins**: Update user balance

---

## 9. API Reference

### Base Configuration

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/request-otp` | Request OTP |
| POST | `/auth/verify-otp` | Verify and get token |
| POST | `/auth/set-display-name` | Set/update display name |
| GET | `/auth/me` | Get current user |

### Room Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rooms` | List all active rooms |
| GET | `/rooms/:id` | Get room details with speakers |
| POST | `/rooms/:id/image` | Upload room image (multipart/form-data) |

#### Image Upload Details
- **Endpoint**: `POST /rooms/:id/image`
- **Content-Type**: `multipart/form-data`
- **Body**: `{ image: File }`
- **Storage Logic**:
  - File should be stored as `sha256(file_content).extension`.
  - The room entry in the database should be updated with the relative URL of the image.
  - Returns `{ success: true, imageUrl: string }`.

| GET | `/rooms/:id/queues` | Get pending speak requests (admin) |
| GET | `/rooms/:roomId/bans` | List banned users (admin) |
| POST | `/rooms/:roomId/bans` | Ban user (admin) |
| DELETE | `/rooms/:roomId/bans/:banId` | Unban user (admin) |

### Speak Request Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/speak-requests/:roomId/request` | Request to speak |
| POST | `/speak-requests/:requestId/approve` | Approve request (admin) |
| POST | `/speak-requests/:requestId/reject` | Reject request (admin) |

### Balance & Recharge Endpoints (Future)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/balance` | Get current coin balance |
| POST | `/recharge/create-order` | Create payment order |
| POST | `/recharge/verify` | Verify payment |
| GET | `/transactions` | Get transaction history |

---

## 10. Socket.IO Events

### Connection

```typescript
import { io } from 'socket.io-client';

const socket = io(SOCKET_URL, {
  auth: { token },
  transports: ['websocket'],
});
```

### Events: Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `{ roomId }` | Join as listener |
| `leave-room` | `{ roomId }` | Leave room |
| `request-speak` | `{ roomId }` | Request to speak |
| `cancel-speak-request` | `{ roomId, requestId }` | Cancel pending request |
| `stop-speaking` | `{ roomId }` | Stop speaking voluntarily |
| `approve-speak` | `{ roomId, requestId }` | Approve request (admin) |
| `reject-speak` | `{ roomId, requestId }` | Reject request (admin) |
| `revoke-speaker` | `{ roomId, speakerId }` | Remove speaker (admin) |

### Events: Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `room-joined` | `{ roomId, speakers, listenerCount }` | Successfully joined |
| `room-left` | `{ roomId }` | Successfully left |
| `user-joined` | `{ userId, displayName }` | Someone joined |
| `user-left` | `{ userId }` | Someone left |
| `speaker-joined` | `{ userId, displayName, isAdmin }` | New speaker |
| `speaker-left` | `{ userId }` | Speaker stopped |
| `speak-request-created` | `{ requestId, userId, displayName }` | New request (to admins) |
| `speak-request-approved` | `{ requestId, userId }` | Request approved |
| `speak-request-rejected` | `{ requestId, userId }` | Request rejected |
| `speak-request-cancelled` | `{ requestId, userId }` | Request cancelled |
| `speaker-revoked` | `{ userId }` | Speaker removed by admin |
| `listener-count-updated` | `{ count }` | Listener count changed |
| `room-updated` | `{ room }` | Room settings changed |
| `user-banned` | `{ userId }` | User banned (to admins) |
| `you-are-banned` | `{ reason }` | You were banned |
| `error` | `{ code, message }` | Error occurred |

### MediaSoup Signaling Events

| Event (C→S) | Payload | Response Event |
|-------------|---------|----------------|
| `get-router-rtp-capabilities` | `{ roomId }` | `router-rtp-capabilities` |
| `create-transport` | `{ roomId, direction }` | `transport-created` |
| `connect-transport` | `{ transportId, dtlsParameters }` | `transport-connected` |
| `produce` | `{ transportId, kind, rtpParameters }` | `produced` |
| `consume` | `{ transportId, producerId }` | `consumed` |
| `resume-consumer` | `{ consumerId }` | `consumer-resumed` |

---

## 11. MediaSoup WebRTC Integration

### Overview

MediaSoup handles the real-time audio streaming:

- **Speakers** produce audio (microphone → server)
- **Listeners** consume audio (server → speakers)

### Setup Flow

```typescript
import { Device } from 'mediasoup-client';

// 1. Create device
const device = new Device();

// 2. Load router capabilities
const { rtpCapabilities } = await socket.emitWithAck('get-router-rtp-capabilities', { roomId });
await device.load({ routerRtpCapabilities: rtpCapabilities });

// 3. Create transports
// For speakers: send transport
// For listeners: receive transport
```

### Speaker Flow (Producing Audio)

```typescript
// 1. Request and get mic access
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const track = stream.getAudioTracks()[0];

// 2. Create send transport
const { id, iceParameters, iceCandidates, dtlsParameters } = 
  await socket.emitWithAck('create-transport', { roomId, direction: 'send' });

const sendTransport = device.createSendTransport({
  id, iceParameters, iceCandidates, dtlsParameters
});

// 3. Handle transport connect
sendTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
  try {
    await socket.emitWithAck('connect-transport', {
      transportId: sendTransport.id,
      dtlsParameters
    });
    callback();
  } catch (e) { errback(e); }
});

// 4. Handle produce
sendTransport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
  try {
    const { producerId } = await socket.emitWithAck('produce', {
      transportId: sendTransport.id,
      kind,
      rtpParameters
    });
    callback({ id: producerId });
  } catch (e) { errback(e); }
});

// 5. Actually produce
const producer = await sendTransport.produce({ track });
```

### Listener Flow (Consuming Audio)

```typescript
// 1. Create receive transport
const { id, iceParameters, iceCandidates, dtlsParameters } = 
  await socket.emitWithAck('create-transport', { roomId, direction: 'recv' });

const recvTransport = device.createRecvTransport({
  id, iceParameters, iceCandidates, dtlsParameters
});

// 2. Handle connect
recvTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
  // Similar to send transport
});

// 3. For each speaker's producer, consume
async function consumeSpeaker(producerId: string) {
  const { consumerId, kind, rtpParameters } = await socket.emitWithAck('consume', {
    transportId: recvTransport.id,
    producerId
  });
  
  const consumer = await recvTransport.consume({
    id: consumerId,
    producerId,
    kind,
    rtpParameters
  });
  
  // Resume consumer
  await socket.emitWithAck('resume-consumer', { consumerId });
  
  // Play audio
  const audio = new Audio();
  audio.srcObject = new MediaStream([consumer.track]);
  audio.play();
}
```

### Audio Level Visualization

```typescript
// Get audio level for speaking indicator
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaStreamSource(stream);
source.connect(analyser);

function getAudioLevel(): number {
  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  return data.reduce((a, b) => a + b) / data.length / 255;
}
```

---

## 12. User Roles & Permissions

### Role Hierarchy in a Room

| Role | Can Listen | Can Speak | Request Speak | Approve/Reject | Revoke | Ban |
|------|------------|-----------|---------------|----------------|--------|-----|
| Listener | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Speaker | ✅ | ✅ | N/A | ❌ | ❌ | ❌ |
| Room Admin | ✅ | ✅ (request) | ✅ | ✅ | ✅ | ✅ |
| Primary Admin | ✅ | ✅ (auto) | N/A | ✅ | ✅ | ✅ |
| System Admin | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### UI Differences by Role

**Listener:**

- Sees "Request to Speak" button
- No admin controls

**Speaker:**

- Sees "Mute" and "Stop Speaking" buttons
- Prominent position in speaker grid

**Room Admin:**

- Sees admin controls (gear icon)
- Sees speak request queue
- Can speak (with auto-approval if room admin)

**Primary Admin:**

- All room admin powers
- Can speak immediately without request
- Cannot be banned or removed
- ⭐ indicator next to name

**System Admin:**

- Can listen only
- Sees notice: "System admins cannot speak in rooms"
- No speak request button

---

## 13. State Management

### Auth Store

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  login: (user: User, token: string) => void;
  logout: () => void;
  updateDisplayName: (name: string) => void;
}
```

### Room Store

```typescript
interface RoomState {
  currentRoom: Room | null;
  speakers: Speaker[];
  listenerCount: number;
  myRole: 'listener' | 'speaker' | 'admin' | 'primary-admin';
  mySpeakRequest: SpeakRequest | null;
  speakQueue: SpeakRequest[]; // Admin only
  
  joinRoom: (room: Room, initialData: RoomJoinData) => void;
  leaveRoom: () => void;
  addSpeaker: (speaker: Speaker) => void;
  removeSpeaker: (userId: string) => void;
  updateListenerCount: (count: number) => void;
  setSpeakRequest: (request: SpeakRequest | null) => void;
  addToQueue: (request: SpeakRequest) => void;
  removeFromQueue: (requestId: string) => void;
}
```

### Audio Store

```typescript
interface AudioState {
  isMuted: boolean;
  isSpeaking: boolean; // Am I producing audio?
  audioLevel: number; // 0-1 for visualizations
  consumers: Map<string, AudioConsumer>; // producerId -> consumer
  producer: Producer | null;
  
  setMuted: (muted: boolean) => void;
  setAudioLevel: (level: number) => void;
  addConsumer: (producerId: string, consumer: AudioConsumer) => void;
  removeConsumer: (producerId: string) => void;
  setProducer: (producer: Producer | null) => void;
}
```

### UI Store

```typescript
interface UIState {
  activeBottomSheet: string | null;
  toasts: Toast[];
  isConnecting: boolean;
  
  openBottomSheet: (id: string) => void;
  closeBottomSheet: () => void;
  addToast: (toast: Toast) => void;
}
```

### Balance Store

```typescript
interface BalanceState {
  coins: number;
  transactions: Transaction[];
  isLoading: boolean;
  
  fetchBalance: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  addCoins: (amount: number) => void;
  deductCoins: (amount: number) => void;
}
```

---

## 14. Audio Handling

### Microphone Permissions

```typescript
async function requestMicPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(t => t.stop()); // Release immediately
    return true;
  } catch (e) {
    return false;
  }
}
```

### Permission UI Flow

1. Before "Request to Speak", check mic permission
2. If denied, show modal explaining how to enable
3. If granted, proceed with request

### Audio Playback

```typescript
// For each consumer, create audio element
function playAudio(consumer: Consumer) {
  const audio = document.createElement('audio');
  audio.srcObject = new MediaStream([consumer.track]);
  audio.autoplay = true;
  audio.play().catch(e => {
    // Handle autoplay policy
    // May need user interaction first
  });
}
```

### Autoplay Handling

Some browsers block autoplay. Handle with:

```typescript
// On first user interaction after joining room
document.addEventListener('click', () => {
  consumers.forEach(consumer => {
    const audio = consumerAudioElements.get(consumer.id);
    audio?.play().catch(() => {});
  });
}, { once: true });
```

---

## 15. Error Handling

### Socket Disconnection

```typescript
socket.on('disconnect', () => {
  uiStore.addToast({ type: 'error', message: 'Connection lost. Reconnecting...' });
});

socket.on('connect', () => {
  if (roomStore.currentRoom) {
    // Rejoin room
    socket.emit('join-room', { roomId: roomStore.currentRoom.id });
  }
});
```

### Common Errors

| Error Code | User Message | Action |
|------------|--------------|--------|
| `ROOM_NOT_FOUND` | "This room no longer exists" | Redirect to rooms list |
| `BANNED` | "You are banned from this room" | Redirect to rooms list |
| `MAX_SPEAKERS` | "Room is full. Try again later." | Keep as listener |
| `SPEAK_REQUEST_PENDING` | "You already have a pending request" | Show cancel option |
| `MIC_PERMISSION_DENIED` | "Microphone access needed to speak" | Show permission guide |
| `NETWORK_ERROR` | "Connection error. Check your internet" | Show retry button |

### Toast Notifications

```
┌────────────────────────────────────┐
│ ✅ You're now speaking!            │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ ❌ Your request was rejected       │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ ⚠️ Connection lost. Reconnecting... │
└────────────────────────────────────┘
```

---

## 16. Responsive Design

### Mobile-First Approach

Design for 360px width first, then enhance for larger screens.

### Breakpoints

```css
/* Tailwind defaults */
sm: 640px   /* Larger phones */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
```

### Key Responsive Patterns

**Room Page:**

- Mobile: Vertical layout, bottom sheet for admin controls
- Desktop: Side panel for admin controls

**Speaker Grid:**

- Mobile: 2x2 or 3x2 grid
- Desktop: Horizontal row of 5 speakers

**Navigation:**

- Mobile: Bottom navigation bar
- Desktop: Top header with nav links

### Touch Targets

- Minimum 44x44px for all interactive elements
- Generous padding on buttons
- Swipe gestures for bottom sheets

---

## 17. Accessibility

### Audio Controls

- Clear mute/unmute buttons with icons AND text
- Keyboard shortcuts (M = mute, S = stop speaking)
- Screen reader announcements for speaker changes

### Live Regions

```tsx
<div aria-live="polite" aria-atomic="true">
  {speakingAnnouncement}
</div>
```

Announce:

- "John is now speaking"
- "Jane stopped speaking"
- "Your request was approved"
- "You were muted by admin"

### Focus Management

- Trap focus in modals and bottom sheets
- Return focus when closing sheets
- Logical tab order

### Color Accessibility

- Don't rely on color alone (use icons + color)
- Maintain 4.5:1 contrast ratio
- Provide alternative indicators for colorblind users

---

## 18. Environment Variables

```env
# .env.local
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

---

## 19. Testing Strategy

### Unit Tests

- Audio utility functions
- State management stores
- Permission handling

### Component Tests

- Speaker avatar with different states
- Speak request button states
- Admin control interactions

### Integration Tests

- Join room flow
- Speak request → approve → speaking
- Ban/unban flow

### E2E Tests (Playwright)

- Full login → join → speak → leave flow
- Multi-user scenarios (mock second user)

---

## Appendix A: Type Definitions

```typescript
// types/models.ts

export interface User {
  id: string;
  phone: string;
  displayName: string | null;
  role: 'USER' | 'SYSTEM_ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  isArchived: boolean;
  primaryAdminId: string;
  currentSpeakerCount: number;
  listenerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Speaker {
  userId: string;
  displayName: string | null;
  isAdmin: boolean;
  isPrimary: boolean;
}

export interface SpeakRequest {
  id: string;
  userId: string;
  roomId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user?: {
    id: string;
    displayName: string | null;
  };
}

export interface RoomBan {
  id: string;
  userId: string;
  roomId: string;
  reason: string | null;
  bannedById: string;
  createdAt: string;
  user?: {
    id: string;
    displayName: string | null;
  };
}

export interface Transaction {
  id: string;
  type: 'RECHARGE' | 'GIFT_SENT' | 'GIFT_RECEIVED';
  coins: number;
  amount?: number; // For recharge, in rupees
  recipientId?: string; // For gifts
  createdAt: string;
}

export interface CoinPackage {
  id: string;
  coins: number;
  price: number;
  currency: string;
  popular?: boolean;
}
```

---

## Appendix B: Component Prop Examples

### SpeakerCircle

```tsx
interface SpeakerCircleProps {
  userId: string;
  displayName: string | null;
  isAdmin: boolean;
  isPrimary: boolean;
  isSpeaking: boolean;    // Audio level > threshold
  audioLevel: number;     // 0-1 for animation intensity
  isMe: boolean;          // Is this the current user?
  size: 'sm' | 'md' | 'lg';
  onRevoke?: () => void;  // Admin action
}

<SpeakerCircle
  userId="123"
  displayName="John D."
  isAdmin={false}
  isPrimary={false}
  isSpeaking={true}
  audioLevel={0.7}
  isMe={false}
  size="lg"
/>
```

### SpeakButton

```tsx
interface SpeakButtonProps {
  state: 'idle' | 'requesting' | 'pending' | 'speaking' | 'disabled';
  onRequest: () => void;
  onCancel: () => void;
  onStop: () => void;
  disabledReason?: string; // "System admins cannot speak"
}
```

### RequestCard

```tsx
interface RequestCardProps {
  request: SpeakRequest;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}
```

---

## Appendix C: Animation Specs

### Audio Wave Animation (CSS)

```css
.audio-wave {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 20px;
}

.audio-wave .bar {
  width: 3px;
  background: currentColor;
  border-radius: 2px;
  animation: wave 0.5s ease-in-out infinite;
}

.audio-wave .bar:nth-child(1) { animation-delay: 0s; }
.audio-wave .bar:nth-child(2) { animation-delay: 0.1s; }
.audio-wave .bar:nth-child(3) { animation-delay: 0.2s; }
.audio-wave .bar:nth-child(4) { animation-delay: 0.1s; }
.audio-wave .bar:nth-child(5) { animation-delay: 0s; }

@keyframes wave {
  0%, 100% { height: 30%; }
  50% { height: 100%; }
}
```

### Speaking Glow Effect

```css
.speaking-glow {
  box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4);
  animation: glow-pulse 1.5s infinite;
}

@keyframes glow-pulse {
  0% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(124, 58, 237, 0); }
  100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0); }
}
```

### Page Transitions (Framer Motion)

```tsx
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

<motion.div
  variants={pageVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={{ duration: 0.2 }}
>
  {children}
</motion.div>
```

---

**Document Version**: 2.0  
**Last Updated**: December 18, 2025  
**Backend API Version**: Compatible with zvoice-backend v0.1.0
