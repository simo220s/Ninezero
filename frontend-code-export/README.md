# Frontend Code Export for Figma AI

This folder contains all the frontend code files from the website for design recreation in Figma.

## Folder Structure

```
frontend-code-export/
├── styles/
│   ├── index.css (Global CSS with design system)
│   └── tailwind.config.js (Tailwind configuration with colors, fonts, spacing)
├── pages/
│   ├── landing/ (Landing page components)
│   │   ├── HomePage.tsx
│   │   ├── HeroSection.tsx
│   │   ├── PricingSection.tsx
│   │   ├── StatsSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── ReviewsSection.tsx
│   │   └── FAQSection.tsx
│   ├── auth/ (Authentication pages)
│   │   ├── SignupPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   └── ResetPasswordPage.tsx
│   ├── dashboard/ (Dashboard pages)
│   │   ├── EnhancedRegularDashboard.tsx
│   │   ├── EnhancedTrialDashboard.tsx
│   │   ├── EnhancedHeader.tsx
│   │   ├── EnhancedQuickStats.tsx
│   │   ├── EnhancedUpcomingClass.tsx
│   │   ├── EnhancedPlanOverview.tsx
│   │   ├── EnhancedCreditsCard.tsx
│   │   ├── EnhancedRecentActivity.tsx
│   │   ├── EnhancedAccomplishments.tsx
│   │   └── EnhancedAddCreditsModal.tsx
│   └── tutor/ (Tutor profile page)
│       └── TutorProfilePage.tsx
├── components/ (Reusable components)
│   ├── ui/ (UI component library)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── progress.tsx
│   │   ├── tabs.tsx
│   │   ├── table.tsx
│   │   ├── toast.tsx
│   │   ├── spinner.tsx
│   │   ├── scroll-area.tsx
│   │   ├── sheet.tsx
│   │   ├── radio-group.tsx
│   │   └── label.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── FloatingWhatsApp.tsx
│   ├── ClassCard.tsx
│   ├── ReviewCard.tsx
│   ├── StarRating.tsx
│   └── RiyalPrice.tsx
├── App.tsx (Main app with routing)
└── README.md (This file)
```

## Design System Overview

### Colors

**Primary Blue (Brand Color)**
- #2563eb (primary-600) - Main brand color
- Used for: Primary buttons, links, highlights

**Secondary Orange**
- #ff9f43 (secondary-500) - Secondary accent
- Used for: Secondary buttons, CTAs, highlights

**Success Green**
- #22c55e (success-500)
- Used for: Success messages, checkmarks, positive indicators

**Warning Yellow**
- #f59e0b (warning-500)
- Used for: Warnings, alerts

**Error Red**
- #ef4444 (error-500)
- Used for: Errors, destructive actions

**WhatsApp Green**
- #25d366
- Used for: WhatsApp buttons

**Neutral Colors**
- text-primary: #111827 (gray-900) - Main text
- text-secondary: #4b5563 (gray-600) - Secondary text
- bg-light: #f9fafb (gray-50) - Light backgrounds
- border-light: #e5e7eb (gray-200) - Borders

### Typography

**Fonts**
- Arabic: 'Cairo', 'Noto Kufi Arabic', sans-serif
- English: 'Inter', system-ui, sans-serif

**Font Weights**
- light: 300
- normal: 400
- medium: 500
- semibold: 600
- bold: 700
- extrabold: 800

**Responsive Font Sizes** (using clamp for fluid typography)
- responsive-xs: clamp(0.75rem, 2vw, 0.875rem)
- responsive-sm: clamp(0.875rem, 2.5vw, 1rem)
- responsive-base: clamp(1rem, 3vw, 1.125rem)
- responsive-lg: clamp(1.125rem, 3.5vw, 1.25rem)
- responsive-xl: clamp(1.25rem, 4vw, 1.5rem)
- responsive-2xl: clamp(1.5rem, 5vw, 2rem)
- responsive-3xl: clamp(1.875rem, 6vw, 2.5rem)
- responsive-4xl: clamp(2.25rem, 7vw, 3rem)

### Spacing

