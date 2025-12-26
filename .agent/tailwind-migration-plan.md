# Tailwind Migration Plan: CSS Modules → Tailwind CSS

**Project:** Lectures After Dark
**Date:** 2025-12-25
**Status:** Planning Phase
**Objective:** Migrate from CSS Modules to Tailwind CSS for improved LLM-assisted development and rapid iteration

---

## Executive Summary

This document outlines a phased approach to migrate from CSS Modules to Tailwind CSS while:
- **Preventing style conflicts** during migration
- **Maintaining separation** of content (Convex DB) and presentation
- **Fixing critical design issues** identified in `report.md`
- **Enabling rapid LLM-assisted development** for future iterations

**Key Constraint:** Content is stored in Convex database and must remain unchanged. Only component styling will be modified.

**Migration Strategy:** Incremental, component-by-component migration with testing gates between each phase.

---

## Development Workflow

**CRITICAL:** Follow this workflow for EVERY change during migration:

1. **Make changes** to component files
2. **Run check**: `pnpm check`
   - Fixes linting issues automatically
   - Type-checks with TypeScript (`tsc --noEmit`)
   - Builds the project
   - **STOPS if anything fails** - do not proceed to commit
3. **If check passes**, commit: `git add . && git commit -m "descriptive message"`
4. **Push**: `git push`
5. **Verify deployment** (optional, for production deploys)

**Never commit or push without passing `pnpm check` first.**

### Quick Reference

```bash
# Standard workflow
pnpm check              # Run ALL checks (lint, type-check, build)
git add .
git commit -m "feat: migrate Hero to Tailwind"
git push
```

---

## Why Tailwind for This Project?

### 1. LLM Development Efficiency
- **Heavily represented in training data** - LLMs can generate complex layouts instantly
- **Predictable utility classes** - Easy for LLMs to modify (`text-lg` → `text-xl`)
- **Rapid iteration** - Change styles via class names, no CSS file editing
- **Consistent patterns** - Reduces decision fatigue for LLM code generation

### 2. Addresses Current Pain Points
- **Inconsistent spacing** - Tailwind's spacing scale (4, 8, 16, 32, 64px) enforces consistency
- **Typography chaos** - Standardized text sizing (`text-sm`, `text-base`, `text-lg`, etc.)
- **Button hierarchy** - Clear variant system via composition
- **Verbose CSS** - Replace 1,839 lines of CSS with utility classes

### 3. Maintains Separation of Concerns
- **Classes live in components, not database**
- **Content remains pure data** (titles, categories, prices)
- **Visual changes don't require DB migrations**

---

## Current State Analysis

### Existing Setup
- **Primary:** CSS Modules (18 files, ~1,839 lines)
- **Secondary:** Global CSS variables in `index.css`
- **Installed but unused:** Tailwind CSS v4.1.18
- **Inconsistencies:** Inline styles in admin/editor components

### Critical Issues from Design Report
1. **Hero subtitle contrast** - Amber text illegible on dark background
2. **Event card truncation** - Third card cut off on desktop
3. **Typography inconsistency** - Section headers vary between 48px-56px
4. **Button hierarchy unclear** - 4+ button styles with no clear primary/secondary
5. **Excessive spacing variations** - Jumps between 40px, 60px, 80px
6. **FAQ section low contrast** - Tan text fails WCAG AA standards
7. **Instagram section redundancy** - Duplicate CTAs
8. **Color contrast failures** - Multiple WCAG violations

---

## Migration Phases


---

### Phase 3: Migrate Critical Components (Fixes Priority Issues)
**Duration:** 2-3 hours
**Risk:** Medium
**Goal:** Fix most severe design issues from report

