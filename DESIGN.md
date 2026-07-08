---
name: Notarik
description: Photograph a receipt, get a categorized expense and a calm running recap — near-zero typing.
colors:
  primary: "#2A85FF"
  primary-deep: "#1B6FDB"
  primary-soft: "#B1E5FC"
  accent: "#8E59FF"
  accent-soft: "#CABDFF"
  success: "#83BF6E"
  success-soft: "#B5E4CA"
  warning: "#FFB020"
  warning-soft: "#FFD88D"
  danger: "#FF6A55"
  danger-soft: "#FFBC99"
  neutral-0: "#FCFCFC"
  neutral-bg: "#F4F4F4"
  neutral-panel: "#EFEFEF"
  neutral-border: "#9A9FA5"
  neutral-muted: "#6F767E"
  neutral-ink-soft: "#33383F"
  neutral-ink-deep: "#272B30"
  neutral-ink: "#1A1D1F"
  neutral-black: "#111315"
  cat-groceries: "#83BF6E"
  cat-dining: "#FFB020"
  cat-transport: "#2A85FF"
  cat-shopping: "#8E59FF"
  cat-bills: "#FF6A55"
  cat-other: "#6F767E"
typography:
  display:
    fontFamily: "Fraunces, Georgia, 'Times New Roman', serif"
    fontSize: "1.875rem"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.6
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.6
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.7143
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.2308
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.xl}"
    padding: "0 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
  button-stroke:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-ink}"
    rounded: "{rounded.xl}"
    height: "48px"
  card:
    backgroundColor: "{colors.neutral-0}"
    rounded: "{rounded.lg}"
    padding: "24px"
  field:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.neutral-ink}"
    rounded: "{rounded.xl}"
    height: "48px"
  status-blue:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
---

# Design System: Notarik

## 1. Overview

**Creative North Star: "The Calm Ledger"**

Notarik removes the data-entry chore that kills the spending-tracking habit. The interface is the opposite of the spreadsheet it replaces: unhurried, legible, and trustworthy. The numbers are the product, so the visual system gets out of their way. A serif display voice (Fraunces) marks the moments that matter — the recap headline, a budget total, a sign-in heading — while a dense, well-tuned sans (Inter) carries every working surface: rows, labels, forms, buttons, data.

Restraint is the doctrine. A single indigo accent (`#2A85FF`) carries primary actions, the current selection, and state — never decoration. A five-color status vocabulary (blue / green / red / purple / yellow, each a soft-tint background with a saturated text color) gives every badge, pill, and indicator a consistent, calm home instead of inventing one-off treatments per feature. Everything else is a tinted neutral, so a corrected total, a recurring-expense flag, or a category color reads instantly against a quiet ground.

This system explicitly rejects the **crypto/neon dashboard** aesthetic — no neon gradients, no glassmorphism, no hype-y data viz. It equally rejects the **spreadsheet drudgery** (gridlines everywhere, gray-on-gray, no hierarchy) that is the very pain Notarik exists to remove.

**Key Characteristics:**
- Calm, legible, trust-first — the data leads, the chrome recedes.
- Restrained color: tinted neutrals + one indigo accent (≤10% of any screen) + a fixed status-pill vocabulary for state.
- Editorial hierarchy (Fraunces serif) over dense, scannable Inter body.
- A shared component kit (`components/ui`) — Button, Card, Field, Checkbox, Switch, Status, Title — is the single source of truth for every screen; no screen invents its own button or badge.
- Honesty as a design value: estimates look like estimates, corrections are visibly flagged, nothing pretends to be more certain than it is.

## 2. Colors

Strategy: **Restrained** — tinted neutrals do the work, one saturated accent earns attention, and a small closed set of status colors covers every state.

### Primary
- **Signal Blue** (`#2A85FF`): Primary actions (Save, Sign in, Add for this month), current selection, focus rings, links, and the "Recurring" / info status pill. Deepens to **Signal Blue Deep** (`#1B6FDB`) on hover/active. Its soft tint, **Signal Blue Soft** (`#B1E5FC`), is the background for blue status pills and the bulk-action toolbar.

### Secondary
- **Violet Accent** (`#8E59FF`, soft tint `#CABDFF`): Reserved for the purple status pill (used for tags) and the Shopping category dot. A second accent, used sparingly and only in the status vocabulary — never a second primary action color.

### Neutral
- **Ink** (`#1A1D1F`): Primary text and figures, headings. The dark end of the ramp — chosen for ≥4.5:1 body contrast, not the elegant-but-thin light gray AI default.
- **Muted Ink** (`#6F767E`): Secondary text, captions, timestamps, placeholder copy.
- **Border** (`#9A9FA5`): Stroke color for inputs, dividers, dashed projection borders.
- **Panel** (`#EFEFEF`): Card/section borders, subtle separators.
- **Ground** (`#F4F4F4`): The app's background layer (`DashboardShell`), and the tonal fill for secondary content (item breakdown rows, the dashed projection card, badge track backgrounds).
- **Surface** (`#FCFCFC` / pure white): Card and panel foreground — where content sits atop Ground.
- **Dark-mode ink** runs `#272B30` (deep panel) → `#1A1D1F` (app background) → `#111315` (deepest), a mirrored ramp, not an inverted-hue afterthought.