**8px Grid System**
- xs: 4px (0.25rem)
- sm: 8px (0.5rem)
- md: 16px (1rem)
- lg: 24px (1.5rem)
- xl: 32px (2rem)
- 2xl: 48px (3rem)
- 3xl: 64px (4rem)
- 4xl: 96px (6rem)

### Border Radius

- sm: 8px (0.5rem) - Small cards, inputs
- md: 12px (0.75rem) - Buttons, cards
- lg: 16px (1rem) - Large cards
- xl: 24px (1.5rem) - Hero sections
- full: 9999px - Fully rounded (pills, badges)

### Shadows

- sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
- lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
- xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
- 2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)

### Breakpoints

- xs: 475px (Large mobile)
- sm: 640px (Mobile landscape)
- md: 768px (Tablet)
- lg: 1024px (Desktop)
- xl: 1280px (Large desktop)
- 2xl: 1536px (Extra large)

## Key Pages

### 1. Landing Page (HomePage.tsx)

**Sections:**
1. Header with navigation
2. Hero section with teacher image and CTAs
3. Stats section (achievements, students, etc.)
4. Pricing section (3 pricing cards)
5. Testimonials section
6. Reviews section
7. FAQ section
8. Footer

**Key Features:**
- RTL (Right-to-Left) layout for Arabic
- Responsive design (mobile-first)
- Smooth animations
- WhatsApp floating button

### 2. Hero Section (HeroSection.tsx)

**Layout:** Two-column grid

**Left Column:**
- Certification badge
- Main title: "تعلم اللغة الإنجليزية مع الأستاذ أحمد"
- Subtitle with credentials
- 3 key benefits with checkmarks
- Two CTA buttons (Primary + WhatsApp)
- Trust indicators (5-star rating, guarantee, scheduling)

**Right Column:**
- Large teacher photo (4:5 aspect ratio)
- Play button overlay
- Floating badges:
  - "98% نسبة النجاح"
  - "+500 طالب"
  - "شاهد فيديو تعريفي"
  - "TESOL معتمد"

### 3. Pricing Section (PricingSection.tsx)

**3 Pricing Cards:**

1. **Trial Class (Free)**
   - Price: "مجاناً"
   - Duration: "25 دقيقة"
   - Green accent
   - CTA: "احجز جلستك المجانية"

2. **Individual Classes (Most Popular)**
   - Price: "35 ريال / الحصة"
   - Blue accent
   - Highlighted (scaled up)
   - Badge: "الأكثر شهرة"
   - CTA: "ابدأ الآن"

3. **Group Classes**
   - Price: "25 ريال / الحصة"
   - Orange accent
   - CTA: "انضم للمجموعة"

### 4. Signup Page (SignupPage.tsx)

**Layout:** Centered card

**Elements:**
- Title: "إنشاء حساب جديد"
- Trial lesson highlight: "25 دقيقة حصة تجريبية مجانية"
- Social auth buttons (Google, Apple)
- Form fields (Name, Email, Password)
- Submit button
- Link to login page

### 5. Login Page (LoginPage.tsx)

**Layout:** Similar to Signup

**Elements:**
- Title: "سجّل الدخول"
- Social auth buttons (Google, Apple)
- Form fields (Email, Password)
- Forgot password link
- Submit button
- Link to signup page

### 6. Enhanced Regular Dashboard (EnhancedRegularDashboard.tsx)

**Layout:** Full-width dashboard

**Sections:**
1. Header with navigation and user menu
2. Welcome section: "هلا، [Name]! 👋"
3. Quick Stats (3 cards):
   - Completed Classes
   - Current Streak
   - Credits Balance
4. Main Content Grid:
   - Upcoming Class Card (large)
   - Plan Overview (sidebar)
   - Credits Card (large)
   - Recent Activity (sidebar)
5. Accomplishments section

### 7. Enhanced Trial Dashboard (EnhancedTrialDashboard.tsx)

**Layout:** Marketing-focused dashboard

**Sections:**
1. Sticky countdown banner (appears on scroll)
2. Hero CTA (large orange gradient card)
   - "لا تفوّت الفرصة!"
   - "احجز حصة تجريبية مجانية"
   - Price: "99 ريال" → "0 ريال"
   - Large CTA button
3. Gift Card + Value section
4. "What to Expect" section (4 cards)
5. Teacher Profile card
6. Final CTA
7. Mobile sticky CTA (bottom)