#### Migration Order (Priority)
1. ✅ Hero.tsx - **CRITICAL** (Report Issue #1: Contrast)
2. ✅ Button components across site - (Report Issue #4: Hierarchy)
3. ✅ EventCard.tsx - (Report Issue #2: Truncation)
4. ✅ UpcomingEvents.tsx - (Report Issue #5: Spacing)
5. ✅ Navbar.tsx - (Report Issue #1: Visibility)

#### 3.1 Hero Section Migration

**Current Issues:**
- Subtitle illegible (amber on dark)
- No text overlay for background image
- Inconsistent button styles

**Before:** `src/components/Hero.tsx` + `Hero.module.css`

**After:** Pure Tailwind component

```tsx
import Button from './ui/Button'

interface HeroProps {
  title: string
  subtitle: string
  backgroundImage?: string
}

export default function Hero({ title, subtitle, backgroundImage }: HeroProps) {
  return (
    <section
      className="tw-relative tw-bg-midnight tw-min-h-[600px] tw-flex tw-flex-col tw-justify-center tw-items-center tw-px-4 tw-overflow-hidden"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      {/* Dark overlay for text contrast - FIXES REPORT ISSUE #1 */}
      <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-b tw-from-black/70 tw-to-black/50" />

      <div className="tw-relative tw-z-10 tw-text-center tw-max-w-4xl tw-space-y-6">
        <h1 className="tw-text-hero tw-font-headline tw-uppercase tw-text-cream tw-tracking-wide">
          {title}
        </h1>

        {/* CRITICAL FIX: Changed from amber to cream-100 (white) for WCAG compliance */}
        <p className="tw-text-xl md:tw-text-2xl tw-font-serif tw-italic tw-text-cream-100 tw-drop-shadow-lg">
          {subtitle}
        </p>

        <div className="tw-flex tw-gap-4 tw-justify-center tw-flex-wrap tw-pt-4">
          <Button variant="primary" size="lg">
            UPCOMING EVENTS
          </Button>
          <Button variant="outline" size="lg">
            JOIN OUR EMAIL LIST
          </Button>
        </div>
      </div>
    </section>
  )
}
```

**Database Integration:**
```tsx
// In your page component
import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

function HomePage() {
  const pageContent = useQuery(api.pages.getBySlug, { slug: 'home' })

  return (
    <Hero
      title={pageContent?.heroTitle ?? 'LECTURES AFTER DARK'}
      subtitle={pageContent?.heroSubtitle ?? 'Where Ambition, Psychology & Culture Collide'}
      backgroundImage={pageContent?.heroImage}
    />
  )
}
```

**Migration Steps:**
1. [ ] Create new `Hero.tsx` with Tailwind classes
2. [ ] Test with hardcoded content
3. [ ] Connect to Convex data
4. [ ] Validate contrast with browser dev tools (aim for 7:1+ ratio)
5. [ ] Remove `Hero.module.css` import
6. [ ] Delete `Hero.module.css` file
7. [ ] Run checks and commit (see Development Workflow):
   ```bash
   pnpm check  # MUST pass before committing
   git add . && git commit -m "feat: migrate Hero to Tailwind (fixes contrast issue)"
   git push
   ```

**Validation Checklist:**
- [ ] Subtitle readable on all background images
- [ ] WCAG AA contrast compliance (4.5:1 minimum)
- [ ] Buttons follow new hierarchy
- [ ] Responsive on mobile (320px-768px)
- [ ] No CSS module references remain

#### 3.2 Event Card Migration

**Current Issues:**
- Cards truncated on desktop
- Inconsistent spacing between cards
- No aspect ratio lock on images

**File:** `src/components/EventCard.tsx`

```tsx
interface EventCardProps {
  title: string
  category: string
  price: number
  imageUrl: string
  date?: string
  onRegisterClick?: () => void
}

export default function EventCard({
  title,
  category,
  price,
  imageUrl,
  date,
  onRegisterClick
}: EventCardProps) {
  return (
    <article className="tw-bg-card-bg tw-rounded-xl tw-overflow-hidden tw-transition-all tw-duration-300 hover:tw-shadow-card-hover hover:tw-scale-[1.02] tw-cursor-pointer">
      {/* FIX: Locked 16:9 aspect ratio (Report Issue #9) */}
      <div className="tw-relative tw-w-full tw-aspect-video tw-overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="tw-absolute tw-inset-0 tw-w-full tw-h-full tw-object-cover"
        />
      </div>

      <div className="tw-p-6 tw-space-y-4">
        {/* Category badge */}
        <span className="tw-inline-block tw-px-3 tw-py-1 tw-bg-amber/20 tw-text-amber tw-text-sm tw-font-semibold tw-uppercase tw-rounded">
          {category}
        </span>

        {/* Event title */}
        <h3 className="tw-text-card-title tw-font-bold tw-text-cream tw-line-clamp-2">
          {title}
        </h3>

        {/* Date if provided */}
        {date && (
          <p className="tw-text-cream-dark tw-text-sm">
            {date}
          </p>
        )}

        {/* Price and CTA */}
        <div className="tw-flex tw-justify-between tw-items-center tw-pt-2">
          <span className="tw-text-cream tw-text-xl tw-font-semibold">
            ${price}
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={onRegisterClick}
          >
            REGISTER →
          </Button>
        </div>
      </div>
    </article>
  )
}
```

**Migration Steps:**
1. [ ] Create new EventCard component
2. [ ] Test with sample data
3. [ ] Update parent components to use new EventCard
4. [ ] Verify image aspect ratios
5. [ ] Remove old Card.module.css
6. [ ] Commit changes

#### 3.3 Events Section Migration

**Current Issues:**
- Tight spacing between title and cards
- Card grid doesn't handle 3+ cards properly
- "View All" button misaligned

**File:** `src/components/UpcomingEvents.tsx`

```tsx
import SectionTitle from './ui/SectionTitle'
import Button from './ui/Button'
import EventCard from './EventCard'

interface Event {
  id: string
  title: string
  category: string
  price: number
  imageUrl: string
  date?: string
}

interface UpcomingEventsProps {
  events: Event[]
  onViewAllClick?: () => void
}

export default function UpcomingEvents({ events, onViewAllClick }: UpcomingEventsProps) {
  return (
    <section className="tw-py-section tw-px-4 tw-bg-midnight">
      <div className="tw-max-w-7xl tw-mx-auto">
        {/* Header with proper alignment */}
        <div className="tw-flex tw-flex-col md:tw-flex-row tw-justify-between tw-items-start md:tw-items-center tw-gap-4 tw-mb-12">
          <SectionTitle className="tw-mb-0">UPCOMING EVENTS</SectionTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onViewAllClick}
          >
            VIEW ALL EVENTS
          </Button>
        </div>

        {/* FIX: Proper responsive grid with consistent gap (Report Issue #2, #5) */}
        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-8">
          {events.map(event => (
            <EventCard
              key={event.id}
              {...event}
              onRegisterClick={() => console.log('Register for:', event.id)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
```

**Validation:**
- [ ] Spacing between title and cards increased to 48px (mb-12)
- [ ] Grid shows 3 cards properly on desktop (no truncation)
- [ ] Gap between cards is 32px (gap-8)
- [ ] Responsive: 1 column mobile, 2 tablet, 3 desktop
- [ ] "View All" button aligned properly

---

### Phase 4: Migrate Remaining Sections
**Duration:** 3-4 hours
**Risk:** Medium
**Goal:** Fix typography, spacing, and accessibility issues

#### 4.1 "The Idea" Section (Report Issue #3)

**Fixes:**
- Standardize section header to 56px
- Improve list item styling
- Better image/text balance

```tsx
export default function TheIdea() {
  const features = [
    'FUN AND ENGAGING SPEAKERS',
    'THOUGHT-PROVOKING TOPICS',
    'INTIMATE VENUE SETTINGS',
    'NETWORKING OPPORTUNITIES',
  ]

  return (
    <section className="tw-py-section tw-px-4 tw-bg-warm-brown">
      <div className="tw-max-w-7xl tw-mx-auto tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-12 tw-items-center">
        {/* Text content */}
        <div className="tw-space-y-6">
          <SectionTitle>THE IDEA</SectionTitle>

          <Paragraph className="tw-text-cream-dark">
            Curated nights for the curious mind. Lectures After Dark brings together
            thought leaders, cultural critics, and curious individuals for intimate
            evenings of intellectual exploration.
          </Paragraph>

          {/* Feature list with checkmarks */}
          <ul className="tw-space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="tw-flex tw-items-center tw-gap-3">
                <div className="tw-w-6 tw-h-6 tw-rounded-full tw-bg-amber tw-flex tw-items-center tw-justify-center tw-flex-shrink-0">
                  <svg className="tw-w-4 tw-h-4 tw-text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="tw-text-cream tw-font-semibold tw-text-sm tw-uppercase tw-tracking-wide">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Image - 50/50 split (Report Issue #12) */}
        <div className="tw-relative tw-rounded-xl tw-overflow-hidden tw-aspect-[4/3]">
          <img
            src="/path/to/bar-image.jpg"
            alt="Lectures After Dark venue"
            className="tw-w-full tw-h-full tw-object-cover"
          />
        </div>
      </div>
    </section>
  )
}
```

#### 4.2 "Why We Do It" Section (Report Issue #8)

**Fixes:**
- Constrain line length to 75ch max
- Improve readability with proper spacing
- Remove excessive padding inconsistency

```tsx
export default function WhyWeDoIt() {
  return (
    <section className="tw-py-section tw-px-4 tw-bg-cream">
      <div className="tw-max-w-4xl tw-mx-auto tw-text-center">
        <SectionTitle dark className="tw-mb-8">
          WHY WE DO IT
        </SectionTitle>

        <div className="tw-space-y-6">
          {/* FIX: Constrained width for optimal readability (Report Issue #8) */}
          <Paragraph
            maxWidth="prose"
            className="tw-text-midnight tw-text-lg tw-mx-auto"
          >
            In a world of endless digital content and shallow interactions, we believe
            in the power of gathering together—in person—to explore ideas that matter.
            Lectures After Dark creates spaces where ambition meets psychology, where
            culture collides with curiosity.
          </Paragraph>

          <Paragraph
            maxWidth="prose"
            className="tw-text-midnight/80 tw-mx-auto"
          >
            Our events are designed for those who refuse to settle for surface-level
            conversations, who seek depth, connection, and inspiration in unexpected places.
          </Paragraph>

          {/* Single CTA - removing redundancy (Report Issue #7) */}
          <div className="tw-pt-6">
            <Button variant="primary" size="lg">
              FOLLOW US ON INSTAGRAM
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
```

#### 4.3 FAQ Section (Report Issue #6)

**Fixes:**
- White text for proper contrast (WCAG AA compliance)
- Use + and - icons (not + and X)
- Add visual affordance to items

```tsx
import { useState } from 'react'

interface FAQItemProps {
  question: string
  answer: string
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="tw-border-b tw-border-cream/20 tw-py-6 tw-transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="tw-w-full tw-flex tw-justify-between tw-items-center tw-text-left tw-gap-4 hover:tw-opacity-80 tw-transition-opacity"
      >
        <span className="tw-text-cream-100 tw-text-lg tw-font-semibold">
          {question}
        </span>
        {/* FIX: Use + and - instead of + and X (Report Issue #6) */}
        <span className="tw-text-amber tw-text-3xl tw-font-light tw-flex-shrink-0 tw-w-8 tw-text-center">
          {isOpen ? '−' : '+'}
        </span>
      </button>

      {isOpen && (
        <div className="tw-mt-4 tw-pl-0 tw-transition-all">
          {/* FIX: Changed to cream-100 (white) for WCAG compliance (Report Issue #6) */}
          <p className="tw-text-cream-100 tw-leading-relaxed tw-text-base">
            {answer}
          </p>
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  const faqs = [
    {
      question: 'What happens at an event?',
      answer: 'Each event features a 45-60 minute talk from an expert speaker, followed by Q&A and networking. Complimentary drinks are provided.',
    },
    {
      question: 'How much do tickets cost?',
      answer: 'Ticket prices vary by event, typically ranging from $20-$40. Early bird discounts are available.',
    },
    // Add more FAQs...
  ]

  return (
    <section className="tw-py-section tw-px-4 tw-bg-midnight">
      <div className="tw-max-w-3xl tw-mx-auto">
        <SectionTitle className="tw-text-center tw-mb-12">
          FREQUENTLY ASKED QUESTIONS
        </SectionTitle>

        <div className="tw-space-y-0">
          {faqs.map((faq, index) => (
            <FAQItem key={index} {...faq} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

**Validation:**
- [ ] Text contrast meets WCAG AA (7:1+ ratio)
- [ ] Icons are consistent (+ and -)
- [ ] Smooth transitions
- [ ] Accessible keyboard navigation

---

### Phase 5: Migrate Page Components
**Duration:** 2-3 hours
**Risk:** Low
**Goal:** Apply Tailwind to About, Contact, Speakers, Venues pages

#### Migration Checklist

**About Page:**
- [ ] Migrate `About.tsx`
- [ ] Remove `About.module.css`
- [ ] Test responsive layout
- [ ] Verify image aspect ratios

**Contact Page:**
- [ ] Migrate form components
- [ ] Standardize input styling
- [ ] Add focus states (accessibility)
- [ ] Remove `Contact.module.css`

**Speakers Page:**
- [ ] Migrate speaker card components
- [ ] Apply grid layout with gap-8
- [ ] Remove `Speakers.module.css`

**Venues Page:**
- [ ] Migrate venue cards
- [ ] Apply consistent spacing
- [ ] Remove `Venues.module.css`

**Admin/Editor Components:**
- [ ] Migrate last (lowest priority)
- [ ] Can keep separate styling if needed
- [ ] Focus on functionality over aesthetics

---

### Phase 6: Cleanup & Optimization
**Duration:** 1 hour
**Risk:** Low
**Goal:** Remove all CSS modules, optimize bundle

#### 6.1 Remove CSS Module Files

```bash
# Find all remaining CSS modules
find src -name "*.module.css" -type f

# Expected output should be empty by this phase
```

**Deletion Checklist:**
- [ ] `Hero.module.css`
- [ ] `Navbar.module.css`
- [ ] `Footer.module.css`
- [ ] `Card.module.css`
- [ ] `UpcomingEvents.module.css`
- [ ] `FAQ.module.css`
- [ ] `About.module.css`
- [ ] `Contact.module.css`
- [ ] `Speakers.module.css`
- [ ] `Venues.module.css`
- [ ] All component-level .module.css files

#### 6.2 Remove Global CSS (If Applicable)

**Keep:**
- `index.css` - For any remaining global resets/fonts
- CSS custom properties if still needed

**Remove:**
- `App.css` - Mostly boilerplate, likely unused

#### 6.3 Remove Tailwind Prefix

Once all CSS modules are removed, the `tw-` prefix is no longer needed:

```js
// tailwind.config.js
export default {
  // DELETE this line:
  // prefix: 'tw-',

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ... rest of config
}
```

**Global find/replace:**
```
Find: tw-
Replace: (empty string)
```

**VS Code:**
- Press `Cmd/Ctrl + Shift + F`
- Find: `tw-`
- Replace: (empty)
- Replace All in: `src/**/*.tsx`

#### 6.4 Build Optimization

```bash
# Build for production
npm run build

# Check bundle size
ls -lh dist/assets/

# Expected improvements:
# - Reduced CSS file size (Tailwind purges unused classes)
# - Faster build time
# - Smaller total bundle
```

**Before/After Comparison:**
- Document bundle sizes
- Compare load times
- Verify no functionality broken

---

## Conflict Prevention Rules

### Rule 1: Never Mix CSS Modules and Tailwind on Same Element

```tsx
// ❌ BAD - Conflict risk
<div className={`${styles.hero} tw-bg-amber tw-p-8`}>
  Content
</div>

// ✅ GOOD - All Tailwind
<div className="tw-bg-amber tw-p-8 tw-min-h-screen">
  Content
</div>

// ✅ GOOD - All CSS Module (during migration)
<div className={styles.hero}>
  Content
</div>
```

### Rule 2: Use Prefix During Migration

The `tw-` prefix ensures Tailwind classes never conflict with existing CSS:

```css
/* Existing CSS module might have */
.flex { display: block; } /* Different from Tailwind */

/* Tailwind with prefix */
.tw-flex { display: flex; } /* No conflict */
```

### Rule 3: Migrate Entire Component at Once

**Don't do partial migrations:**

```tsx
// ❌ BAD - Half migrated component
function EventCard() {
  return (
    <div className={styles.card}> {/* CSS Module */}
      <h3 className="tw-text-2xl tw-font-bold"> {/* Tailwind */}
        Title
      </h3>
      <p className={styles.description}> {/* CSS Module */}
        Description
      </p>
    </div>
  )
}
```

**Do complete component migrations:**

```tsx
// ✅ GOOD - Fully migrated
function EventCard() {
  return (
    <div className="tw-bg-card-bg tw-rounded-xl tw-p-6">
      <h3 className="tw-text-2xl tw-font-bold tw-text-cream">
        Title
      </h3>
      <p className="tw-text-cream-dark tw-leading-relaxed">
        Description
      </p>
    </div>
  )
}
```

### Rule 4: Test After Every Component

**Testing Protocol:**

1. **Visual Check:**
   - Compare before/after screenshots
   - Verify no layout shifts
   - Check hover states

2. **Responsive Test:**
   - Mobile: 375px, 414px
   - Tablet: 768px, 1024px
   - Desktop: 1440px, 1920px

3. **Browser Test:**
   - Chrome
   - Firefox
   - Safari

4. **Accessibility Check:**
   - Run Lighthouse audit
   - Check color contrast
   - Verify keyboard navigation

5. **Run Checks & Commit:**
   ```bash
   # CRITICAL: Run checks before committing
   pnpm check  # Lint, type-check, and build

   # Only proceed if check passes
   git add .
   git commit -m "feat: migrate [ComponentName] to Tailwind"
   git push
   ```

   **See "Development Workflow" section for full details.**

### Rule 5: Component Structure Stays Stable

**Critical for Convex Integration:**

```tsx
// ✅ GOOD - Props interface unchanged
interface EventCardProps {
  title: string      // From database
  category: string   // From database
  price: number      // From database
  imageUrl: string   // From database
}

// Component receives same data, just styled differently
function EventCard({ title, category, price, imageUrl }: EventCardProps) {
  return (
    <div className="tw-bg-card-bg..."> {/* Only styling changed */}
      <h3>{title}</h3> {/* Data usage unchanged */}
      <span>{category}</span>
      <span>${price}</span>
    </div>
  )
}
```

**Database queries unchanged:**
```tsx
// This stays exactly the same
const events = useQuery(api.events.getUpcoming)

// Still works after migration
<EventCard {...event} />
```

---

## Rollback Strategy

### Git-Based Rollback

**Rollback last commit:**
```bash
git revert HEAD
```

**Rollback to specific component:**
```bash
# Restore Hero component and its CSS module
git checkout HEAD~1 -- src/components/Hero.tsx src/components/Hero.module.css
```

**Rollback entire phase:**
```bash
# View commit history
git log --oneline

# Reset to before phase started
git reset --hard <commit-hash>
```

### Component-Level Rollback

If a migrated component has issues:

1. Keep the new Tailwind component as `ComponentNew.tsx`
2. Restore old version from git
3. Debug differences
4. Re-attempt migration

### Emergency Rollback

If site is broken in production:

```bash
# Immediately revert to last known good state
git revert HEAD
npm run build
# Deploy

# Then debug locally
```

---

## Testing Gates

Each phase requires passing these gates before proceeding:

### Gate 1: Setup Validation
- [ ] Tailwind config loads without errors
- [ ] Site appearance unchanged
- [ ] Test class (`tw-bg-amber`) works
- [ ] No console errors

### Gate 2: Component Library
- [ ] All UI components render correctly
- [ ] Button variants match design spec
- [ ] Typography components work
- [ ] No prop errors

### Gate 3: Critical Components
- [ ] Hero contrast fixed (WCAG AA+)
- [ ] Event cards not truncated
- [ ] Spacing increased to spec
- [ ] Buttons follow hierarchy
- [ ] All visual regressions resolved

### Gate 4: Sections
- [ ] FAQ text readable (white, not tan)
- [ ] Typography scale consistent
- [ ] Line lengths constrained
- [ ] All WCAG issues fixed

### Gate 5: Pages
- [ ] All pages migrated
- [ ] Responsive on all breakpoints
- [ ] Forms work correctly
- [ ] No CSS module imports remain

### Gate 6: Production Ready
- [ ] Bundle size reduced
- [ ] Build completes successfully
- [ ] Lighthouse score ≥90
- [ ] Cross-browser tested
- [ ] No dead CSS files

---

## Success Criteria

### Technical Success
✅ Zero CSS module files in codebase
✅ All components use Tailwind utilities
✅ No `import './Component.module.css'` statements
✅ Build size reduced by ≥20%
✅ Tailwind prefix removed (final cleanup)
✅ TypeScript builds without errors

### Design Success
✅ Hero subtitle legible (white/cream on dark)
✅ Event cards display 3 across on desktop
✅ Section headers all 56px (3.5rem)
✅ Button hierarchy clear (2 variants max)
✅ Spacing consistent (48px/64px between sections)
✅ FAQ text meets WCAG AA (white, not tan)
✅ Line lengths ≤75ch for readability
✅ Instagram section consolidated (no duplication)

### Accessibility Success
✅ All text contrast ≥4.5:1 (WCAG AA)
✅ Large text contrast ≥3:1
✅ Focus states visible on all interactive elements
✅ Keyboard navigation works
✅ Screen reader tested
✅ Lighthouse accessibility score ≥95

### Developer Experience Success
✅ LLM can modify styles via class changes
✅ No CSS file editing needed for visual tweaks
✅ Consistent utility patterns throughout
✅ Component reusability improved
✅ Faster iteration on design changes

### Database Integration Success
✅ No Convex schema changes required
✅ Component props unchanged
✅ Content queries work identically
✅ No style classes stored in database
✅ Visual changes don't require DB migrations

---

## Timeline & Effort Estimation

| Phase | Duration | Effort Level | Risk |
|-------|----------|--------------|------|
| Phase 1: Setup | 30 min | Low | Low |
| Phase 2: UI Library | 1-2 hours | Medium | Low |
| Phase 3: Critical | 2-3 hours | High | Medium |
| Phase 4: Sections | 3-4 hours | Medium | Medium |
| Phase 5: Pages | 2-3 hours | Medium | Low |
| Phase 6: Cleanup | 1 hour | Low | Low |
| **Total** | **10-13 hours** | - | - |

**Recommended Schedule:**
- **Week 1:** Phases 1-2 (foundation)
- **Week 2:** Phase 3 (critical fixes)
- **Week 3:** Phases 4-5 (remaining components)
- **Week 4:** Phase 6 (cleanup + optimization)

**Can be compressed to 2-3 days if needed for focused sprint.**

---

## LLM Development Workflow (Post-Migration)

Once migration is complete, this is the ideal LLM-assisted workflow:

### Example 1: Quick Style Changes

**User Request:** "Make the hero title bigger and add more spacing"

**LLM Response:**
```tsx
// Change in Hero.tsx
<h1 className="text-7xl font-headline uppercase text-cream mb-8">
  {/* Changed: text-hero → text-7xl, added mb-8 */}
```

**Time:** 30 seconds (vs 5 minutes editing CSS)

### Example 2: Responsive Adjustments

**User Request:** "Event cards should be 2 columns on tablet"

**LLM Response:**
```tsx
// Change in UpcomingEvents.tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
  {/* Changed: md:grid-cols-2 → sm:grid-cols-2 */}
```

**Time:** 15 seconds

### Example 3: Color Theme Updates

**User Request:** "Change all orange accents to gold"

**LLM Response:**
```js
// Change in tailwind.config.js
colors: {
  amber: {
    DEFAULT: '#CC9966', // Changed from #D9532E
    light: '#D4A574',
  }
}
```

**Time:** 1 minute (affects entire site via config)

---

## Maintenance & Future Considerations

### When to Add New Components

**Use shadcn/ui for complex components:**
- Modals/Dialogs
- Dropdown menus
- Date pickers
- Complex forms

**Build custom for brand-specific:**
- Hero sections
- Event cards
- Feature showcases
- Custom layouts

### Keeping Design Tokens Updated

Update `tailwind.config.js` when:
- Brand colors change
- Typography scale evolves
- Spacing system expands
- New component patterns emerge

### Performance Monitoring

**Monthly checks:**
- Bundle size (should stay ≤300KB CSS)
- Lighthouse performance score (≥90)
- Unused CSS (Tailwind should auto-purge)
- Build time (should be ≤30 seconds)

---

## Appendix A: Tailwind Class Reference

### Common Patterns Used in Migration

**Layout:**
```tsx
className="flex items-center justify-between gap-4"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
className="max-w-7xl mx-auto px-4"
```

**Typography:**
```tsx
className="text-section-title font-headline uppercase text-cream"
className="text-base leading-relaxed text-cream-dark"
className="text-hero font-bold tracking-wide"
```

**Spacing:**
```tsx
className="py-section px-4" // Vertical section spacing
className="space-y-6" // Vertical stack with gap
className="mb-12" // Bottom margin
```

**Colors:**
```tsx
className="bg-midnight text-cream" // Dark section
className="bg-cream text-midnight" // Light section
className="bg-amber text-white" // Primary button
```

**Hover States:**
```tsx
className="hover:bg-amber-light hover:shadow-lg transition-all"
className="hover:scale-105 transition-transform"
```

**Responsive:**
```tsx
className="text-lg md:text-xl lg:text-2xl"
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
className="hidden md:block" // Show on desktop only
```

---

## Appendix B: CSS Module to Tailwind Mapping

### Hero Section

**Before (CSS Modules):**
```css
.hero {
  background-color: var(--midnight);
  min-height: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 1rem;
}

.title {
  font-size: clamp(3rem, 8vw, 6rem);
  font-family: var(--font-headline);
  text-transform: uppercase;
  color: var(--cream);
}
```

**After (Tailwind):**
```tsx
className="bg-midnight min-h-[600px] flex flex-col justify-center items-center px-4"
className="text-hero font-headline uppercase text-cream"
```

### Event Card

**Before (CSS Modules):**
```css
.card {
  background-color: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
}

.card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  transform: scale(1.02);
}
```

**After (Tailwind):**
```tsx
className="bg-card-bg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:scale-[1.02]"
```

---

## Appendix C: Component File Structure (Post-Migration)

```
src/
├── components/
│   ├── ui/                   # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── SectionTitle.tsx
│   │   ├── Paragraph.tsx
│   │   └── index.ts
│   ├── Hero.tsx              # Section components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── EventCard.tsx
│   ├── UpcomingEvents.tsx
│   ├── TheIdea.tsx
│   ├── WhyWeDoIt.tsx
│   ├── FAQ.tsx
│   └── InstagramFeed.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── AboutPage.tsx
│   ├── ContactPage.tsx
│   ├── SpeakersPage.tsx
│   └── VenuesPage.tsx
├── tailwind.css              # Tailwind imports
├── index.css                 # Global styles (minimal)
└── main.tsx
```

**No more .module.css files! 🎉**

---

## Questions & Troubleshooting

### Q: What if Tailwind classes conflict with existing global CSS?

**A:** Use the `tw-` prefix during migration. Remove it only after all CSS modules are deleted.

### Q: How do I handle dynamic classes from the database?

**A:** Don't store Tailwind classes in the database. Use component variants instead:

```tsx
// ❌ BAD
<Button className={event.buttonClass} /> // Class from DB

// ✅ GOOD
<Button variant={event.variant} /> // Variant from DB, classes in component
```

### Q: What if a component is too complex for inline classes?

**A:** Use Tailwind's `@apply` in a CSS file (sparingly):

```css
/* components.css */
.btn-complex {
  @apply px-8 py-4 bg-amber text-white rounded-lg;
  @apply hover:bg-amber-light transition-all duration-300;
  @apply focus:ring-4 focus:ring-amber/50 focus:outline-none;
}
```

But prefer component composition over `@apply`.

### Q: How do I handle animations not supported by Tailwind?

**A:** Extend Tailwind config with custom animations:

```js
// tailwind.config.js
theme: {
  extend: {
    keyframes: {
      glow: {
        '0%, 100%': { boxShadow: '0 0 20px rgba(217, 83, 46, 0.5)' },
        '50%': { boxShadow: '0 0 40px rgba(217, 83, 46, 0.8)' },
      }
    },
    animation: {
      glow: 'glow 2s ease-in-out infinite',
    }
  }
}
```

Then use: `className="animate-glow"`

---

## Final Checklist Before Going Live

### Pre-Deployment Validation

- [ ] All CSS module files deleted
- [ ] No `import './Component.module.css'` statements
- [ ] Tailwind prefix removed
- [ ] Production build succeeds
- [ ] Bundle size acceptable (check `dist/assets/`)
- [ ] No console errors in production build
- [ ] Environment variables configured

### Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Performance Validation

- [ ] Lighthouse score ≥90 (all categories)
- [ ] First Contentful Paint ≤2s
- [ ] Largest Contentful Paint ≤2.5s
- [ ] Time to Interactive ≤3.5s
- [ ] No layout shifts (CLS ≤0.1)

### Accessibility Validation

- [ ] All images have alt text
- [ ] All interactive elements keyboard accessible
- [ ] Focus states visible
- [ ] Color contrast WCAG AA compliant
- [ ] Screen reader tested (VoiceOver/NVDA)
- [ ] Heading hierarchy correct (h1 → h2 → h3)

### Content Integrity

- [ ] All Convex queries working
- [ ] Dynamic content rendering correctly
- [ ] Images loading from database
- [ ] Forms submitting properly
- [ ] Navigation links functional

### Visual Regression

- [ ] Compare screenshots before/after
- [ ] Hero section matches design
- [ ] Event cards aligned properly
- [ ] Spacing consistent throughout
- [ ] Typography hierarchy maintained
- [ ] Colors match brand palette

---

## Sign-Off

**Migration completed by:** _________________
**Date:** _________________
**Final bundle size:** _________________
**Lighthouse score:** _________________
**Notes:** _________________

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-25 | Claude | Initial migration plan created |

---

**Next Steps:**
1. Review this plan with team
2. Set up development environment
3. Begin Phase 1 (Tailwind setup)
4. Track progress using todo list
5. Update this document as needed

**For questions or issues during migration, refer to Troubleshooting section or create new git branch for experimentation.**
