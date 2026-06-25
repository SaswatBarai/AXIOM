# AXIOM — Design System

**Version:** 2.0 — updated from live landing page implementation  
**Stack:** Next.js 15 App Router · Tailwind CSS · Framer Motion · shadcn/ui · Lucide Icons

---

## Table of Contents

1. [Brand Identity](#1-brand-identity)
2. [Color Tokens](#2-color-tokens)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Iconography & Logo](#5-iconography--logo)
6. [Component Patterns](#6-component-patterns)
7. [Animation System](#7-animation-system)
8. [Landing Page](#8-landing-page)
9. [Dashboard](#9-dashboard)
10. [Admin Dashboard](#10-admin-dashboard)
11. [Auth Pages](#11-auth-pages)
12. [Mobile Responsiveness](#12-mobile-responsiveness)
13. [Accessibility](#13-accessibility)

---

## 1. Brand Identity

**Name:** AXIOM  
**Tagline:** *Your AI Career Copilot*  
**Voice:** Confident, precise, technical — but approachable. Linear meets Stripe.  
**Aesthetic:** Dark-first, minimal chrome, data-forward. Every element earns its place.

### Inspiration References

| Product | What we borrow |
|---|---|
| **Linear** | Dense information density, monochrome palette, keyboard-first |
| **Vercel** | Clean dark surfaces, generous whitespace, subtle dot grids |
| **Stripe** | Trust signals, precise copy, data cards |
| **Raycast** | Terminal aesthetic, spotlight interaction patterns |
| **Notion** | Content hierarchy, muted accent colors |

---

## 2. Color Tokens

### CSS Custom Properties (globals.css / tailwind.config)

```css
--color-brand:       #f97316;   /* orange-500 — primary CTA, logo fill, accents */
--color-brand-hover: #ea6a0a;   /* orange-600 — hover state */
--color-bg-base:     #09090b;   /* zinc-950   — page background */
```

### Tailwind Aliases

| Token | Value | Usage |
|---|---|---|
| `bg-bg-base` | `#09090b` | Page background everywhere |
| `bg-brand` | `#f97316` | Primary buttons, logo, active indicators |
| `bg-brand-hover` | `#ea6a0a` | Button hover states |
| `text-brand` | `#f97316` | Highlighted text, "AI" in hero title |

### Palette in Practice

```
Background layers (darkest → lightest):
  bg-bg-base   #09090b  ← page base
  zinc-950     #09090b  ← sidebar, terminal panels
  zinc-900     #18181b  ← card fills, input backgrounds
  zinc-800     #27272a  ← borders (default card border)
  zinc-700     #3f3f46  ← hover borders, strong dividers

Text layers:
  white        #ffffff  ← headings, active nav, primary content
  zinc-300     #d4d4d8  ← secondary headings, important body text
  zinc-400     #a1a1aa  ← body text, nav links (default)
  zinc-500     #71717a  ← captions, timestamps, secondary labels
  zinc-600     #52525b  ← placeholder text, disabled states
  zinc-700     #3f3f46  ← very muted / decorative text

Brand:
  brand        #f97316  ← CTAs, logo, active states, hero "AI" word
  brand/10     rgba(249,115,22,0.10) ← glow backgrounds
  brand/07     rgba(249,115,22,0.07) ← hero radial glow (subtle)
  brand/30     rgba(249,115,22,0.30) ← shimmer lines, ring accents

Status colors:
  emerald-400  #34d399  ← success badges, health indicators
  emerald-500  #10b981  ← check icons, match score rings
  orange-400   #fb923c  ← warnings (terminal WARN level)
  red-400      #f87171  ← errors, failed states
  blue-500     #3b82f6  ← informational, avatar accents
```

### Gradient Recipes

```css
/* Top radial hero glow */
background: radial-gradient(ellipse 70% 55% at 50% 0%, brand/7 60%, transparent 100%);

/* Section separator */
background: linear-gradient(to right, transparent, zinc-800/60, transparent);

/* Top shimmer line on cards */
background: linear-gradient(to right, transparent, brand/30, transparent);

/* Dot grid */
background-image: radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px);
background-size: 24px 24px;
/* + mask to fade edges: radial-gradient(ellipse 70% 55% at 50% 0%, #000 60%, transparent 100%) */
```

---

## 3. Typography

### Font Family

```css
font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Scale

| Role | Class | Size | Weight | Tracking | Usage |
|---|---|---|---|---|---|
| **Hero H1** | `text-[5.5rem]` | 88px | `font-extrabold` (800) | `-0.03em` | Hero headline only |
| **Section H2** | `text-4xl sm:text-5xl` | 36–48px | `font-extrabold` | `-0.025em` | CTA, section titles |
| **Card Title** | `text-xl` | 20px | `font-bold` | default | Feature card headings |
| **Body** | `text-base sm:text-lg` | 16–18px | `font-normal` | default | Descriptions, copy |
| **Small** | `text-sm` | 14px | `font-medium` | default | Nav links, buttons |
| **Label** | `text-xs` | 12px | `font-semibold` | `tracking-wider` | Card sub-labels |
| **Eyebrow** | `text-[10px]` | 10px | `font-semibold` | `tracking-[0.15em]` | Section labels ("Get Started Today") |
| **Mono / Terminal** | `font-mono text-[10px]` | 10px | `font-normal` | default | Copilot log panel |

### Special Typography Patterns

```tsx
/* "AI" in hero — brand colour + glow */
<span className="text-brand" style={{ textShadow: "0 0 80px rgba(249,115,22,0.35)" }}>
  AI
</span>

/* Animated underline on "Copilot" */
<motion.span
  className="absolute -bottom-1 left-0 right-0 h-[3px]
             bg-gradient-to-r from-brand/60 via-brand/30 to-transparent
             rounded-full origin-left"
  initial={{ scaleX: 0 }}
  animate={{ scaleX: 1 }}
  transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
/>

/* Section eyebrow label */
<span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.15em]">
  Get Started Today
</span>
```

---

## 4. Spacing & Layout

### Page Structure

```
max-w-7xl mx-auto px-6   ← all page content
max-w-4xl mx-auto        ← centered hero / CTA content
max-w-6xl mx-auto        ← hero mockup, wider sections
```

### Section Spacing

```
py-20 px-6   ← standard section padding (top + bottom)
py-28 px-6   ← hero section
pt-24 pb-20  ← hero with top nav offset
```

### Gap Scale

```
gap-3    12px  ← button groups, tag clusters
gap-5    20px  ← card internal content
gap-6    24px  ← section content blocks
gap-7    28px  ← CTA section elements
gap-8    32px  ← nav items
```

### Border Radius

```
rounded-md    6px   ← small elements (badges, search bars)
rounded-lg    8px   ← mobile nav items
rounded-xl    12px  ← small cards
rounded-2xl   16px  ← primary cards, the dashboard mockup, modals
rounded-3xl   24px  ← CTA section container
rounded-full  pill  ← announcement badge, avatar stack
```

---

## 5. Iconography & Logo

### AXIOM Logo (SVG)

The logo is a custom SVG — an "A" letterform rendered as two angled strokes with a crossbar, inside a rounded-rectangle fill of `brand` colour.

```tsx
function AxiomLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="1" y="1" width="30" height="30" rx="7" fill="var(--color-brand)" />
      <path
        d="M10 23L16 9L22 23"
        stroke="#09090b" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      <line x1="12.5" y1="18.5" x2="19.5" y2="18.5"
        stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
```

**Sizes used:**
- Navbar: `size={32}`
- Footer: `size={28}`
- Dashboard sidebar: `w-8 h-8 rounded-md bg-brand` (CSS version, not SVG)
- Favicon: `icon.tsx` + `apple-icon.tsx` via `next/og` ImageResponse

### Icon Library

All icons from `lucide-react`. Standard sizes:

```
w-3 h-3     12px  ← arrow-right inside text, stars
w-3.5 h-3.5 14px  ← nav/inline icons (CheckCircle, ArrowRight)
w-4 h-4     16px  ← button icons, card action icons
w-5 h-5     20px  ← hamburger menu, prominent icons
```

Common icons by section:

| Section | Icons |
|---|---|
| Hero | `ArrowRight`, `CheckCircle2`, `Play`, `Terminal`, `FileText`, `Briefcase`, `Bot`, `Search`, `Settings` |
| Features | `FileText`, `Briefcase`, `MessagesSquare`, `BarChart3`, `PenTool`, `KanbanSquare`, `Zap`, `ChevronRight`, `Clock`, `Send` |
| Stats | `Users`, `TrendingUp`, `Zap`, `Briefcase` |
| Pricing | `Check`, `Minus`, `ShieldCheck`, `Star` |
| CTA / Footer | `ArrowRight`, `CheckCircle2` |
| Navbar | `Menu`, `X` |

---

## 6. Component Patterns

### Announcement Pill (Hero)

```tsx
<span className="inline-flex items-center gap-2.5 px-3.5 py-1.5
  bg-zinc-900/70 border border-zinc-800/80 rounded-full
  text-xs font-medium text-zinc-300 backdrop-blur-sm
  hover:border-zinc-700 hover:bg-zinc-800/60 transition-all duration-200 cursor-pointer group">
  <span className="bg-brand text-black text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 leading-none">
    NEW
  </span>
  AXIOM 1.0 is now live
  <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:translate-x-0.5 group-hover:text-zinc-300 transition-all duration-200" />
</span>
```

### Buttons

```tsx
/* Primary CTA — brand orange */
<Button
  className="bg-brand hover:bg-brand-hover text-black font-semibold text-sm px-7 h-11
             shadow-[0_0_24px_rgba(249,115,22,0.25)]
             hover:shadow-[0_0_32px_rgba(249,115,22,0.4)]
             transition-all duration-200">
  Get Started Free
</Button>

/* Secondary / outline */
<Button variant="outline"
  className="border-zinc-700 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-zinc-600
             text-zinc-200 font-medium text-sm px-7 h-11 transition-all duration-200">
  See it in action
</Button>

/* Ghost (nav signin) */
<Button variant="ghost"
  className="text-zinc-400 hover:text-white hover:bg-zinc-800/60 text-sm h-9 px-4">
  Sign In
</Button>
```

### Navbar

- `sticky top-0 z-50`
- Height: `h-16`
- Transparent on load → glass on scroll:
  ```
  bg-bg-base/90 backdrop-blur-xl border-b border-zinc-800/70
  shadow-[0_1px_0_0_rgba(255,255,255,0.04)]
  ```
- Active section detection via `IntersectionObserver` with `rootMargin: "-45% 0px -45% 0px"`
- Active link: `text-white font-medium`, inactive: `text-zinc-400 hover:text-white`
- 5 nav items: **Features · Showcase · Copilot · Pricing · FAQ**
- Mobile: slide-down sheet with focus trap + Escape key close

### Cards

```tsx
/* Default card */
<Card className="border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md rounded-2xl">

/* Inner nested card */
<Card className="border border-zinc-900 bg-zinc-900/15 p-5">

/* Hover card */
<Card className="border border-zinc-900 bg-zinc-900/10 p-3.5 hover:border-zinc-800/80 transition-colors">
```

### SpotlightCard (Features Section)

Mouse-tracking radial gradient that follows the cursor within the card.

```tsx
function SpotlightCard({ children, className, intensity = 0.03 }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <div
      className={`relative overflow-hidden rounded-2xl group ${className}`}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
        style={{
          background: `radial-gradient(300px circle at ${pos.x}px ${pos.y}px,
                        rgba(255,255,255,${intensity}), transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
}
```

### Social Proof Bar (Hero)

```tsx
/* Avatar stack + user count + stars */
<div className="flex items-center gap-4 px-5 py-3
  bg-zinc-900/50 border border-zinc-800/60 rounded-2xl backdrop-blur-sm">
  {/* 5 coloured initial avatars, -space-x-2 overlap */}
  {/* "14,000+ job seekers already onboard" */}
  {/* divider */}
  {/* 5 orange stars + "4.9" */}
</div>
```

### Trust Signals Row

```tsx
<span className="flex items-center gap-1.5">
  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
  No credit card required
</span>
```

### Section Separator

```tsx
<div className="h-px bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent" />
```

### Badge Variants

```tsx
/* Outline (dark label) */
<Badge variant="outline" className="border-zinc-800 text-zinc-500 bg-zinc-900/60 text-[10px]">
  Production Workspace
</Badge>

/* Match score (green) */
<Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-2">
  94%
</Badge>

/* NEW label */
<span className="bg-brand text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
  NEW
</span>
```

---

## 7. Animation System

### Library

`framer-motion` — all entrance animations, scroll effects, counter animations.

### Standard Entrance Easing

```ts
ease: [0.16, 1, 0.3, 1]   // spring-like, overshoots slightly — used everywhere
ease: "easeOut"             // simpler fallbacks
```

### Entrance Pattern (staggered by 80ms)

```ts
// Element 1 — announcement pill
{ duration: 0.4,  delay: 0.00 }
// Element 2 — H1
{ duration: 0.5,  delay: 0.08 }
// Element 3 — description
{ duration: 0.45, delay: 0.18 }
// Element 4 — CTAs
{ duration: 0.45, delay: 0.26 }
// Element 5 — trust signals
{ duration: 0.40, delay: 0.38 }
// Element 6 — social proof bar
{ duration: 0.45, delay: 0.50 }
// Element 7 — dashboard mockup
{ duration: 0.80, delay: 0.35 }
```

Initial state: `{ opacity: 0, y: 8 }` → `{ opacity: 1, y: 0 }`

### Hero 3D Tilt (Dashboard Mockup)

```ts
const { scrollYProgress } = useScroll({
  target: containerRef,
  offset: ["start end", "end start"],
});
const rotateX = useTransform(scrollYProgress, [0, 0.45], [10, 0]);
const scale   = useTransform(scrollYProgress, [0, 0.45], [0.93, 1]);
const opacity = useTransform(scrollYProgress, [0, 0.35], [0.55, 1]);
// Applied as: style={{ rotateX, scale, opacity, transformStyle: "preserve-3d" }}
// Parent: style={{ perspective: "1200px" }}
```

### ScrollReveal Wrapper

```tsx
// components/ScrollReveal.tsx — wraps sections for scroll-triggered fade-in
<ScrollReveal>
  <SectionContent />
</ScrollReveal>
```

### Animated Counters

```ts
// Cubic ease-out (smooth deceleration)
const ease = 1 - Math.pow(1 - p, 3);
setCount(Math.round(ease * target));

// Durations:
// ATS hero counter: 1400ms
// Stats section: 1000–1400ms (per stat)
```

### ATS Ring (SVG Animation)

```tsx
<motion.circle
  strokeDasharray={251}   // circumference of r=40 circle
  initial={{ strokeDashoffset: 251 }}
  animate={{ strokeDashoffset: Math.round(251 * (1 - score / 100)) }}
  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
/>
```

### Hover Micro-interactions

```
button ArrowRight icon:  group-hover:translate-x-0.5  (transition 200ms)
nav link arrow:          group-hover:translate-x-0.5 + group-hover:text-zinc-300
card border:             hover:border-zinc-800/80      (transition-colors)
logo:                    group-hover:scale-105          (transition 200ms)
SpotlightCard glow:      opacity-0 → opacity-100        (transition 300ms)
```

---

## 8. Landing Page

### Page Structure

```
<Navbar />                 sticky, z-50
<Hero />                   min-h-screen, dot grid, 3D mockup
<Stats />                  4 animated counters
<Features />               6 SpotlightCards in bento grid
<Showcase />               full-width product demo
<Chatbot />                AI copilot demo section
<Pricing />                3-tier pricing cards
<FAQ />                    accordion
<CallToAction />           full-width CTA with avatar stack
<Footer />                 newsletter + link columns
```

### Hero Section

**Background:** Dot grid (`24px` spacing) + dual radial glows (brand/7 + white/4)  
**Layout:** Centered column, max-w-4xl, then full-width mockup below

**Content flow:**
1. Announcement pill → "AXIOM 1.0 is now live"
2. H1 (5.5rem): "Your **AI** Career / **Copilot**" — "AI" in brand orange, "Copilot" underlined
3. Subtext (zinc-400): ATS + job matching + interview prep pitch
4. Two CTAs side-by-side: `Get Started Free` (brand) + `See it in action` (outline)
5. Trust row: ✅ No CC · ✅ Free tier · 89% saw callbacks
6. Social proof bar: 5 avatars + "14,000+ job seekers" + 4.9 ★
7. 3D-tilt dashboard mockup (on scroll)

**Dashboard mockup panels:**
- Left: Icon sidebar (8px sidebar, zinc-950)
- Centre top: Badge "Production Workspace" + search bar
- Centre grid: ATS Score card (animated ring) + 2 Job Match cards
- Right panel: Terminal "Copilot Logs" (mono font, zinc-500 text)

### Stats Section

4 animated counters on `useInView`:

| Value | Label |
|---|---|
| 14k+ | Active Users |
| 89% | Interview Rate |
| 3.2× | Faster Job Search |
| 50k+ | Jobs Matched Monthly |

### Features Section

6 cards in a bento grid layout using `SpotlightCard`. Each card shows a live UI preview mockup:

1. **ATS Resume Analyzer** — job match score list (Stripe 94%, Vercel 81%, Linear 76%)
2. **AI Chat Copilot** — chat bubble exchange
3. **Cover Letter Writer** — animated line-by-line text reveal
4. **Application Tracker** — kanban pipeline (Applied 47 → Offer 2)
5. **Analytics Dashboard** — bar chart with 12-month data
6. **Interview Prep** — question + timer card

### Pricing Section

Three tiers:

| Tier | Price | Highlight |
|---|---|---|
| **Free** | $0 / forever | 4 features listed, 4 locked |
| **Pro** | $9 / per month | Highlighted card (brand border), 7 features, 0 locked |
| **Enterprise** | Custom / yearly | 6 features, contact sales |

**Pro card treatment:**
```tsx
<div className="border border-brand/50 bg-zinc-900/40 ...">
  {/* Top shimmer: brand/30 → transparent gradient */}
  {/* "Most Popular" badge */}
</div>
```

### Footer

```
Col 1: Logo + description + newsletter signup form
Col 2: Product links (Features, Showcase, Pricing)
Col 3: Legal links (Privacy, Terms, Support)
Bottom: © 2026 AXIOM — social icons
```

---

## 9. Dashboard

### Layout Shell

```tsx
// app/(dashboard)/layout.tsx
<div className="flex h-screen bg-bg-base overflow-hidden">
  <Sidebar />           {/* w-14 collapsed / w-56 expanded */}
  <div className="flex-1 flex flex-col overflow-hidden">
    <TopBar />          {/* h-14, breadcrumb + user menu */}
    <main className="flex-1 overflow-y-auto p-6">
      {children}
    </main>
  </div>
</div>
```

### Sidebar

- Width: `w-14` (icon-only) on desktop, expandable
- Background: `bg-zinc-950`
- Logo at top: `w-8 h-8 rounded-md bg-brand` (CSS "A" square)
- Nav icons: `w-4 h-4 text-zinc-600` (inactive) / `text-zinc-300` (active)
- Active item: left border `border-l-2 border-brand`

### Dashboard Pages

| Route | Content |
|---|---|
| `/dashboard` | Overview: stats row + recent activity |
| `/dashboard/resume` | Upload card + resume list + ATS score ring |
| `/dashboard/jobs` | Job search + filter sidebar + match cards |
| `/dashboard/applications` | Kanban board by status |
| `/dashboard/copilot` | Full-page chat interface |
| `/dashboard/interview` | Session selector + practice mode |
| `/dashboard/roadmap` | Career roadmap timeline cards |
| `/dashboard/skills` | Skill gap radar/bar chart |
| `/dashboard/analytics` | Charts: funnel, monthly, ATS trend |
| `/dashboard/settings` | Profile, password, preferences, billing |

### Dashboard Cards

```tsx
/* Stat card */
<Card className="border border-zinc-800/60 bg-zinc-900/20 p-5">
  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
    {label}
  </div>
  <div className="text-3xl font-extrabold text-white mt-2">{value}</div>
  <div className="text-xs text-zinc-500 mt-1">{sublabel}</div>
</Card>
```

---

## 10. Admin Dashboard

### Route: `/admin/*`

Role guard in layout — redirects non-ADMIN users silently to `/dashboard`.

### Admin Sidebar Items

| Icon | Label | Route |
|---|---|---|
| `BarChart3` | Overview | `/admin/overview` |
| `Users` | Users | `/admin/users` |
| `Briefcase` | Jobs | `/admin/jobs` |
| `Server` | System | `/admin/system` |
| `ScrollText` | Audit Log | `/admin/audit` |

### Admin Colour Differentiator

The admin shell uses a slightly different top-border accent: `border-t-2 border-red-500/30` on the sidebar to visually distinguish it from the user dashboard.

### Admin Table Pattern

```tsx
<table className="w-full text-sm">
  <thead>
    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
      <th className="text-left py-3 px-4">Name</th>
      ...
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-zinc-900 hover:bg-zinc-900/40 transition-colors">
      ...
    </tr>
  </tbody>
</table>
```

---

## 11. Auth Pages

**Layout:** Centered card on dark background with dot grid.

```tsx
<div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
  {/* Subtle glow */}
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-brand/[0.06] blur-[100px]" />
  
  <Card className="w-full max-w-sm border border-zinc-800 bg-zinc-950 p-8 rounded-2xl">
    <AxiomLogo size={32} />
    <h1 className="text-xl font-bold text-white mt-4">Welcome back</h1>
    <p className="text-sm text-zinc-400 mt-1">Sign in to your account</p>
    {/* form */}
  </Card>
</div>
```

**Routes:** `/login` · `/signup` · `/verify-email` · `/forgot-password` · `/reset-password`

### Input Style

```tsx
<input className="w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-800
  text-sm text-white placeholder:text-zinc-600
  focus:outline-none focus:ring-1 focus:ring-brand/50 focus:border-brand/50
  transition-colors" />
```

---

## 12. Mobile Responsiveness

### Breakpoints (Tailwind defaults)

```
sm   640px   ← hero subtitle font up, stat grid 2-col
md   768px   ← navbar switches to desktop, sidebar shows, mockup side-by-side
lg   1024px  ← dashboard 3-col grid, feature bento full
xl   1280px  ← max-w-7xl container takes full shape
```

### Mobile-specific patterns

- Navbar collapses to hamburger → full-screen slide-down sheet
- Hero CTA buttons: `flex-col sm:flex-row`
- Dashboard mockup: terminal panel moves below (stacks vertically on mobile)
- Feature cards: 1-col → 2-col → bento on lg
- Stats: 2-col grid on sm, 4-col on lg

---

## 13. Accessibility

| Practice | Implementation |
|---|---|
| Focus ring | `focus-visible:ring-2 focus-visible:ring-white/20` on interactive elements |
| Skip to content | `<a href="#main" className="sr-only focus:not-sr-only">` in layout |
| Aria labels | All icon-only buttons have `aria-label` |
| Mobile menu | `role="dialog" aria-modal="true" aria-label="Navigation menu"` |
| Focus trap | Tab/Shift+Tab trapped inside mobile menu via `useEffect` |
| Escape close | `keydown` listener closes mobile menu, modals |
| Alt text | All `<img>` tags have `alt`; SVGs use `aria-label` |
| Color contrast | All body text ≥ 4.5:1 on `bg-bg-base` |
| Animated motion | Respects `prefers-reduced-motion` via Framer Motion's `useReducedMotion` |

---

## Quick Reference: Key Class Combos

```
Page background        bg-bg-base
Section wrapper        max-w-7xl mx-auto px-6 py-20
Card (default)         border border-zinc-800/80 bg-zinc-950/70 rounded-2xl
Card (inner)           border border-zinc-900 bg-zinc-900/15 rounded-xl p-5
Primary button         bg-brand hover:bg-brand-hover text-black font-semibold h-11 px-7 rounded-md
Outline button         border-zinc-700 bg-zinc-900/40 hover:bg-zinc-800/60 text-zinc-200 h-11 px-7
Ghost button           text-zinc-400 hover:text-white hover:bg-zinc-800/60 h-9 px-4
Section eyebrow        text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.15em]
Section H2             text-4xl sm:text-5xl font-extrabold tracking-tight text-white
Body text              text-base text-zinc-400 leading-relaxed
Card label             text-[10px] font-semibold text-zinc-500 uppercase tracking-wider
Section divider        h-px bg-gradient-to-r from-transparent via-zinc-800/60 to-transparent
Dot grid               backgroundImage: radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px) / 24px 24px
Glow (brand)           bg-brand/[0.07] rounded-full blur-[120px] (absolute, pointer-events-none)
```