## Component Library

### Button Component (button.tsx)

**Variants:**
- primary (blue background)
- secondary (orange background)
- outline (transparent with border)
- ghost (transparent, no border)
- whatsapp (WhatsApp green)

**Sizes:**
- sm (small)
- md (medium)
- lg (large)

**States:**
- default
- hover
- active
- disabled
- loading (with spinner)

### Card Component (card.tsx)

**Parts:**
- CardHeader
- CardTitle
- CardContent
- CardFooter

**Styles:**
- White background
- Rounded corners (12px)
- Shadow (subtle)
- Hover effect (lift + shadow increase)

### Input Component (input.tsx)

**Features:**
- Label
- Placeholder
- Error message
- Disabled state
- Focus state (blue outline)

### Badge Component (badge.tsx)

**Variants:**
- default (gray)
- success (green)
- warning (yellow)
- error (red)
- info (blue)

**Style:**
- Rounded pill shape
- Small padding
- Bold text

## Design Patterns

### RTL (Right-to-Left) Support

- All text is right-aligned for Arabic
- Flexbox/Grid layouts use `space-x-reverse`
- Icons positioned with `ms-` (margin-start) instead of `ml-`
- Arrows flip direction based on RTL context

### Responsive Design

- Mobile-first approach
- Breakpoints: 475px, 640px, 768px, 1024px, 1280px, 1536px
- Touch targets minimum 44px (48px on mobile)
- Responsive typography using clamp()
- Grid layouts adapt to screen size

### Accessibility

- WCAG AA/AAA compliant colors
- Focus indicators on all interactive elements
- Semantic HTML
- ARIA labels
- Keyboard navigation support
- Screen reader support
- Minimum touch target size (44px)

### Animations

**Fade In:**
- opacity: 0 → 1
- translateY: 20px → 0
- duration: 0.6s
- easing: ease-out

**Slide In:**
- opacity: 0 → 1
- translateX: -30px → 0 (RTL aware)
- duration: 0.6s
- easing: ease-out

**Scale In:**
- opacity: 0 → 1
- scale: 0.95 → 1
- duration: 0.4s
- easing: ease-out

**Hover Effects:**
- translateY: 0 → -2px
- shadow: increase
- duration: 0.3s
- easing: cubic-bezier(0.4, 0, 0.2, 1)

### Loading States

- Skeleton loaders for cards
- Spinner for buttons
- Shimmer effect for images
- Progressive loading

## Assets

### Images

- Teacher photo: `https://i.postimg.cc/Pxk53c04/photo-5864035878953928423-y-1.jpg`
- Aspect ratio: 4:5
- Optimized for web

### Icons

- Lucide React icons library
- Custom SVG icons for social media
- WhatsApp, Google, Apple logos

### Fonts

- Cairo (Arabic): Google Fonts
- Noto Kufi Arabic (Arabic): Google Fonts
- Inter (English): Google Fonts

## Notes for Figma AI

1. **Direction:** All layouts are RTL (right-to-left) for Arabic
2. **Language:** Primary language is Arabic, secondary is English
3. **Brand Colors:** Blue (#2563eb) and Orange (#ff9f43)
4. **Spacing:** Use 8px grid system
5. **Typography:** Cairo for Arabic, Inter for English
6. **Components:** Create reusable components for buttons, cards, inputs
7. **Responsive:** Design for mobile (375px), tablet (768px), desktop (1280px)
8. **Accessibility:** Ensure sufficient color contrast (WCAG AA minimum)
9. **Animations:** Document hover states and transitions
10. **States:** Include default, hover, active, disabled, loading states

## How to Use This Export

1. Review the design system in `styles/tailwind.config.js` and `styles/index.css`
2. Examine page layouts in the `pages/` folder
3. Study reusable components in the `components/` folder
4. Use the color palette, typography, and spacing defined in the design system
5. Recreate layouts in Figma using the component structure
6. Apply RTL (right-to-left) layout for Arabic text
7. Ensure responsive design for mobile, tablet, and desktop
8. Include all component states (default, hover, active, disabled, loading)

## Questions?

If you need clarification on any component or design pattern, refer to the actual code files in this export.