### Category & status colors
- **Six category hues**, fixed and reused everywhere a category appears (transaction dot, recap donut, budget breakdown): Groceries `#83BF6E`, Dining `#FFB020`, Transport `#2A85FF`, Shopping `#8E59FF`, Bills `#FF6A55`, Other `#6F767E`.
- **Status pill vocabulary** (the `Status` component, five variants): **blue** (info / recurring), **green** (on-track / success), **red** (over-budget / danger), **purple** (tags), **yellow** (near-limit / edited-flag). Each variant is a soft-tint background (`success-soft`, `danger-soft`, etc.) with its saturated color as text — never a saturated fill with white text; pills are calm, not alarms.

### Named Rules
**The One Voice Rule.** Signal Blue is the only color that ever means "act here" or "this is selected." It appears on ≤10% of any screen. Its rarity is what makes the affordance unmistakable.
**The Closed Status Set Rule.** Every badge, flag, or state indicator in the product uses one of the five `Status` variants. Never invent a new inline color treatment for a new feature (recurring, edited, tags all draw from the same five).
**The Honest-Money Rule.** Projection and estimate surfaces never use the primary accent as if they were facts — `Projection` uses a dashed border and muted neutral fill, never Signal Blue.

## 3. Typography

**Display Font:** Fraunces (with Georgia, "Times New Roman", serif fallback)
**Body Font:** Inter (with system-ui, sans-serif fallback)

**Character:** A contrast-axis pairing — serif for the handful of moments that carry weight (recap total, budget spent figure, sign-in/sign-up headings, the empty-error illustration heading), Inter for everything else: labels, buttons, rows, dense data. Numbers use **tabular (lining) figures** (the `.nums` utility) everywhere money appears, so columns align.

### Hierarchy
- **Display** (Fraunces, 500, `text-3xl`–`text-[40px]`, tight tracking `-0.02em`): recap/budget hero totals, sign-in/sign-up page headings. Fixed rem sizes per breakpoint, not fluid clamp — this is product UI.
- **Headline** (Inter semibold 600, `text-title-1-s` / 20px, `-0.02em`): section headers — Recap, Monthly budget, Transactions, page titles in the dashboard header.
- **Title** (Inter semibold 600, `text-base-1-s` / 15px): card/row titles, merchant names, form labels that need weight.
- **Body** (Inter medium 500, `text-base-2` / 14px, 1.71 line-height): descriptions, row metadata, button labels; prose capped 65–75ch.
- **Label** (Inter medium 500, `text-caption-1-m` / 13px or `text-caption-2-m` / 12px): field labels, status pills, metadata, timestamps. Sentence case — **no** tracked all-caps eyebrows.

### Named Rules
**The Tabular-Figures Rule.** Every monetary value uses tabular lining figures (`.nums`). Misaligned digits read as untrustworthy in a money tool.
**The One-Serif-Moment Rule.** Fraunces appears only on hero figures and page/auth headings — never on a button, label, badge, or table cell. If a UI label is tempted into the display font, it's the wrong weight of emphasis; reach for size/weight in Inter instead.

## 4. Elevation

Hybrid, weighted toward flat. Most surfaces (Recap, BudgetPanel, Projection, TransactionList) are flat: a 1px `neutral-panel` border on white, no shadow, depth conveyed by the Ground/Surface tonal step. `shadow-widget` is reserved for the two kinds of surface that need to feel lifted above the rest: the primary "Add a receipt" card (the one task the whole product exists for) and anything genuinely floating — the bulk-action toolbar, dropdowns, the receipt-viewer modal and its close button. No glassmorphism, no ambient decorative shadow.

### Shadow Vocabulary
- **Stroke** (`shadow-stroke`: `0 0 0 2px #EFEFEF inset`): the default "bordered card" look, used via `Card` and most section wrappers instead of a CSS border, so the stroke never adds to layout width.
- **Widget** (`shadow-widget`: soft ambient drop + inner highlight): the primary-action card and any element that needs to read as physically raised — used sparingly.
- **Dropdown** (`shadow-dropdown`: inset stroke + diffused drop): floating surfaces — the bulk-recategorize toolbar, the receipt-viewer modal.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest; `shadow-widget` and `shadow-dropdown` are reserved for the one primary action and genuinely floating elements — never applied to a passive data card just for texture.

## 5. Components

The `components/ui` kit is canonical. Every screen — dashboard, auth, receipt review, transaction ledger — draws buttons, cards, form fields, checkboxes, toggles, and status pills from these seven primitives. No screen defines its own button or badge style.

