<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->
---
name: Notarik
description: Photograph a receipt, get a categorized expense and a calm running recap — near-zero typing.
---

# Design System: Notarik

## 1. Overview

**Creative North Star: "The Calm Ledger"**

Notarik removes the data-entry chore that kills the spending-tracking habit. The interface must feel like the *opposite* of the spreadsheet it replaces: unhurried, legible, and trustworthy. The numbers are the product — extraction accuracy and the recap are the whole bet — so the visual system gets out of their way. Think Notion's editorial calm and generous whitespace applied to a focused financial tool: a serif display voice for moments of hierarchy (the recap headline, a category total), a clean sans for the dense work (transaction rows, labels, line items).

Restraint is the doctrine. A single indigo/violet accent carries primary actions, the current selection, and state — never decoration. Everything else is a tinted neutral so a corrected total, a budget warning, or a category color reads instantly against a quiet ground. Trust is visual here: tabular figures, honest empty/loading/error states, and projections that *look* like estimates, never like promises.

This system explicitly rejects the **crypto/neon dashboard** aesthetic — no dark-mode neon gradients, no glassmorphism, no hype-y data viz. It equally rejects the **spreadsheet drudgery** (gridlines everywhere, gray-on-gray, no hierarchy) that is the very pain Notarik exists to remove.

**Key Characteristics:**
- Calm, legible, trust-first — the data leads, the chrome recedes.
- Restrained color: tinted neutrals + one indigo/violet accent (≤10% of any screen).
- Editorial hierarchy (serif display) over dense, scannable sans body.
- Mobile-first: the core loop is photo → extraction → reviewable entry, on a phone.
- Honesty as a design value: estimates look like estimates.

## 2. Colors

Strategy: **Restrained** — tinted neutrals do the work, one saturated accent earns attention. Anchor hue: **indigo/violet**.

### Primary
- **Indigo Accent** `[to be resolved during implementation — indigo/violet, OKLCH]`: Primary actions (Add receipt, Save), current selection, focus rings, and active state indicators only.

### Neutral
- **Ink** `[to be resolved]`: Primary text and figures. Pushed toward the dark end of the ramp for ≥4.5:1 body contrast — no elegant-but-unreadable light gray.
- **Muted Ink** `[to be resolved]`: Secondary text, labels, captions. Still ≥4.5:1 on its background.
- **Ground / Surface** `[to be resolved]`: App background and a second, slightly cooler panel layer for nav/toolbars/cards. A true off-white or faintly indigo-tinted neutral — **not** a warm cream/sand bg.

### Category & semantic colors (to define at implementation)
- **Six category hues** (Groceries, Dining, Transport, Shopping, Bills, Other): a small, fixed, color-blind-safe set, each used consistently in the list, the recap chart, and budget bars.
- **Status:** success (remaining / on track), amber (near limit), red (over / deficit) for budget indicators and corrections.

### Named Rules
**The One Voice Rule.** Indigo appears on ≤10% of any screen. Its rarity is what makes "this is the action" and "this is selected" unmistakable.
**The Honest-Money Rule.** Projection and estimate surfaces never use the confident primary accent as if they were facts — they are visibly muted/labelled.

## 3. Typography

**Display Font:** `[serif display to be chosen at implementation]` (with Georgia, serif fallback)
**Body Font:** `[sans to be chosen at implementation]` (with system-ui, sans-serif fallback)

**Character:** A contrast-axis pairing (serif + sans), not two similar sans. The serif gives the recap and key totals an editorial, considered presence; the sans keeps transaction rows, labels, and line items crisp and dense. Numbers use **tabular (lining) figures** everywhere money appears, so columns align and totals are scannable.

### Hierarchy
- **Display** (serif, ~2–2.5rem, tight line-height): recap headline, hero totals. Fixed rem scale, not fluid clamp — this is product UI.
- **Headline** (serif or sans semibold, ~1.5rem): section headers (Transactions, Recap, Budget).
- **Title** (sans medium, ~1.125rem): card/row titles, merchant names.
- **Body** (sans regular, ~0.9375–1rem, 1.5 line-height): descriptions, line items; prose capped 65–75ch.
- **Label** (sans medium, ~0.8125rem): field labels, category chips, metadata. Sentence case — **no** tracked all-caps eyebrows.

### Named Rules
**The Tabular-Figures Rule.** Every monetary value uses tabular lining figures. Misaligned digits read as untrustworthy in a money tool.

## 4. Elevation

Flat by default, in keeping with the **Responsive** (not choreographed) motion energy. Depth is conveyed primarily through tonal layering — the cooler panel surface against the ground — rather than heavy shadows. Shadows appear only as a response to state (a lifted active card, a focused field, an open dialog), never as ambient decoration. No glassmorphism.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest; shadow is a state response, not a resting style.

## 5. Components

<!-- Omitted in seed — no components exist yet. Re-run /impeccable document once the UI is built to capture buttons, the receipt-review card, transaction rows, category chips, budget bars, and the recap chart. -->

## 6. Do's and Don'ts

### Do:
- **Do** keep the data the hero — tinted neutrals for surfaces, indigo accent reserved for action/selection/state.
- **Do** use tabular lining figures for every monetary value.
- **Do** make body text ≥4.5:1 against its background; bump toward Ink if contrast is even close.
- **Do** give every state an honest treatment: skeleton loaders for extraction, an empty state that teaches the first-receipt flow, clear error recovery.
- **Do** keep projections visibly labelled as estimates ("Estimated if your current pace continues") and muted, per §8c of PRODUCT.md.
- **Do** design mobile-first; the photo → extraction → review path must be flawless on a phone.

### Don't:
- **Don't** ship the **crypto/neon dashboard** look: no dark-mode neon gradients, no glassmorphism, no hype-y data viz.
- **Don't** recreate the **spreadsheet** it replaces: no gridlines-everywhere, no gray-on-gray, no flat hierarchy.
- **Don't** use a warm cream/sand/paper body background "because receipts" — warmth, if any, lives in accent and type, not the ground.
- **Don't** use tracked all-caps eyebrows above every section, numbered section markers, or identical icon-card grids.
- **Don't** use gradient text or colored side-stripe borders (`border-left` as accent) anywhere.
- **Don't** let the accent leak into decoration — if indigo is on more than ~10% of the screen, something is wrong.
