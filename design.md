# 🎨 AXIOM - UI/UX Design System

**Project:** AXIOM - AI Resume Analyzer + Smart Job Search + GenAI Career Assistant  
**Design Version:** 1.0  
**Last Updated:** June 2026  
**Audience:** Frontend Developers, Product Designers, Design Engineers

---

## 📋 Table of Contents

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components Specifications](#components-specifications)
6. [Navbar](#navbar)
7. [Landing Page](#landing-page)
8. [Authentication Pages](#authentication-pages)
9. [Dashboard Layout](#dashboard-layout)
10. [Dashboard Pages](#dashboard-pages)
11. [Animations & Interactions](#animations--interactions)
12. [Mobile Responsiveness](#mobile-responsiveness)
13. [Accessibility Guidelines](#accessibility-guidelines)

---

## 🎯 Design Principles

### Philosophy

AXIOM's visual design is inspired by **Linear, Vercel, Stripe, Clerk, Notion, and Raycast**. We prioritize:

- **Minimalism**: Remove unnecessary elements, keep interfaces clean
- **Clarity**: Information hierarchy guides user attention
- **Consistency**: Uniform patterns across all pages
- **Efficiency**: Smooth interactions reduce friction
- **Precision**: Pixel-perfect implementation
- **Dark-First**: Optimized for dark mode as primary theme

### Core Design Values

| Principle | Implementation | Example |
|-----------|-----------------|---------|
| **Spacing** | Large, generous spacing creates breathing room | 24px, 32px, 48px gaps between sections |
| **Typography** | Clear hierarchy with Geist font family | H1: 36px, H2: 28px, Body: 16px |
| **Cards** | Subtle borders, soft shadows, rounded corners | `rounded-2xl` with `border-zinc-800` |
| **Hover States** | Smooth transitions, subtle scale/color changes | 200ms ease-out, 0.5% scale increase |
| **Shadows** | Minimal, used for depth not drama | `shadow-md` for cards, `shadow-lg` for modals |
| **Borders** | 1px borders with high contrast in dark mode | `border-zinc-800` or `border-slate-700` |
| **Transitions** | All interactive elements have smooth animations | `transition-all duration-200` base class |

### Visual Hierarchy

```
H1 (Hero/Main Heading)
├─ Large, attention-grabbing
├─ 36px Geist Bold
└─ Used once per page

H2 (Section Heading)
├─ Defines content sections
├─ 28px Geist Semibold
└─ Multiple per page

H3 (Subsection)
├─ Nested content grouping
├─ 22px Geist Semibold
└─ Under H2 elements

Body (Default Text)
├─ Main content reading
├─ 16px Geist Regular
└─ Line height: 1.6 (25.6px)

Caption (Small Text)
├─ Helper text, metadata
├─ 12px Geist Regular
└─ `text-muted-foreground`
```

---

## 🎨 Color System

### Design Color Palette

We use a sophisticated, minimal color palette optimized for dark mode with careful contrast ratios.

#### Primary Colors

```
Brand Color (Purple):
├─ Purple-50:  #FAFAF9
├─ Purple-100: #F5F3FF
├─ Purple-500: #A855F7 (Primary Action)
├─ Purple-600: #9333EA (Hover)
└─ Purple-700: #7E22CE (Active)

Accent Color (Blue):
├─ Blue-400:   #60A5FA (CTAs)
├─ Blue-500:   #3B82F6 (Links)
├─ Blue-600:   #2563EB (Hover)
└─ Blue-700:   #1D4ED8 (Active)
```

#### Background Colors

```
Background (Dark):
├─ Zinc-950:    #09090B (Page background)
├─ Zinc-900:    #18181B (Secondary BG)
├─ Zinc-800:    #27272A (Tertiary BG)
└─ Zinc-700:    #3F3F46 (Hover state)

Tailwind Classes:
├─ bg-zinc-950  (Main background)
├─ bg-zinc-900  (Card background)
├─ bg-zinc-800  (Hover/Focus background)
└─ bg-transparent (Glass morphism)
```

#### Card Colors

```
Card Standard:
├─ Background:  Zinc-900 (bg-zinc-900)
├─ Border:      Zinc-800 (border-zinc-800)
├─ Shadow:      Shadow-md with zinc tint
└─ Hover:       bg-zinc-800/50 with 2px border-zinc-700

Card Premium/Featured:
├─ Background:  Gradient (from-purple-500/10 to-transparent)
├─ Border:      Purple-600/50
├─ Accent:      Purple-500
└─ Use case:    Pro plans, featured jobs, highlights

Card Glassmorphism:
├─ Background:  bg-white/5 with backdrop-blur-md
├─ Border:      border-white/10
├─ Shadow:      shadow-lg
└─ Use case:    Hero section, floating elements
```

#### Semantic Colors

```
Success (Green):
├─ Background:  bg-emerald-500/10
├─ Border:      border-emerald-500/50
├─ Text:        text-emerald-500
└─ Use case:    Checkmarks, completed status, positive metrics

Warning (Amber):
├─ Background:  bg-amber-500/10
├─ Border:      border-amber-500/50
├─ Text:        text-amber-500
└─ Use case:    Alerts, pending items, caution messages

Danger (Red):
├─ Background:  bg-red-500/10
├─ Border:      border-red-500/50
├─ Text:        text-red-500
└─ Use case:    Errors, rejected status, destructive actions

Info (Blue):
├─ Background:  bg-blue-500/10
├─ Border:      border-blue-500/50
├─ Text:        text-blue-500
└─ Use case:    Information tooltips, blue badges
```

#### Text Colors

```
Primary Text:          text-white (100% opacity)
Secondary Text:        text-zinc-400 (for meta/labels)
Muted Text:           text-zinc-500 (for disabled/muted states)
Subtle Text:          text-zinc-600 (for subtle hints)

Tailwind Classes:
├─ text-foreground       (Primary - inherits white)
├─ text-secondary        (Secondary - zinc-400)
├─ text-muted-foreground (Muted - zinc-500)
└─ text-xs/text-sm/text-base (Size variations)
```

#### Button Colors

```
Primary Button:
├─ bg-purple-500
├─ hover:bg-purple-600
├─ active:bg-purple-700
└─ Tailwind: bg-purple-500 hover:bg-purple-600 transition-colors

Secondary Button:
├─ bg-zinc-800
├─ border-1 border-zinc-700
├─ hover:bg-zinc-700
└─ Tailwind: bg-zinc-800 border border-zinc-700 hover:bg-zinc-700

Ghost Button:
├─ bg-transparent
├─ text-white
├─ hover:bg-zinc-800
└─ Tailwind: bg-transparent hover:bg-zinc-800
```

#### Border & Divider Colors

```
Divider/Border:
├─ Subtle:      border-zinc-800
├─ Medium:      border-zinc-700
├─ Strong:      border-zinc-600
└─ Branded:     border-purple-500/50

Tailwind Classes:
├─ border border-zinc-800
├─ border-t border-zinc-800
├─ divide-zinc-800
└─ ring-1 ring-zinc-800
```

### Color Usage Guidelines

**Context-Based Application:**

| Component | Background | Border | Text | Hover |
|-----------|-----------|--------|------|-------|
| Card | `bg-zinc-900` | `border-zinc-800` | `text-white` | `bg-zinc-800/50` |
| Button (Primary) | `bg-purple-500` | None | `text-white` | `bg-purple-600` |
| Button (Secondary) | `bg-zinc-800` | `border-zinc-700` | `text-white` | `bg-zinc-700` |
| Input Field | `bg-zinc-800` | `border-zinc-700` | `text-white` | `border-zinc-600` |
| Badge | `bg-purple-500/20` | `border-purple-500/50` | `text-purple-400` | `bg-purple-500/30` |
| Success Status | `bg-emerald-500/20` | `border-emerald-500/50` | `text-emerald-400` | Same |
| Warning Status | `bg-amber-500/20` | `border-amber-500/50` | `text-amber-400` | Same |
| Error Status | `bg-red-500/20` | `border-red-500/50` | `text-red-400` | Same |
| NavBar | `bg-zinc-950/80` | `border-zinc-800/50` | `text-white` | `bg-zinc-800` |

---

## 📝 Typography

### Font Family

**Geist** (from Vercel)
- Modern, geometric sans-serif
- Excellent readability
- Weights: Regular (400), Medium (500), Semibold (600), Bold (700)
- CSS: `font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;`

### Type Scale & Line Height

```
H1 (Hero/Page Title)
├─ Size: 36px / 2.25rem
├─ Weight: 700 (Bold)
├─ Line Height: 1.2 (43.2px)
├─ Letter Spacing: -0.02em (tight)
├─ Margin Bottom: 24px
└─ Tailwind: text-4xl font-bold leading-tight -tracking-wide

H2 (Section Heading)
├─ Size: 28px / 1.75rem
├─ Weight: 600 (Semibold)
├─ Line Height: 1.3 (36.4px)
├─ Letter Spacing: -0.01em
├─ Margin Bottom: 16px
└─ Tailwind: text-3xl font-semibold leading-snug

H3 (Subsection)
├─ Size: 22px / 1.375rem
├─ Weight: 600 (Semibold)
├─ Line Height: 1.4 (30.8px)
├─ Margin Bottom: 12px
└─ Tailwind: text-2xl font-semibold leading-relaxed

Body (Default Text)
├─ Size: 16px / 1rem
├─ Weight: 400 (Regular)
├─ Line Height: 1.6 (25.6px)
├─ Letter Spacing: 0
└─ Tailwind: text-base leading-relaxed

Body Small
├─ Size: 14px / 0.875rem
├─ Weight: 400 (Regular)
├─ Line Height: 1.5 (21px)
└─ Tailwind: text-sm leading-normal

Caption/Label
├─ Size: 12px / 0.75rem
├─ Weight: 500 (Medium)
├─ Line Height: 1.4 (16.8px)
├─ Color: text-muted-foreground
└─ Tailwind: text-xs font-medium uppercase tracking-wide

Button Text
├─ Size: 14px / 0.875rem
├─ Weight: 500 (Medium)
└─ Tailwind: text-sm font-medium

Mono/Code
├─ Size: 13px / 0.8125rem
├─ Font: 'JetBrains Mono', 'Courier New', monospace
├─ Weight: 400
├─ Use: Code snippets, terminal output, API responses
└─ Tailwind: font-mono text-sm bg-zinc-800/50 px-2 py-1 rounded
```

### Text Styles

**Heading Hierarchy Example:**

```html
<!-- H1 - Main page title -->
<h1 class="text-4xl font-bold leading-tight -tracking-wide">
  Optimize Your Career
</h1>

<!-- H2 - Section title -->
<h2 class="text-3xl font-semibold leading-snug mt-12 mb-8">
  Key Features
</h2>

<!-- H3 - Subsection -->
<h3 class="text-2xl font-semibold leading-relaxed mt-6 mb-4">
  Resume Analysis
</h3>

<!-- Body text -->
<p class="text-base leading-relaxed text-foreground">
  Get instant ATS scores and optimization recommendations.
</p>

<!-- Small text / Meta -->
<p class="text-sm text-muted-foreground">
  Last updated 5 minutes ago
</p>

<!-- Caption / Label -->
<span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
  Pro Feature
</span>
```

### Font Loading

```css
/* Use system fonts with Geist fallback */
@import url('https://rsms.me/inter/inter.css');

/* Custom font loading if using Geist CDN */
@font-face {
  font-family: 'Geist';
  src: url('/fonts/geist/Geist-Regular.woff2') format('woff2');
  font-weight: 400;
}

@font-face {
  font-family: 'Geist';
  src: url('/fonts/geist/Geist-Bold.woff2') format('woff2');
  font-weight: 700;
}

/* Tailwind config */
module.exports = {
  theme: {
    fontFamily: {
      sans: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
  },
};
```

---

## 📐 Spacing & Layout

### Spacing Scale

AXIOM uses a **8px base unit** with a generous spacing scale:

```
xs:    4px   (0.25rem)   - Tight spacing, rarely used
sm:    8px   (0.5rem)    - Small gaps between elements
md:    16px  (1rem)      - Default element spacing
lg:    24px  (1.5rem)    - Section internal spacing
xl:    32px  (2rem)      - Between major sections
2xl:   48px  (3rem)      - Large section gaps
3xl:   64px  (4rem)      - Page-level spacing

Tailwind Classes:
p-2  = 8px     (padding)
p-4  = 16px    (padding)
p-6  = 24px    (padding)
p-8  = 32px    (padding)
gap-4 = 16px   (flex gap)
gap-6 = 24px   (flex gap)
</blockquote>

mt-12 = 48px   (margin-top)
mb-16 = 64px   (margin-bottom)
```

### Container & Page Layout

```
Page Layout:
├─ Max Width: 1280px (xl container)
├─ Padding X: 24px (px-6)
├─ Padding Y: 48px (py-12) for sections
└─ Tailwind: container mx-auto px-6 py-12

Section Spacing:
├─ Between Sections: 64px gap (my-8 or py-8)
├─ Section Padding: 48px-64px vertical
└─ Create visual breathing room

Card Padding:
├─ Standard Card: 24px (p-6)
├─ Compact Card: 16px (p-4)
└─ Large Card: 32px (p-8)

Grid Layout:
├─ Desktop: 3-column grid
├─ Tablet: 2-column grid
├─ Mobile: 1-column (stacked)
└─ Gap: 24px (gap-6)
```

### Common Layout Patterns

**Hero Section Layout:**
```html
<section class="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative">
  <div class="max-w-4xl mx-auto text-center">
    <!-- Hero content -->
  </div>
  <!-- Animated background elements -->
</section>
```

**Feature Grid:**
```html
<section class="py-12 px-6">
  <div class="container mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Feature cards -->
    </div>
  </div>
</section>
```

**Two-Column Layout:**
```html
<section class="py-12 px-6">
  <div class="container mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div><!-- Left content --></div>
      <div><!-- Right content --></div>
    </div>
  </div>
</section>
```

---

## 🧩 Components Specifications

### Button Variants

**Primary Button** (Call-to-action)
```tsx
<Button 
  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200"
>
  Get Started
</Button>

// Tailwind: bg-purple-500 hover:bg-purple-600 text-white 
//           px-6 py-2.5 rounded-lg font-medium transition-colors
```

**Secondary Button**
```tsx
<Button 
  variant="outline"
  className="border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white"
>
  Learn More
</Button>
```

**Ghost Button**
```tsx
<Button 
  variant="ghost"
  className="text-white hover:bg-zinc-800 transition-colors"
>
  View Details
</Button>
```

**Button Sizes:**
```
Small:    px-3 py-1.5 text-xs
Medium:   px-4 py-2 text-sm (default)
Large:    px-6 py-2.5 text-base
XLarge:   px-8 py-3 text-lg (full-width CTAs)
```

### Card Component

**Standard Card:**
```tsx
<Card className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all duration-200">
  <CardHeader>
    <CardTitle>Resume Analysis</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Card content */}
  </CardContent>
</Card>

// Tailwind: border border-zinc-800 bg-zinc-900 rounded-2xl p-6
//           hover:border-zinc-700 hover:bg-zinc-800/50 
//           transition-all duration-200
```

**Featured/Premium Card:**
```tsx
<Card className="border border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl p-6 relative overflow-hidden">
  <div className="absolute inset-0 border border-purple-500/30 rounded-2xl pointer-events-none" />
  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 mb-4">
    Pro
  </Badge>
  {/* Card content */}
</Card>
```

**Glassmorphism Card (Hero Section):**
```tsx
<div className="border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl p-8 shadow-lg">
  {/* Content with glassmorphism effect */}
</div>

// Tailwind: border border-white/10 bg-white/5 backdrop-blur-md 
//           rounded-2xl p-8 shadow-lg
```

### Badge Component

```tsx
// Default Badge
<Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/50 rounded-full px-3 py-1 text-xs font-medium">
  New Feature
</Badge>

// Status Badge - Success
<Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50">
  ✓ Verified
</Badge>

// Status Badge - Warning
<Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/50">
  ⚠ Pending
</Badge>

// Status Badge - Error
<Badge className="bg-red-500/20 text-red-400 border border-red-500/50">
  ✕ Rejected
</Badge>
```

### Input Field

```tsx
<input 
  type="text"
  placeholder="Search jobs, skills..."
  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-colors duration-200"
/>

// Tailwind: bg-zinc-800 border border-zinc-700 rounded-lg 
//           focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50
```

### Progress Bar

```tsx
<Progress 
  value={73} 
  className="h-2 bg-zinc-800 rounded-full"
/>

// For visual feedback with color:
<div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
  <div 
    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
    style={{ width: '73%' }}
  />
</div>
```

### Tag Component

```tsx
<span className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-xs font-medium text-zinc-300 hover:border-zinc-600 cursor-pointer transition-colors">
  React
  <button className="ml-1 text-zinc-500 hover:text-zinc-300">×</button>
</span>
```

---

## 🧭 Navbar

### Design Specifications

**Layout & Structure:**
- Sticky positioning (fixed to top)
- Height: 64px (h-16)
- Transparent with glassmorphism effect
- Responsive: Horizontal on desktop, hamburger on mobile
- Inspiration: Linear, Vercel, Clerk

**Desktop Navbar:**
```
[Logo] [Nav Menu] ............. [Theme Toggle] [Sign In] [Get Started]
```

**Navbar CSS:**
```html
<nav className="sticky top-0 z-50 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50 transition-all duration-300">
  <div className="container mx-auto px-6 h-16 flex items-center justify-between">
    <!-- Navbar content -->
  </div>
</nav>

// Tailwind Classes:
// sticky top-0 z-50 = Fixed positioning
// bg-zinc-950/80 backdrop-blur-md = Glassmorphism
// border-b border-zinc-800/50 = Subtle bottom border
// h-16 = 64px height
```

### Components & Sections

**Logo & Branding:**
```tsx
<div className="flex items-center gap-2">
  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
    <span className="text-white font-bold text-lg">A</span>
  </div>
  <span className="font-bold text-lg text-white hidden sm:inline">AXIOM</span>
</div>
```

**Navigation Menu (Desktop):**
```tsx
<NavigationMenu className="hidden md:flex">
  <NavigationMenuList className="gap-8">
    <NavigationMenuItem>
      <Link href="/features">Features</Link>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <Link href="/pricing">Pricing</Link>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger>Product</DropdownMenuTrigger>
        <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
          {/* Menu items */}
        </DropdownMenuContent>
      </DropdownMenu>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <Link href="/docs">Documentation</Link>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>

// Styling: text-sm text-zinc-300 hover:text-white 
//          transition-colors duration-200
```

**Right Section (Actions):**
```tsx
<div className="flex items-center gap-4">
  {/* Theme Toggle */}
  <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
    <Moon className="w-5 h-5" />
  </Button>

  {/* Sign In Button */}
  <Button variant="ghost" className="hidden sm:inline-flex text-zinc-300 hover:text-white">
    Sign In
  </Button>

  {/* Get Started Button (CTA) */}
  <Button className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-lg font-medium text-sm hidden sm:inline-flex">
    Get Started
  </Button>

  {/* Mobile Menu */}
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="w-5 h-5" />
      </Button>
    </SheetTrigger>
    <SheetContent className="bg-zinc-900 border-zinc-800">
      {/* Mobile menu items */}
    </SheetContent>
  </Sheet>
</div>
```

**Mobile Navigation (Sheet):**
```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon">
      <Menu className="w-5 h-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-full sm:w-80 bg-zinc-900 border-l border-zinc-800 p-0">
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b border-zinc-800">
        <span className="font-bold text-lg">Menu</span>
        <SheetClose />
      </div>
      <nav className="flex-1 overflow-y-auto p-6 space-y-4">
        <Link href="#" className="block text-sm text-zinc-300 hover:text-white">Features</Link>
        <Link href="#" className="block text-sm text-zinc-300 hover:text-white">Pricing</Link>
        <Link href="#" className="block text-sm text-zinc-300 hover:text-white">Docs</Link>
        <Separator className="bg-zinc-800" />
        <Button className="w-full bg-purple-500 hover:bg-purple-600">Get Started</Button>
      </nav>
    </div>
  </SheetContent>
</Sheet>
```

**Responsive Design:**
```
Desktop (lg+):     Full horizontal menu + all buttons visible
Tablet (md-lg):    Navigation menu visible, some buttons hidden
Mobile (sm-):      Hamburger menu, essential buttons only in navbar
```

---

## 🏠 Landing Page

Landing page inspiration: **Linear, Vercel, Stripe**

### Hero Section

**Purpose:** First impression, brand communication, primary CTA

**Layout & Structure:**
```html
<section class="relative min-h-screen flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
  <!-- Animated background elements -->
  <div class="max-w-4xl mx-auto text-center space-y-8">
    <!-- Hero headline, subheadline, buttons, visuals -->
  </div>
</section>

// Tailwind: relative min-h-screen flex flex-col items-center 
//           justify-center px-6 py-12 overflow-hidden
```

**Background Design:**
```tsx
// Animated glow background
<div className="absolute inset-0 overflow-hidden">
  {/* Animated gradient orbs */}
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
  <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
  <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
</div>

// Position: absolute, z-index: -1, blend-mode: multiply or screen
```

**Headline:**
```tsx
<h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight -tracking-wide">
  <span className="text-white">Your AI Career</span>
  <br />
  <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
    Copilot
  </span>
</h1>

// Animated gradient text
// Tailwind: text-6xl font-bold leading-tight -tracking-wide
//           bg-gradient-to-r from-purple-400 via-purple-500 to-blue-500
//           bg-clip-text text-transparent
```

**Subheadline:**
```tsx
<p className="text-xl sm:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
  Analyze your resume, find matching jobs, improve your skills, and land your dream role with AI-powered insights.
</p>

// Tailwind: text-xl text-zinc-400 max-w-2xl mx-auto
```

**CTA Buttons:**
```tsx
<div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
  <Button className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 text-lg rounded-lg font-medium">
    Get Started Free
  </Button>
  <Button variant="outline" className="border border-zinc-700 bg-transparent hover:bg-zinc-800 text-white px-8 py-3 text-lg rounded-lg font-medium">
    Watch Demo
  </Button>
</div>

// Spacing: gap-4 between buttons
// Size: Large buttons for primary CTA
```

**Floating Cards Animation:**
```tsx
<div className="absolute inset-0 pointer-events-none overflow-hidden">
  {/* Floating feature cards */}
  <motion.div
    className="absolute top-20 left-10 w-48 h-32 bg-gradient-to-br from-emerald-500/20 to-transparent border border-emerald-500/30 rounded-2xl p-6 shadow-lg"
    animate={{ y: [0, -20, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
  >
    <div className="text-xs font-medium text-emerald-400 mb-2">ATS Score</div>
    <div className="text-3xl font-bold text-white">87%</div>
  </motion.div>
  
  {/* More floating cards positioned absolutely */}
</div>

// Inspiration: Vercel, Linear
// Using Framer Motion for animations
```

**Company Logos Section:**
```tsx
<div className="mt-16 pt-8 border-t border-zinc-800">
  <p className="text-sm text-zinc-400 text-center mb-8">Trusted by professionals at:</p>
  <div className="flex items-center justify-center gap-8 flex-wrap">
    {/* Company logos in grayscale, hover to color */}
    {['google', 'microsoft', 'amazon', 'stripe', 'vercel'].map(company => (
      <div key={company} className="grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100">
        <img src={`/logos/${company}.svg`} alt={company} className="h-8" />
      </div>
    ))}
  </div>
</div>

// Grayscale filter with hover effect
// Inspiration: Stripe, Linear
```

---

### Features Section

**Section Structure:**
```html
<section class="py-24 px-6 relative">
  <div class="container mx-auto">
    <div class="text-center mb-16 space-y-4">
      <Badge>Key Features</Badge>
      <h2 class="text-5xl font-bold">Everything you need to land your dream job</h2>
      <p class="text-xl text-zinc-400 max-w-2xl mx-auto">
        Comprehensive AI tools for resume optimization, job discovery, and career growth.
      </p>
    </div>

    <!-- Feature grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Feature cards */}
    </div>
  </div>
</section>

// Tailwind: py-24 px-6 relative container mx-auto
```

**Feature Cards:**
```tsx
<Card className="group border border-zinc-800 bg-zinc-900 rounded-2xl p-8 hover:border-purple-500/50 hover:bg-zinc-800/50 transition-all duration-300">
  <div className="flex items-start gap-4 mb-6">
    <div className="flex-shrink-0">
      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
        {/* Icon */}
        <Zap className="h-6 w-6 text-purple-400" />
      </div>
    </div>
  </div>
  
  <h3 className="text-xl font-semibold text-white mb-3">Resume Analyzer</h3>
  <p className="text-zinc-400 leading-relaxed mb-4">
    Get instant ATS scores, keyword analysis, and optimization recommendations.
  </p>
  
  <div className="flex items-center text-purple-400 hover:text-purple-300 transition-colors cursor-pointer text-sm font-medium">
    Learn more
    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
  </div>
</Card>

// Tailwind: group border border-zinc-800 bg-zinc-900 rounded-2xl p-8
//           hover:border-purple-500/50 hover:bg-zinc-800/50 
//           transition-all duration-300
```

**Features List:**
- Resume Analyzer
- Job Matching Engine
- AI Career Copilot
- Interview Question Generator
- Analytics Dashboard
- Cover Letter Generator
- Application Tracker
- Skill Gap Detection

---

### Resume Analyzer Showcase

**Two-Column Layout:**
```html
<section class="py-24 px-6">
  <div class="container mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Left: Resume Upload UI -->
      <!-- Right: Results Display -->
    </div>
  </div>
</section>

// Tailwind: grid grid-cols-1 lg:grid-cols-2 gap-12 items-center
```

**Left Side - Resume Upload:**
```tsx
<div className="space-y-6">
  <div>
    <h2 className="text-4xl font-bold text-white mb-4">
      Optimize Your Resume in Seconds
    </h2>
    <p className="text-lg text-zinc-400">
      Upload your resume and get instant feedback on ATS compatibility, design, and content quality.
    </p>
  </div>

  <Card className="border-2 border-dashed border-zinc-700 bg-zinc-900/50 rounded-2xl p-12 hover:border-purple-500/50 transition-colors cursor-pointer">
    <div className="flex flex-col items-center justify-center text-center">
      <Upload className="w-12 h-12 text-zinc-500 mb-4" />
      <p className="text-white font-semibold mb-2">Drag & drop your resume</p>
      <p className="text-sm text-zinc-400 mb-4">or click to browse</p>
      <p className="text-xs text-zinc-500">PDF, DOCX (max 5MB)</p>
    </div>
  </Card>

  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <CheckCircle className="w-5 h-5 text-emerald-500" />
      <span className="text-zinc-300">ATS score in seconds</span>
    </div>
    <div className="flex items-center gap-3">
      <CheckCircle className="w-5 h-5 text-emerald-500" />
      <span className="text-zinc-300">Skill extraction</span>
    </div>
  </div>
</div>

// Layout: Space elements vertically
// Upload card: Dashed border, hover state
// Check marks: Small icons with text
```

**Right Side - Results Display:**
```tsx
<div className="space-y-6">
  {/* ATS Score Card */}
  <Card className="border border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl p-8">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-white">ATS Score</h3>
      <Badge className="bg-emerald-500/20 text-emerald-400">Excellent</Badge>
    </div>

    <div className="flex items-center justify-center mb-6">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="64" cy="64" r="56" fill="none" stroke="#27272a" strokeWidth="8" />
          <circle 
            cx="64" cy="64" r="56" 
            fill="none" 
            stroke="url(#gradient)" 
            strokeWidth="8"
            strokeDasharray={`${352 * 0.87} 352`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-4xl font-bold text-white">87%</span>
          <span className="text-sm text-zinc-400">Score</span>
        </div>
      </div>
    </div>
  </Card>

  {/* Strengths & Weaknesses */}
  <div className="grid grid-cols-2 gap-4">
    <Card className="border border-emerald-500/30 bg-emerald-500/10 rounded-2xl p-6">
      <h4 className="text-sm font-semibold text-emerald-400 mb-3">Strengths</h4>
      <ul className="space-y-2">
        <li className="flex items-center gap-2 text-sm text-emerald-300">
          <CheckCircle2 className="w-4 h-4" /> React
        </li>
        <li className="flex items-center gap-2 text-sm text-emerald-300">
          <CheckCircle2 className="w-4 h-4" /> Node.js
        </li>
      </ul>
    </Card>

    <Card className="border border-amber-500/30 bg-amber-500/10 rounded-2xl p-6">
      <h4 className="text-sm font-semibold text-amber-400 mb-3">Missing Skills</h4>
      <ul className="space-y-2">
        <li className="flex items-center gap-2 text-sm text-amber-300">
          <AlertCircle className="w-4 h-4" /> AWS
        </li>
        <li className="flex items-center gap-2 text-sm text-amber-300">
          <AlertCircle className="w-4 h-4" /> Kafka
        </li>
      </ul>
    </Card>
  </div>
</div>

// Circular progress chart: SVG-based visualization
// Card with gradient: Purple brand color
// Split cards: Strengths (green) vs Weaknesses (amber)
```

---

### Job Search Showcase

**Section Layout:**
```tsx
<section className="py-24 px-6 bg-gradient-to-b from-zinc-900 to-zinc-950">
  <div className="container mx-auto space-y-12">
    <div className="text-center space-y-4 mb-12">
      <h2 className="text-4xl font-bold">Find Your Perfect Role</h2>
      <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
        Smart filters, semantic matching, and real-time job notifications.
      </p>
    </div>

    {/* Search bar & filters */}
    <div className="space-y-6">
      {/* Search UI */}
      {/* Job listing table */}
    </div>
  </div>
</section>
```

**Search Bar with Filters:**
```tsx
<div className="space-y-4">
  {/* Main Search Input */}
  <div className="relative">
    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
    <input
      type="text"
      placeholder="Search job titles, companies, skills..."
      className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
    />
  </div>

  {/* Filter Tags */}
  <div className="flex flex-wrap gap-3">
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white hover:bg-zinc-700 transition-colors">
          Experience Level
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
          <DropdownMenuItem>Entry Level</DropdownMenuItem>
          <DropdownMenuItem>Mid Level</DropdownMenuItem>
          <DropdownMenuItem>Senior</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div>
      <DropdownMenu>
        <DropdownMenuTrigger className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white hover:bg-zinc-700 transition-colors">
          Job Type
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
          <DropdownMenuItem>Full-time</DropdownMenuItem>
          <DropdownMenuItem>Contract</DropdownMenuItem>
          <DropdownMenuItem>Internship</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    {/* More filters */}
  </div>
</div>

// Inspiration: Stripe, Linear job boards
// Search icon: Lucide Icons
// Dropdown: Shadcn DropdownMenu
```

**Job Listing Table:**
```tsx
<Card className="border border-zinc-800 bg-zinc-900 rounded-2xl overflow-hidden">
  <Table>
    <TableHeader className="bg-zinc-800/50 border-b border-zinc-800">
      <TableRow>
        <TableHead className="text-zinc-300">Company</TableHead>
        <TableHead className="text-zinc-300">Role</TableHead>
        <TableHead className="text-zinc-300">Match</TableHead>
        <TableHead className="text-zinc-300">Location</TableHead>
        <TableHead className="text-right text-zinc-300">Action</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {jobs.map(job => (
        <TableRow key={job.id} className="hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50">
          <TableCell className="font-medium text-white">{job.company}</TableCell>
          <TableCell className="text-white">{job.title}</TableCell>
          <TableCell>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
              92% Match
            </Badge>
          </TableCell>
          <TableCell className="text-zinc-400">{job.location}</TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white">
                <Heart className="w-4 h-4" />
              </Button>
              <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                View
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</Card>

// Tailwind: Table styling with bg-zinc-800/50 hover states
// Match badge: Green for high match scores
// Heart icon: Save/bookmark functionality
```

**Pagination:**
```tsx
<div className="flex items-center justify-between pt-6 border-t border-zinc-800">
  <p className="text-sm text-zinc-400">
    Showing 1-10 of 1,245 jobs
  </p>
  <div className="flex gap-2">
    <Button variant="outline" size="sm">Previous</Button>
    {[1, 2, 3, 4, 5].map(page => (
      <Button key={page} variant={page === 1 ? 'default' : 'outline'} size="sm">
        {page}
      </Button>
    ))}
    <Button variant="outline" size="sm">Next</Button>
  </div>
</div>
```

---

### AI Chatbot Section

**Layout:**
```tsx
<section className="py-24 px-6">
  <div className="container mx-auto">
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold">Meet Your AI Career Copilot</h2>
        <p className="text-lg text-zinc-400">
          Ask questions about your career, resume, interviews, and skills.
        </p>
      </div>

      {/* Chatbot preview */}
    </div>
  </div>
</section>
```

**Chat Window Preview:**
```tsx
<Card className="border border-zinc-800 bg-zinc-900 rounded-2xl p-1 shadow-2xl flex flex-col h-[500px]">
  {/* Chat header */}
  <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
    <div>
      <h3 className="font-semibold text-white">Career Copilot</h3>
      <p className="text-xs text-zinc-400">Always online</p>
    </div>
    <Button size="sm" variant="ghost">
      <X className="w-4 h-4" />
    </Button>
  </div>

  {/* Chat messages */}
  <ScrollArea className="flex-1 p-6 space-y-4">
    {/* User message */}
    <div className="flex justify-end">
      <div className="bg-purple-600 text-white rounded-2xl rounded-tr-none px-4 py-2 max-w-xs text-sm">
        How do I become a data engineer?
      </div>
    </div>

    {/* AI response with animation */}
    <div className="flex justify-start">
      <div className="bg-zinc-800 text-white rounded-2xl rounded-tl-none px-4 py-2 max-w-xs text-sm space-y-2">
        <p>To become a data engineer, focus on:</p>
        <ul className="text-xs space-y-1 ml-4">
          <li>• SQL & database design</li>
          <li>• Python or Java programming</li>
          <li>• Data pipelines (Kafka, Airflow)</li>
          <li>• Cloud platforms (AWS, GCP)</li>
        </ul>
      </div>
    </div>

    {/* Typing indicator */}
    <div className="flex justify-start pt-2">
      <div className="flex gap-2">
        <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
        <div className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" style={{animationDelay: '0.4s'}} />
      </div>
    </div>
  </ScrollArea>

  {/* Chat input */}
  <div className="border-t border-zinc-800 px-6 py-4">
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Ask anything..."
        className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-purple-500"
      />
      <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
        <Send className="w-4 h-4" />
      </Button>
    </div>
  </div>
</Card>

// ScrollArea: Framer Motion for smooth scrolling
// Typing animation: Three bouncing dots
// Message bubbles: User (purple, right) vs AI (zinc, left)
```

**Example Prompts:**
```tsx
<div className="mt-8 space-y-3">
  <p className="text-sm text-zinc-400 text-center mb-4">Common questions:</p>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {[
      "How do I improve my ATS score?",
      "What skills should I learn?",
      "How do I prepare for interviews?",
      "What's my match for this role?"
    ].map((prompt, idx) => (
      <button
        key={idx}
        className="text-left px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700 hover:border-zinc-600 transition-colors cursor-pointer"
      >
        {prompt}
      </button>
    ))}
  </div>
</div>

// Grid: 1 column on mobile, 2 columns on desktop
// Hover: Subtle color change
```

---

### Analytics Preview Section

**Layout:**
```tsx
<section className="py-24 px-6 bg-gradient-to-b from-zinc-950 to-zinc-900">
  <div className="container mx-auto">
    <div className="text-center space-y-4 mb-16">
      <h2 className="text-4xl font-bold">Track Your Career Growth</h2>
      <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
        Beautiful dashboards to visualize your progress and insights.
      </p>
    </div>

    {/* Analytics grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Charts and stats */}
    </div>
  </div>
</section>
```

**Stats Cards:**
```tsx
<Card className="border border-zinc-800 bg-zinc-900 rounded-2xl p-8">
  <div className="flex items-center justify-between mb-6">
    <h3 className="text-sm font-medium text-zinc-400 uppercase">Applications Sent</h3>
    <TrendingUp className="w-5 h-5 text-emerald-500" />
  </div>
  <div className="space-y-2">
    <p className="text-4xl font-bold text-white">127</p>
    <p className="text-sm text-zinc-400">
      <span className="text-emerald-400">+23%</span> from last month
    </p>
  </div>
</Card>

// Icon: Trending up for positive metrics
// Large number: Prominent display
// Smaller text: Context and trend
```

**Chart Preview:**
```tsx
<Card className="border border-zinc-800 bg-zinc-900 rounded-2xl p-8 lg:col-span-2">
  <h3 className="text-lg font-semibold text-white mb-6">Application Trends</h3>
  <LineChart width={400} height={300} data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
    <XAxis dataKey="month" stroke="#71717a" />
    <YAxis stroke="#71717a" />
    <Tooltip contentStyle={{backgroundColor: '#27272a', border: '1px solid #3f3f46'}} />
    <Line type="monotone" dataKey="applications" stroke="#a855f7" strokeWidth={2} dot={false} />
  </LineChart>
</Card>

// Recharts: Customized with dark theme colors
// Grid: Subtle 27272a color
// Line: Purple brand color
```

---

### Pricing Section

**Layout:**
```tsx
<section className="py-24 px-6">
  <div className="container mx-auto">
    <div className="text-center space-y-4 mb-16">
      <Badge>Simple Pricing</Badge>
      <h2 className="text-4xl font-bold">Choose Your Plan</h2>
      <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
        Flexible pricing for everyone, from students to enterprises.
      </p>
    </div>

    {/* Pricing cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
      {/* Plan cards */}
    </div>
  </div>
</section>
```

**Pricing Cards:**
```tsx
{/* Free Plan */}
<Card className="border border-zinc-800 bg-zinc-900 rounded-2xl p-8 hover:border-zinc-700 transition-colors">
  <h3 className="text-xl font-semibold text-white mb-2">Free</h3>
  <p className="text-sm text-zinc-400 mb-6">For getting started</p>
  
  <div className="mb-8">
    <p className="text-4xl font-bold text-white">$0</p>
    <p className="text-sm text-zinc-400 mt-2">Forever free</p>
  </div>

  <Button variant="outline" className="w-full mb-8">
    Get Started
  </Button>

  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <Check className="w-5 h-5 text-emerald-500" />
      <span className="text-sm text-zinc-300">Resume analysis</span>
    </div>
    <div className="flex items-center gap-3">
      <Check className="w-5 h-5 text-emerald-500" />
      <span className="text-sm text-zinc-300">Job search</span>
    </div>
    <div className="flex items-center gap-3">
      <X className="w-5 h-5 text-zinc-600" />
      <span className="text-sm text-zinc-500">AI copilot</span>
    </div>
  </div>
</Card>

{/* Pro Plan (Highlighted) */}
<Card className="border-2 border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl p-8 relative overflow-hidden scale-105">
  <div className="absolute top-6 right-6">
    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
      Most Popular
    </Badge>
  </div>

  <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
  <p className="text-sm text-zinc-400 mb-6">For professionals</p>
  
  <div className="mb-8">
    <p className="text-4xl font-bold text-white">$9<span className="text-lg text-zinc-400">/mo</span></p>
  </div>

  <Button className="w-full mb-8 bg-purple-500 hover:bg-purple-600">
    Start Free Trial
  </Button>

  <div className="space-y-4">
    {/* All features + premium features */}
  </div>
</Card>

{/* Enterprise Plan */}
<Card className="border border-zinc-800 bg-zinc-900 rounded-2xl p-8">
  <h3 className="text-xl font-semibold text-white mb-2">Enterprise</h3>
  <p className="text-sm text-zinc-400 mb-6">For teams</p>
  
  <div className="mb-8">
    <p className="text-4xl font-bold text-white">Custom</p>
    <p className="text-sm text-zinc-400 mt-2">per seat</p>
  </div>

  <Button variant="outline" className="w-full mb-8">
    Contact Sales
  </Button>
</Card>

// Pro plan: Border-2 with purple, scale-105 for emphasis
// Most Popular badge: Positioned absolutely at top right
// Feature list: Check/X marks with color coding
```

---

### FAQ Section

**Layout:**
```tsx
<section className="py-24 px-6">
  <div className="container mx-auto max-w-2xl">
    <div className="text-center space-y-4 mb-16">
      <h2 className="text-4xl font-bold">Frequently Asked Questions</h2>
    </div>

    <Accordion type="single" collapsible className="space-y-4">
      {/* FAQ items */}
    </Accordion>
  </div>
</section>
```

**Accordion Items:**
```tsx
<AccordionItem value="item-1" className="border border-zinc-800 rounded-2xl px-6 overflow-hidden hover:border-zinc-700 transition-colors">
  <AccordionTrigger className="py-4 text-white hover:text-purple-400 transition-colors">
    <span className="text-left text-base font-medium">How accurate is the ATS score?</span>
  </AccordionTrigger>
  <AccordionContent className="text-zinc-300 pb-4">
    Our ATS scoring is based on industry-standard algorithms used by major HR software. We analyze formatting, keywords, structure, and readability to provide accurate feedback. Most users see improvements of 15-30 points after following recommendations.
  </AccordionContent>
</AccordionItem>

// Accordion: Smooth animation on expand/collapse
// Border: Subtle gray with hover effect
// Icon: ChevronDown rotates on open
```

---

### Footer

**Layout:**
```tsx
<footer className="border-t border-zinc-800 bg-zinc-950 py-16 px-6">
  <div className="container mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
      {/* Footer columns */}
    </div>

    {/* Footer bottom */}
    <Separator className="bg-zinc-800" />
    <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Copyright, socials, theme toggle */}
    </div>
  </div>
</footer>

// Tailwind: border-t border-zinc-800 bg-zinc-950 py-16
```

**Footer Columns:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-12">
  {/* Column 1: Logo & Branding */}
  <div>
    <div className="flex items-center gap-2 mb-6">
      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold">A</span>
      </div>
      <span className="font-bold text-white">AXIOM</span>
    </div>
    <p className="text-sm text-zinc-400">
      AI-powered career platform for job search, resume optimization, and growth.
    </p>
  </div>

  {/* Column 2: Product */}
  <div className="space-y-4">
    <h4 className="font-semibold text-white">Product</h4>
    <ul className="space-y-2">
      <li><Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</Link></li>
      <li><Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</Link></li>
      <li><Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Changelog</Link></li>
    </ul>
  </div>

  {/* Column 3: Company */}
  <div className="space-y-4">
    <h4 className="font-semibold text-white">Company</h4>
    <ul className="space-y-2">
      <li><Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">About</Link></li>
      <li><Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Blog</Link></li>
      <li><Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Careers</Link></li>
    </ul>
  </div>

  {/* Column 4: Legal & Social */}
  <div className="space-y-4">
    <h4 className="font-semibold text-white">Legal</h4>
    <ul className="space-y-2">
      <li><Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Privacy</Link></li>
      <li><Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Terms</Link></li>
      <li><Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Contact</Link></li>
    </ul>
  </div>
</div>

// Footer links: Subtle gray with white hover
// Column headers: Bold white text
```

**Footer Bottom:**
```tsx
<div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
  <p className="text-sm text-zinc-400">
    © 2026 AXIOM. All rights reserved.
  </p>

  <div className="flex items-center gap-6">
    {/* Social links */}
    <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
      <Github className="w-5 h-5" />
    </Link>
    <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
      <Twitter className="w-5 h-5" />
    </Link>
    <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
      <Linkedin className="w-5 h-5" />
    </Link>
  </div>

  {/* Newsletter signup */}
  <div className="flex gap-2">
    <input
      type="email"
      placeholder="your@email.com"
      className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:border-purple-500"
    />
    <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
      Subscribe
    </Button>
  </div>

  {/* Theme toggle */}
  <Button variant="ghost" size="icon" onClick={toggleTheme}>
    <Sun className="w-5 h-5" />
  </Button>
</div>

// Social links: Grayscale hover effect
// Newsletter: Inline form with minimal styling
// Theme toggle: Icon button
```

---

## 🔐 Authentication Pages

### General Styling

All auth pages follow this structure:

```
┌─ Navbar (minimal) ──────┐
│                          │
│  ┌──────────────────┐   │
│  │  Card (centered) │   │
│  │  - Logo          │   │
│  │  - Form fields   │   │
│  │  - Submit button │   │
│  │  - Link to other │   │
│  │    auth page     │   │
│  └──────────────────┘   │
│                          │
└──────────────────────────┘
```

**Common Elements:**
```tsx
// Centered layout
<div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-zinc-950">
  <Navbar />
  
  <div className="w-full max-w-md">
    <Card className="border border-zinc-800 bg-zinc-900 rounded-2xl p-8">
      {/* Auth form content */}
    </Card>
  </div>
</div>

// Tailwind: min-h-screen flex flex-col items-center justify-center
//           px-6 py-12 bg-zinc-950 max-w-md mx-auto
```

### Login Page

**URL:** `/auth/login`

**Layout:**
```tsx
<Card className="border border-zinc-800 bg-zinc-900 rounded-2xl p-8 space-y-8">
  {/* Header */}
  <div className="text-center space-y-2">
    <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
    <p className="text-sm text-zinc-400">
      Sign in to your account to continue
    </p>
  </div>

  {/* Login form */}
  <form className="space-y-5">
    <div className="space-y-2">
      <Label htmlFor="email" className="text-sm font-medium text-white">
        Email Address
      </Label>
      <input
        id="email"
        type="email"
        placeholder="you@example.com"
        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="password" className="text-sm font-medium text-white">
        Password
      </Label>
      <input
        id="password"
        type="password"
        placeholder="••••••••"
        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
      />
    </div>

    <div className="flex items-center justify-between pt-2">
      <label className="flex items-center gap-2">
        <input type="checkbox" className="w-4 h-4 rounded border-zinc-700" />
        <span className="text-sm text-zinc-300">Remember me</span>
      </label>
      <Link href="/auth/forgot-password" className="text-sm text-purple-400 hover:text-purple-300">
        Forgot password?
      </Link>
    </div>

    <Button type="submit" className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2.5 rounded-lg font-medium">
      Sign In
    </Button>
  </form>

  <Separator className="bg-zinc-800" />

  {/* OAuth Buttons */}
  <div className="space-y-3">
    <Button variant="outline" className="w-full border border-zinc-700 bg-transparent hover:bg-zinc-800">
      <Google className="w-5 h-5 mr-2" /> Continue with Google
    </Button>
  </div>

  {/* Link to signup */}
  <p className="text-center text-sm text-zinc-400">
    Don't have an account?{' '}
    <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-medium">
      Sign up
    </Link>
  </p>
</Card>

// Form spacing: space-y-5 between fields
// Button: Full width, large padding
// Links: Purple accent color
```

### Sign Up Page

**URL:** `/auth/signup`

**Layout:**
```tsx
<Card className="border border-zinc-800 bg-zinc-900 rounded-2xl p-8 space-y-8 max-w-md">
  {/* Header */}
  <div className="text-center space-y-2">
    <h1 className="text-3xl font-bold text-white">Create Account</h1>
    <p className="text-sm text-zinc-400">
      Start your career journey with AXIOM
    </p>
  </div>

  {/* Signup form */}
  <form className="space-y-5">
    {/* Name field */}
    <div className="space-y-2">
      <Label htmlFor="name" className="text-sm font-medium text-white">
        Full Name
      </Label>
      <input
        id="name"
        type="text"
        placeholder="John Doe"
        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg"
      />
    </div>

    {/* Email field */}
    <div className="space-y-2">
      <Label htmlFor="email" className="text-sm font-medium text-white">
        Email Address
      </Label>
      <input
        id="email"
        type="email"
        placeholder="you@example.com"
        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg"
      />
      <p className="text-xs text-zinc-500">We'll send a verification email</p>
    </div>

    {/* Password field with requirements */}
    <div className="space-y-2">
      <Label htmlFor="password" className="text-sm font-medium text-white">
        Password
      </Label>
      <input
        id="password"
        type="password"
        placeholder="••••••••"
        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg"
      />
      <ul className="text-xs text-zinc-500 space-y-1 mt-2">
        <li className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> At least 8 characters
        </li>
        <li className="flex items-center gap-2">
          <X className="w-4 h-4" /> One uppercase letter
        </li>
      </ul>
    </div>

    {/* Terms */}
    <div className="flex items-start gap-2">
      <input
        type="checkbox"
        id="terms"
        className="w-4 h-4 rounded border-zinc-700 mt-1"
      />
      <label htmlFor="terms" className="text-xs text-zinc-400">
        I agree to the{' '}
        <Link href="#" className="text-purple-400 hover:text-purple-300">
          Terms of Service
        </Link>
        {' '}and{' '}
        <Link href="#" className="text-purple-400 hover:text-purple-300">
          Privacy Policy
        </Link>
      </label>
    </div>

    <Button type="submit" className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2.5 rounded-lg font-medium">
      Create Account
    </Button>
  </form>

  {/* OAuth */}
  <Separator className="bg-zinc-800" />
  <Button variant="outline" className="w-full">
    <Google className="w-5 h-5 mr-2" /> Continue with Google
  </Button>

  {/* Link to login */}
  <p className="text-center text-sm text-zinc-400">
    Already have an account?{' '}
    <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium">
      Sign in
    </Link>
  </p>
</Card>

// Password requirements: Dynamic checklist
// Terms checkbox: Linked to legal pages
// OAuth: Standard integration below form
```

### Forgot Password Page

**URL:** `/auth/forgot-password`

**Layout:**
```tsx
<Card className="border border-zinc-800 bg-zinc-900 rounded-2xl p-8 space-y-6 max-w-md">
  <div className="text-center space-y-2">
    <h1 className="text-2xl font-bold text-white">Reset Password</h1>
    <p className="text-sm text-zinc-400">
      Enter your email to receive a reset link
    </p>
  </div>

  <form className="space-y-5">
    <div className="space-y-2">
      <Label htmlFor="email">Email Address</Label>
      <input
        id="email"
        type="email"
        placeholder="you@example.com"
        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg"
      />
    </div>

    <Button type="submit" className="w-full bg-purple-500 hover:bg-purple-600">
      Send Reset Link
    </Button>
  </form>

  <p className="text-center text-sm text-zinc-400">
    Remember your password?{' '}
    <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium">
      Back to login
    </Link>
  </p>
</Card>

// Single field: Simple, focused form
// CTA: Clear action button
```

### OTP Verification Page

**URL:** `/auth/verify-otp`

**Layout:**
```tsx
<Card className="border border-zinc-800 bg-zinc-900 rounded-2xl p-8 space-y-6 max-w-md">
  <div className="text-center space-y-2">
    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
    <h1 className="text-2xl font-bold text-white">Verify Your Email</h1>
    <p className="text-sm text-zinc-400">
      We sent a 6-digit code to your email
    </p>
  </div>

  <form className="space-y-6">
    {/* OTP Input Fields */}
    <div className="flex gap-2 justify-center">
      {[0, 1, 2, 3, 4, 5].map(index => (
        <input
          key={index}
          type="text"
          maxLength="1"
          inputMode="numeric"
          className="w-12 h-12 text-center font-bold text-lg bg-zinc-800 border border-zinc-700 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
          placeholder="0"
        />
      ))}
    </div>

    <div className="text-center text-sm text-zinc-400">
      <p>Didn't receive the code?</p>
      <button className="text-purple-400 hover:text-purple-300 font-medium">
        Resend in 30s
      </button>
    </div>

    <Button type="submit" className="w-full bg-purple-500 hover:bg-purple-600">
      Verify Email
    </Button>
  </form>
</Card>

// OTP inputs: 6 boxes, auto-focus next on type
// Resend button: Countdown timer
// Feedback: Success icon at top
```

---

## 📊 Dashboard Layout

### Sidebar Navigation

**Design:**
```
┌─ Sidebar (fixed) ──────┬─ Top Navbar ────────────────────────┐
│                        │                                      │
│ Logo                   │ Breadcrumb ... Search ... Profile    │
│ ─────────────────      │                                      │
│ • Overview             ├──────────────────────────────────────┤
│ • Resume               │                                      │
│ • Jobs                 │      Main Content Area               │
│ • Applications         │                                      │
│ • Career Copilot       │                                      │
│ • Analytics            │                                      │
│ • Settings             │                                      │
│                        │                                      │
│ ─────────────────      │                                      │
│ Help | Settings        │                                      │
└────────────────────────┴──────────────────────────────────────┘
```

**Sidebar HTML:**
```tsx
<div className="fixed left-0 top-0 h-screen w-64 border-r border-zinc-800 bg-zinc-900 p-6 flex flex-col overflow-auto">
  {/* Logo */}
  <div className="flex items-center gap-2 mb-8">
    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
      <span className="text-white font-bold">A</span>
    </div>
    <span className="font-bold text-lg text-white">AXIOM</span>
  </div>

  {/* Navigation Menu */}
  <nav className="flex-1 space-y-2">
    {[
      { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
      { icon: FileText, label: 'Resume', href: '/dashboard/resume' },
      { icon: Briefcase, label: 'Jobs', href: '/dashboard/jobs' },
      { icon: CheckSquare, label: 'Applications', href: '/dashboard/applications' },
      { icon: MessageCircle, label: 'Career Copilot', href: '/dashboard/copilot' },
      { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
      { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    ].map(item => (
      <Link
        key={item.label}
        href={item.href}
        className="flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <item.icon className="w-5 h-5" />
        {item.label}
      </Link>
    ))}
  </nav>

  {/* Separator */}
  <div className="border-t border-zinc-800 my-6" />

  {/* Help & Settings */}
  <div className="space-y-2">
    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
      <HelpCircle className="w-5 h-5" />
      Help & Support
    </button>
    <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
      <LogOut className="w-5 h-5" />
      Logout
    </button>
  </div>
</div>

// Sidebar: Fixed width (w-64 = 256px), fixed positioning
// Menu items: Flex layout with icons + labels
// Hover state: bg-zinc-800 background
// Active state: Add bg-purple-500/20 and text-purple-400
```

### Top Navbar

**Design:**
```tsx
<nav className="fixed top-0 left-64 right-0 h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm px-8 flex items-center justify-between z-40">
  {/* Left side: Breadcrumb */}
  <Breadcrumb>
    <BreadcrumbList className="text-sm">
      <BreadcrumbItem>
        <Link href="/dashboard" className="text-zinc-400 hover:text-white">Dashboard</Link>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <span className="text-white font-medium">Overview</span>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>

  {/* Right side: Actions */}
  <div className="flex items-center gap-4">
    {/* Search */}
    <div className="hidden md:flex relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
      <input
        type="text"
        placeholder="Quick search..."
        className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 w-48 focus:border-purple-500"
      />
    </div>

    {/* Notifications */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-zinc-300" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-zinc-900 border-zinc-800">
        {/* Notification list */}
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Profile Menu */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/avatars/user.jpg" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-white">John Doe</p>
            <p className="text-xs text-zinc-400">john@example.com</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-400">Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</nav>

// Fixed positioning: top-0 left-64 to account for sidebar
// Glassmorphism: backdrop-blur-sm for transparency
// Breadcrumb: Navigation context
// Profile menu: Avatar + name + email
```

---

## 📱 Dashboard Pages

### Overview / Home Page

**Layout:**
```tsx
<div className="ml-64 pt-20 pb-12 px-8">
  {/* Page header */}
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-white">Welcome back, John</h1>
    <p className="text-zinc-400 mt-2">Here's your career progress at a glance</p>
  </div>

  {/* Stats grid */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
    {/* Stat cards */}
  </div>

  {/* Charts & activities */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Main chart area */}
    {/* Recent activities sidebar */}
  </div>
</div>

// Offset for sidebar: ml-64 = 256px
// Top padding: pt-20 to account for navbar
// Spacing: mb-12 between sections
```

**Stat Cards:**
```tsx
<Card className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-zinc-400 mb-1">Applications</p>
      <p className="text-3xl font-bold text-white">127</p>
    </div>
    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
      <Briefcase className="w-6 h-6 text-purple-400" />
    </div>
  </div>
  <p className="text-xs text-emerald-400 mt-4">
    <TrendingUp className="w-3 h-3 inline mr-1" />
    +23% from last month
  </p>
</Card>

// Icon background: Colored with 20% opacity
// Trending: Green for positive metrics with icon
// Layout: Flex for alignment
```

---

### Resume Page

**Layout:**
```tsx
<div className="ml-64 pt-20 pb-12 px-8">
  <div className="max-w-4xl mx-auto">
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-white">My Resumes</h1>
      <p className="text-zinc-400">Upload and manage multiple resumes</p>
    </div>

    {/* Upload section */}
    <div className="mb-12">
      {/* Upload card */}
    </div>

    {/* Resume list */}
    <div className="space-y-4">
      {/* Resume cards */}
    </div>
  </div>
</div>
```

**Upload Section:**
```tsx
<Card className="border-2 border-dashed border-zinc-700 bg-zinc-900/50 rounded-2xl p-12 hover:border-purple-500/50 transition-colors">
  <div className="flex flex-col items-center justify-center text-center">
    <Upload className="w-12 h-12 text-zinc-500 mb-4" />
    <h3 className="text-lg font-semibold text-white mb-2">Upload a Resume</h3>
    <p className="text-sm text-zinc-400 mb-6">
      Supported formats: PDF, DOCX (max 5MB)
    </p>
    <Button className="bg-purple-500 hover:bg-purple-600">
      Select File
    </Button>
  </div>
</Card>

// Dashed border: Indicates upload zone
// Hover effect: Border color change
// Icon + text: Clear instructions
```

**Resume Cards:**
```tsx
<Card className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
  <div className="flex items-start justify-between mb-4">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
        <FileText className="w-6 h-6 text-purple-400" />
      </div>
      <div>
        <h3 className="font-semibold text-white">Frontend_Resume_2026</h3>
        <p className="text-xs text-zinc-400">Updated 2 days ago</p>
      </div>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreVertical className="w-5 h-5 text-zinc-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
        <DropdownMenuItem>Download</DropdownMenuItem>
        <DropdownMenuItem>View</DropdownMenuItem>
        <DropdownMenuItem className="text-red-400">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>

  <Tabs defaultValue="analytics" className="w-full">
    <TabsList className="bg-zinc-800 border-b border-zinc-700 w-full justify-start px-0 h-auto rounded-none">
      <TabsTrigger value="analytics" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500">
        ATS Score
      </TabsTrigger>
      <TabsTrigger value="skills" className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500">
        Skills
      </TabsTrigger>
    </TabsList>

    <TabsContent value="analytics" className="mt-4 space-y-4">
      {/* ATS score visualization */}
      <div className="flex items-center gap-4">
        <div className="text-4xl font-bold text-white">87%</div>
        <Badge className="bg-emerald-500/20 text-emerald-400">Excellent</Badge>
      </div>
      <Progress value={87} />
    </TabsContent>
  </Tabs>
</Card>

// File icon: Purple colored
// Tabs: Underline style with purple active state
// More menu: Three-dot dropdown
```

---

### Jobs Page

**Layout:**
```tsx
<div className="ml-64 pt-20 pb-12 px-8">
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-white">Job Search</h1>
    <p className="text-zinc-400">Find and apply to relevant positions</p>
  </div>

  {/* Filters sidebar + job list */}
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
    {/* Filters */}
    {/* Job list */}
  </div>
</div>
```

**Filter Sidebar:**
```tsx
<Card className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6 h-fit">
  <h3 className="font-semibold text-white mb-6">Filters</h3>

  <div className="space-y-6">
    {/* Job Title */}
    <div className="space-y-3">
      <Label className="text-sm font-medium text-white">Job Title</Label>
      <input
        type="text"
        placeholder="Backend Engineer..."
        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white"
      />
    </div>

    {/* Location */}
    <div className="space-y-3">
      <Label className="text-sm font-medium text-white">Location</Label>
      <Select>
        <SelectTrigger className="bg-zinc-800 border-zinc-700">
          <SelectValue placeholder="Any location" />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-800">
          <SelectItem value="remote">Remote</SelectItem>
          <SelectItem value="onsite">On-site</SelectItem>
          <SelectItem value="hybrid">Hybrid</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Experience Level */}
    <div className="space-y-3">
      <Label className="text-sm font-medium text-white">Experience</Label>
      <div className="space-y-2">
        {['Entry', 'Mid', 'Senior'].map(level => (
          <label key={level} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-zinc-700" />
            <span className="text-sm text-zinc-300">{level} Level</span>
          </label>
        ))}
      </div>
    </div>

    {/* Salary Range */}
    <div className="space-y-3">
      <Label className="text-sm font-medium text-white">Salary Range</Label>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Min"
          className="w-1/2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white"
        />
        <input
          type="number"
          placeholder="Max"
          className="w-1/2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white"
        />
      </div>
    </div>

    <Separator className="bg-zinc-800" />

    <Button className="w-full bg-purple-500 hover:bg-purple-600">
      Apply Filters
    </Button>
    <Button variant="outline" className="w-full border-zinc-700">
      Clear All
    </Button>
  </div>
</Card>

// Sticky positioning: h-fit + fixed positioning
// Checkboxes: Custom styled
// Apply button: Large, full-width CTA
```

**Job List:**
```tsx
<div className="space-y-4 lg:col-span-3">
  {jobs.map(job => (
    <Card
      key={job.id}
      className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6 hover:border-purple-500/50 hover:bg-zinc-800/50 transition-all cursor-pointer"
      onClick={() => openJobDetailSheet(job.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <img
            src={job.companyLogo}
            alt={job.company}
            className="w-12 h-12 rounded-lg bg-zinc-800 object-cover"
          />
          <div>
            <h3 className="font-semibold text-white text-lg">{job.title}</h3>
            <p className="text-sm text-zinc-400">{job.company}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id); }}
          className="text-zinc-400 hover:text-white"
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
      </div>

      <p className="text-sm text-zinc-300 mb-4 line-clamp-2">{job.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills.slice(0, 3).map(skill => (
          <Badge key={skill} className="bg-purple-500/20 text-purple-400 border-purple-500/50">
            {skill}
          </Badge>
        ))}
        {job.skills.length > 3 && (
          <Badge variant="secondary">+{job.skills.length - 3}</Badge>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-6 text-sm text-zinc-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" /> {job.location}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" /> {job.salary}
          </span>
          <span className="flex items-center gap-1">
            <Briefcase className="w-4 h-4" /> {job.type}
          </span>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
          {job.matchScore}% Match
        </Badge>
      </div>
    </Card>
  ))}
</div>

// Card hover: Subtle border & background change
// Save heart: Toggle filled/unfilled with color
// Skills tags: Show 3, hide rest with "+X more"
// Match badge: Emerald for match score
```

---

### Application Tracker Page

**Layout - Kanban Board:**
```tsx
<div className="ml-64 pt-20 pb-12 px-8">
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-white">Application Tracker</h1>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 overflow-x-auto pb-6">
    {/* Kanban columns */}
  </div>
</div>

// Grid columns: 5 columns for board (Applied, OA, Interview, Offer, Rejected)
// Overflow-x: Allow horizontal scroll on mobile
```

**Kanban Column:**
```tsx
<div className="min-w-80 bg-zinc-900 border border-zinc-800 rounded-2xl h-fit flex flex-col">
  {/* Column header */}
  <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
    <h3 className="font-semibold text-white flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-purple-500" />
      Applied
    </h3>
    <Badge className="bg-zinc-800 text-zinc-300">{columnSize}</Badge>
  </div>

  {/* Cards */}
  <div className="p-4 space-y-3 flex-1 max-h-[600px] overflow-y-auto">
    {applications.map(app => (
      <Card key={app.id} className="border border-zinc-700 bg-zinc-800/50 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-zinc-600 transition-colors">
        <div className="space-y-2">
          <h4 className="font-medium text-white text-sm">{app.position}</h4>
          <p className="text-xs text-zinc-400">{app.company}</p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-zinc-500">{formatDate(app.appliedDate)}</span>
            <DropdownMenu>
              <DropdownMenuTrigger size="sm" variant="ghost">
                <MoreVertical className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    ))}
  </div>
</div>

// Column indicator: Colored dot matching status
// Draggable: cursor-grab on hover, cursor-grabbing on drag
// Card compact: Small, vertical space
// Max height: Scroll within column
```

---

### Career Copilot Page

**Chat Interface:**
```tsx
<div className="ml-64 pt-20 pb-12 px-8 h-screen flex flex-col">
  <div className="flex-1 flex gap-6">
    {/* Conversation history sidebar */}
    <ChatSidebar />

    {/* Main chat area */}
    <div className="flex-1 flex flex-col">
      <h1 className="text-3xl font-bold text-white mb-8">Career Copilot</h1>

      {/* Chat messages */}
      <ScrollArea className="flex-1 mb-6 pr-4 space-y-4">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
      </ScrollArea>

      {/* Chat input */}
      <ChatInput onSubmit={handleSendMessage} />
    </div>
  </div>
</div>

// Layout: Sidebar (conversations) + Main area (chat)
// ScrollArea: Auto-scroll to bottom
// Flex column: Input sticks to bottom
```

**Chat Message Component:**
```tsx
<div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
  <div className={`max-w-md space-y-2 ${
    msg.role === 'user'
      ? 'bg-purple-600 text-white rounded-2xl rounded-tr-none'
      : 'bg-zinc-800 text-white rounded-2xl rounded-tl-none'
  } px-4 py-3`}>
    <p className="text-sm leading-relaxed">{msg.content}</p>
    {msg.actions && (
      <div className="space-y-2 mt-3 pt-3 border-t border-white/20">
        {msg.actions.map(action => (
          <button
            key={action.id}
            className="block w-full text-left text-xs px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            {action.label}
          </button>
        ))}
      </div>
    )}
  </div>
</div>

// User messages: Purple, right-aligned, rounded-tr-none
// AI messages: Zinc, left-aligned, rounded-tl-none
// Action buttons: Small, full-width in message
```

---

### Analytics Page

**Layout:**
```tsx
<div className="ml-64 pt-20 pb-12 px-8">
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-white">Analytics</h1>
  </div>

  {/* Top stats */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
    {/* Stat cards */}
  </div>

  {/* Charts */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
    {/* Chart components */}
  </div>

  {/* Detailed tables */}
  <div className="space-y-6">
    {/* Data tables */}
  </div>
</div>
```

**Chart Components:**
```tsx
<Card className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6">
  <h3 className="font-semibold text-white mb-6">Applications Over Time</h3>
  <LineChart width="100%" height={300} data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
    <XAxis 
      dataKey="month" 
      stroke="#71717a"
      style={{fontSize: '12px'}}
    />
    <YAxis 
      stroke="#71717a"
      style={{fontSize: '12px'}}
    />
    <Tooltip
      contentStyle={{
        backgroundColor: '#27272a',
        border: '1px solid #3f3f46',
        borderRadius: '8px',
      }}
      formatter={(value) => [`${value} apps`, 'Applications']}
    />
    <Line
      type="monotone"
      dataKey="count"
      stroke="#a855f7"
      strokeWidth={2}
      dot={false}
      isAnimationActive={true}
    />
  </LineChart>
</Card>

// Recharts: Zinc-themed colors
// Grid: Subtle, horizontal only
// Tooltip: Custom styled
// Animation: Smooth line animation
```

---

### Settings Page

**Layout with Tabs:**
```tsx
<div className="ml-64 pt-20 pb-12 px-8">
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-white">Settings</h1>
  </div>

  <Tabs defaultValue="profile" className="max-w-2xl">
    <TabsList className="grid grid-cols-5 w-full bg-zinc-800 rounded-lg p-1 mb-8">
      <TabsTrigger value="profile">Profile</TabsTrigger>
      <TabsTrigger value="security">Security</TabsTrigger>
      <TabsTrigger value="notifications">Notifications</TabsTrigger>
      <TabsTrigger value="subscription">Subscription</TabsTrigger>
      <TabsTrigger value="appearance">Appearance</TabsTrigger>
    </TabsList>

    {/* Tab contents */}
  </Tabs>
</div>

// Tabs: Grid layout, full width
// Background: Zinc-800 for tab list
// Trigger: Text-based, no icons
```

**Profile Tab:**
```tsx
<TabsContent value="profile" className="space-y-6">
  <div className="space-y-4">
    <h3 className="font-semibold text-white">Profile Picture</h3>
    <div className="flex items-center gap-6">
      <Avatar className="w-24 h-24">
        <AvatarImage src="/avatars/user.jpg" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <Button className="bg-purple-500 hover:bg-purple-600">Upload Photo</Button>
        <p className="text-xs text-zinc-400">JPG, PNG, GIF (max 2MB)</p>
      </div>
    </div>
  </div>

  <Separator className="bg-zinc-800" />

  <form className="space-y-4">
    <div>
      <Label htmlFor="fullname" className="text-white">Full Name</Label>
      <input id="fullname" defaultValue="John Doe" className="w-full mt-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg" />
    </div>
    <div>
      <Label htmlFor="email" className="text-white">Email Address</Label>
      <input id="email" defaultValue="john@example.com" className="w-full mt-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg" disabled />
    </div>
    <div>
      <Label htmlFor="bio" className="text-white">Bio</Label>
      <textarea id="bio" placeholder="Tell us about yourself..." rows={4} className="w-full mt-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg" />
    </div>
    <Button className="bg-purple-500 hover:bg-purple-600">Save Changes</Button>
  </form>
</TabsContent>

// Avatar: Large display picture
// Form fields: Standard styling
// Bio textarea: Multi-line for description
```

---

## 🎬 Animations & Interactions

### Framer Motion Setup

```tsx
'use client'

import { motion } from 'framer-motion'

// Fade in from bottom
export const FadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

// Slide in from left
export const SlideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6 },
}

// Scale up with fade
export const ScaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4 },
}

// Stagger children
export const ContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

// Usage
<motion.div variants={FadeInUp} initial="initial" animate="animate">
  Content
</motion.div>
```

### Common Interactions

**Button Hover Effect:**
```tsx
<motion.button
  whileHover={{ scale: 1.02, backgroundColor: '#9333EA' }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
  className="px-6 py-2.5 bg-purple-500 rounded-lg font-medium"
>
  Click Me
</motion.button>

// Scale up on hover: 1.02
// Scale down on tap: 0.98
// Spring animation: Natural motion
```

**Card Hover Animation:**
```tsx
<motion.div
  whileHover={{ 
    borderColor: '#a855f7',
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
  }}
  transition={{ duration: 0.2 }}
  className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6"
>
  Card content
</motion.div>

// Border color change: Purple
// Background subtle change: Purple tint
// Quick animation: 200ms
```

**Page Transitions:**
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  Page content
</motion.div>

// Fade in/out transitions
// 300ms duration for smoothness
```

**Typing Animation:**
```tsx
const TypingAnimation = ({ text }: { text: string }) => {
  return (
    <motion.span>
      {text.split('').map((char, idx) => (
        <motion.span
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: idx * 0.05 }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  )
}

// Characters fade in sequentially
// 50ms delay between each character
```

---

## 📱 Mobile Responsiveness

### Breakpoint Strategy

**Tailwind Breakpoints Used:**
```
sm: 640px    (Phones)
md: 768px    (Tablets)
lg: 1024px   (Small laptops)
xl: 1280px   (Large screens)
```

**Responsive Classes Pattern:**
```
Base (mobile):       text-lg p-4
Small+:             sm:text-xl sm:ml-0
Medium+:            md:p-6 md:ml-64
Large+:             lg:grid-cols-3 lg:gap-6
XL+:                xl:max-w-4xl
```

### Mobile Navigation

**Hamburger Menu (Mobile):**
```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="md:hidden">
      <Menu className="w-5 h-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-full sm:w-80">
    {/* Mobile menu content */}
  </SheetContent>
</Sheet>

// Hidden on md+ screens
// Full width on mobile
// Slide in from right
```

### Dashboard Mobile

**Mobile Layout (Single Column):**
```tsx
// Dashboard on mobile
<div className="block md:hidden">
  {/* Mobile sidebar would collapse or convert to sheet */}
  {/* Single column layout */}
</div>

// Desktop layout
<div className="hidden md:flex">
  {/* Sidebar + content side by side */}
</div>

// Tailwind: block md:hidden for mobile-only elements
```

### Responsive Images

```tsx
<img
  src={image}
  alt="Description"
  className="w-full object-cover rounded-lg aspect-video"
/>

// Full width on mobile
// Aspect ratio: Maintain 16:9
// Object cover: Fill without distortion
```

### Touch Targets

```
Minimum touch target: 44px × 44px

// Button sizes
<Button size="sm" className="h-9 px-3">Small</Button>     {/* 36px */}
<Button size="default" className="h-10 px-4">Default</Button> {/* 40px */}
<Button size="lg" className="h-12 px-6">Large</Button>   {/* 48px */}

// On mobile, prefer lg size for better touch experience
```

---

## ✨ Accessibility Guidelines

### Color Contrast

- Minimum: 4.5:1 for normal text
- Minimum: 3:1 for large text (18pt+)
- Our palette maintains WCAG AA compliance

### Keyboard Navigation

```tsx
// All interactive elements must be keyboard accessible
<button
  onClick={handler}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handler()
    }
  }}
  tabIndex={0}
>
  Click me
</button>

// Or use proper semantic HTML
<button onClick={handler}>Click me</button>
```

### Screen Reader Support

```tsx
<button
  aria-label="Close dialog"
  className="p-2"
>
  <X className="w-5 h-5" />
</button>

// For icon-only buttons, always add aria-label
```

### Focus Indicators

```tsx
// Visible focus ring
className="focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"

// On dark background, add light ring
className="focus:ring-purple-400"
```

---

## 🎨 Design Inspiration Sources

| Platform | Key Inspections | AXIOM Application |
|----------|------------------|------------------|
| **Linear** | Minimalist sidebar, smooth transitions, pricing tiers | Dashboard layout, typography, card designs |
| **Vercel** | Hero sections, glassmorphism, deployment UI | Landing page hero, floating cards, animations |
| **Stripe** | Color system, documentation, API examples | Color palette, semantic colors, form styles |
| **Clerk** | Auth UI patterns, onboarding flows | Authentication pages, sign-up experience |
| **Notion** | Database UI, flexible layouts, dark mode | Dashboard organization, kanban board |
| **Raycast** | Command palette, keyboard shortcuts, speed | Quick search, instant feedback |

---

## 📐 Design Tokens (CSS Variables)

```css
/* Colors */
--color-primary: #a855f7;
--color-primary-dark: #7e22ce;
--color-secondary: #3b82f6;
--color-success: #10b981;
--color-warning: #f59e0b;
--color-danger: #ef4444;

/* Spacing */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;

/* Typography */
--font-sans: 'Geist', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Border Radius */
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

/* Transitions */
--transition-fast: 150ms ease-out;
--transition-normal: 200ms ease-out;
--transition-slow: 300ms ease-out;
```

---

## 🔍 Design Checklist

Before implementing any page/component, verify:

- [ ] Color palette follows system (zinc, slate, white, purple, blue)
- [ ] Typography hierarchy is correct (Geist font family)
- [ ] Spacing uses 8px scale (4, 8, 16, 24, 32, 48, 64)
- [ ] Cards are rounded-2xl with zinc-800 borders
- [ ] All buttons have hover states (200ms transition)
- [ ] Dark mode optimized (bg-zinc-950/900/800)
- [ ] Icons from Lucide Icons consistent
- [ ] Forms have proper labels and placeholders
- [ ] Mobile responsive (sm/md/lg breakpoints)
- [ ] Accessibility: Color contrast, keyboard nav, alt text
- [ ] Animations smooth (Framer Motion, 150-300ms)
- [ ] No unnecessary gradients (use sparingly)
- [ ] Glassmorphism only in hero sections
- [ ] Loading states defined
- [ ] Error states clearly indicated
- [ ] Success feedback visible

---

## 📚 Resources & Tools

- **Figma Design System:** (Link to shared design file)
- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **Shadcn UI Components:** https://ui.shadcn.com/
- **Recharts Documentation:** https://recharts.org/
- **Lucide Icons:** https://lucide.dev/
- **Framer Motion:** https://www.framer.com/motion/
- **Color Contrast Checker:** https://webaim.org/resources/contrastchecker/

---

**Document Version:** 1.0  
**Last Updated:** June 2026  
**Design Lead:** Senior Product Designer  
**Status:** Ready for Implementation