### Buttons (`Button`)
- **Shape:** `rounded-xl` (12px) default size, `rounded-lg` (8px) for the `small` size.
- **Primary:** Signal Blue fill (`bg-primary-500`), white text, `h-12 px-5` default / `h-10 px-4` small.
- **Stroke / White / Stroke-red variants:** transparent or white fill with a `shadow-stroke` outline instead of a visible border; `stroke-red` inverts to solid danger fill on hover, for destructive-but-not-default actions.
- **Hover / Focus:** background deepens one step (`primary-500` → `primary-600`); disabled state drops to 50% opacity and disables pointer events — never a separate disabled color.

### Status pills (`Status`)
- **Shape:** `rounded-md` (6px), `px-2`, fixed `leading-6` so every pill is the same height regardless of content.
- **State:** five closed variants (blue/green/red/purple/yellow) as described in Colors §2. Accepts native span props (e.g. `title`) so a pill can carry a tooltip without a wrapper.

### Cards / Containers (`Card`)
- **Corner Style:** `rounded-lg` (8px).
- **Background:** white (`neutral-0`) on the `neutral-100` app ground.
- **Shadow Strategy:** flat by default (no shadow prop); the primary "Add a receipt" surface opts into `shadow-widget` explicitly.
- **Internal Padding:** `p-6`, `p-4` on mobile (`m:p-4`).
- **Title/action slot:** an optional `title` + `action` header row, `mb-8` above content.

### Inputs / Fields (`Field`, `Checkbox`, `Switch`)
- **Field:** `h-12 rounded-xl`, transparent 2px border, `bg-neutral-100` at rest, border appears + background lifts to white on focus. Invalid state swaps to a danger tint background and danger text/placeholder — never just a red outline.
- **Checkbox:** 24×24 `rounded-md` box, 2px border at 40% neutral opacity; checked state fills Signal Blue with a white tick glyph (SVG, not a native browser checkbox render). Always paired with a same-line label at `text-base-1-s`.
- **Switch:** 48×24 pill track, neutral at rest, Signal Blue when on; the thumb carries its own soft drop shadow so it reads as physically resting on the track.

### Navigation (`DashboardShell` / `Sidebar` / `Header`)
- Sidebar collapses to a 96px icon rail between 768–1259px (`rail:`), expands to 300px (`wide:`, ≥1260px) / 340px (`x-up:`, ≥1340px), and becomes an off-canvas drawer with a scrim below 768px.
- Header shows the page title + an optional right-aligned summary (total spent / expense count), sticky at the top with the same white/`neutral-900` dark surface as cards.
- Active nav state: Signal Blue text/icon on a `primary-100` tint background — the same "soft tint + saturated accent" formula as status pills, kept consistent rather than inventing a separate nav-active treatment.

### Title bar (`Title`)
A heading with a short colored bar to its left (`before:` pseudo-element, category-colored), used to key a section to one of the five status colors at a glance. Distinct from a plain `<h2>` — reserve it for places where the color itself carries meaning (e.g. tying a section to a status), not as generic section-heading decoration.

## 6. Do's and Don'ts

### Do:
- **Do** pull every button, card, form field, checkbox, toggle, and badge from `components/ui` — never hand-roll an equivalent with raw Tailwind on a new screen.
- **Do** keep the data the hero — tinted neutrals for surfaces, Signal Blue reserved for action/selection/state.
- **Do** use tabular lining figures (`.nums`) for every monetary value.
- **Do** make body text ≥4.5:1 against its background; bump toward Ink if contrast is even close.
- **Do** give every state an honest treatment: skeleton/loading copy for extraction, an empty state that teaches the first-receipt flow, clear error recovery with a retry action.
- **Do** keep projections visibly labelled as estimates ("Estimated if your current pace continues") and styled with the dashed/muted `Projection` treatment, never the primary accent, per §8c of PRODUCT.md.
- **Do** design mobile-first; the photo → extraction → review path must be flawless on a phone.
- **Do** vary spacing for rhythm on the Overview page — tight within a related group (recap + budget + projection), generous between groups (add-receipt → this month's picture → ledger).

### Don't:
- **Don't** ship the **crypto/neon dashboard** look: no neon gradients, no glassmorphism, no hype-y data viz.
- **Don't** recreate the **spreadsheet** it replaces: no gridlines-everywhere, no gray-on-gray, no flat hierarchy.
- **Don't** use a warm cream/sand/paper body background "because receipts" — warmth, if any, lives in the accent and type, not the ground.
- **Don't** use tracked all-caps eyebrows above every section, numbered section markers, or identical icon-card grids.
- **Don't** use gradient text or colored side-stripe borders (`border-left` as accent) anywhere — the `Title` bar is the one deliberate, closed exception to this, not a license to add more.
- **Don't** let Signal Blue leak into decoration — if it's on more than ~10% of the screen, something is wrong.
- **Don't** invent a one-off badge color for a new feature; every flag (recurring, edited, tag, budget status) must map to one of the five closed `Status` variants.
- **Don't** apply `shadow-widget` to a passive data card for texture — it's reserved for the primary action surface and floating elements only.
