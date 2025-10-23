# HostPilotPro Design Guidelines

## Design Approach

**Selected Framework**: Modern SaaS Hybrid  
Drawing inspiration from Linear's precision, Notion's warmth, and Vercel's sophistication while incorporating specified glassmorphism effects. The design balances professional credibility with approachable usability for hospitality operators.

**Core Principles**:
- Clarity through hierarchy and breathing room
- Trust through consistent patterns and refined details
- Efficiency through intuitive navigation and quick actions

---

## Typography System

**Font Stack**: Inter (primary), SF Pro Display (headings via system fonts)

**Hierarchy**:
- **Display**: 3.5rem/4rem (56px/64px), font-weight 700, tracking -0.02em - Hero headlines
- **H1**: 2.5rem (40px), font-weight 700, tracking -0.01em - Page titles
- **H2**: 2rem (32px), font-weight 600 - Section headers
- **H3**: 1.5rem (24px), font-weight 600 - Card titles
- **H4**: 1.25rem (20px), font-weight 500 - Subsections
- **Body Large**: 1.125rem (18px), font-weight 400, line-height 1.7 - Hero subtext, important descriptions
- **Body**: 1rem (16px), font-weight 400, line-height 1.6 - Primary text
- **Body Small**: 0.875rem (14px), font-weight 400 - Secondary text, captions
- **Label**: 0.75rem (12px), font-weight 500, uppercase, tracking 0.05em - Tags, badges

---

## Layout & Spacing System

**Tailwind Units**: Standardize on 4, 6, 8, 12, 16, 20, 24 for consistency

**Container Strategy**:
- Max-width: 1280px (max-w-7xl) for main content
- Section padding: py-20 desktop, py-12 mobile
- Card padding: p-6 to p-8
- Component spacing: space-y-8 for sections, space-y-4 within components

**Grid System**:
- Dashboard: 12-column grid with 24px gutters
- Cards: 1 column mobile, 2 columns tablet, 3-4 columns desktop
- Sidebar: 280px fixed width desktop, full-width drawer mobile

---

## Component Library

### Navigation
**Top Bar**: Fixed position, backdrop-blur-lg glass effect, h-16, contains logo (left), main nav (center), user avatar + notifications (right). Subtle bottom border.

**Sidebar** (Dashboard): Fixed left, w-280px desktop, includes workspace switcher, nav items with icons, bottom user profile card. Each nav item has icon (20px), label, optional badge.

### Cards & Containers
**Glass Cards**: Backdrop-blur-md, border (1px subtle), rounded-xl (12px), padding p-6, subtle shadow. Header with title + action button, content area, optional footer.

**Stat Cards**: Compact glass cards showing metric (large number, 2.5rem), label below, trend indicator (up/down arrow + percentage in small text), optional mini sparkline chart.

**Table Cards**: Glass container wrapping data tables. Table has alternating row hover states, sticky header, sortable columns with arrow indicators.

### Forms & Inputs
**Text Inputs**: h-12, px-4, rounded-lg, border subtle, glass background. Label above (font-weight 500, 0.875rem), placeholder in muted text. Focus state: border emphasis, subtle glow effect.

**Buttons**:
- **Primary**: px-6, h-12, rounded-lg, font-weight 500. Hover: slight scale (1.02), brightness increase
- **Secondary**: Same dimensions, outlined style, glass fill on hover
- **Icon Buttons**: w-10 h-10, rounded-lg, icon centered
- **Blur Buttons** (on images): backdrop-blur-md, semi-transparent background, white text, no hover scale

**Dropdowns**: Same height as inputs, chevron indicator right, glass panel dropdown with subtle shadow, max-height with scroll.

### Data Display
**Property Cards**: Large glass card, image top (aspect-16/9, rounded-t-xl), content p-6, title (H3), amenities row (small icons + labels), pricing (H4), action button full-width bottom.

**Booking Timeline**: Horizontal scrollable timeline, date markers every 4 units, booking blocks as glass rectangles with guest name, rounded corners, varying widths based on duration.

**Status Badges**: Inline-flex, px-3, h-6, rounded-full, font-weight 500, 0.75rem. Glass effect with status-appropriate subtle backgrounds.

### Modals & Overlays
**Modal**: Centered, max-w-2xl, glass card with stronger backdrop-blur, close button top-right, title (H3), scrollable content, action buttons footer (right-aligned).

**Toast Notifications**: Fixed top-right, glass card, auto-dismiss, icon left, message, close button, slide-in animation.

---

## Interactions & Animations

**Hover States**: All interactive elements scale slightly (1.01-1.02), brightness increase, 200ms ease-out transition.

**Loading States**: Skeleton screens with shimmer gradient animation, maintaining layout structure.

**Page Transitions**: 300ms fade + subtle slide up (20px), stagger child elements by 50ms.

**Micro-interactions**: Icon rotations (chevrons), check mark animations, number counting up for stats.

---

## Images Section

**Hero Image**: YES - Large hero image required

**Image Specifications**:

1. **Hero Section**: Full-width, h-screen or 80vh, high-quality hospitality imagery (modern hotel lobby, elegant room, or property exterior), subtle overlay gradient (darker bottom), crisp and professional. Centered content (Display heading + Body Large subtext + two blur buttons stacked on mobile, side-by-side desktop).

2. **Property Thumbnails**: Aspect ratio 16:9, rounded-xl, object-cover, subtle hover zoom (1.05), 300ms transition. Use in property cards throughout dashboard.

3. **Team/About Section** (if applicable): 2-column layout desktop, team photo left (rounded-2xl), content right. Natural, professional photography.

4. **Feature Icons**: Use Heroicons (24px) via CDN for consistency - home, calendar, chart-bar, users, cog, bell, etc.

5. **Empty States**: Centered illustrations (max 240px width), muted treatment, above heading + description + CTA.

6. **Dashboard Graphs**: Use Chart.js or similar for line/bar charts with glass container treatment.

---

## Responsive Breakpoints

- **Mobile**: 640px - Single column, full-width cards, hamburger nav, bottom tab bar
- **Tablet**: 768px - 2-column grids, collapsible sidebar
- **Desktop**: 1024px+ - Multi-column layouts, fixed sidebar, horizontal navigation

Maintain 16px horizontal padding mobile, 24px tablet, auto-centered max-width desktop.