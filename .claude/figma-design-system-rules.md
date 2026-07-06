# Notarik — Figma/MCP Design System Rules

Framework: Next.js 16 (App Router) + React 19 + Tailwind CSS v4. No component library (shadcn/Radix/MUI) — all UI is hand-built.

## 1. Design Tokens

**Location:** `app/globals.css`, inside `@theme { ... }` (Tailwind v4's CSS-native token API — no `tailwind.config.js` exists in this repo).

- Colors are defined as CSS custom properties in **OKLCH** (`oklch(L C H)`), grouped by role, not by raw palette:
  - Neutrals/ground: `--color-bg`, `--color-surface`, `--color-surface-2`, `--color-border`, `--color-border-strong`, `--color-ink`, `--color-muted`
  - Brand: `--color-primary`, `--color-primary-hover`, `--color-primary-ink`, `--color-primary-soft`, `--color-accent`
  - Semantic/status: `--color-success`, `--color-warning`, `--color-danger`, `--color-danger-soft`
  - Fixed category hues: `--color-cat-groceries`, `--color-cat-dining`, `--color-cat-transport`, `--color-cat-shopping`, `--color-cat-bills`, `--color-cat-other`
- Typography: `--font-sans` (Inter) and `--font-serif` (Fraunces), wired to `next/font/google` CSS variables in `app/layout.tsx`.
- Radius scale: `--radius-sm` (6px) → `--radius-xl` (22px).
- Motion: single easing token `--ease-out-quint`.
- Z-index: semantic scale (`--z-sticky`, `--z-modal`, `--z-toast`) — never use raw z-index numbers.
- Because these are declared under `@theme`, Tailwind auto-generates matching utilities (e.g. `--color-primary` → `bg-primary`, `text-primary`, `border-primary`). **When mapping Figma variables, bind to these token names directly** — do not introduce a parallel token layer (no `tokens.json`, no style-dictionary).
- Design philosophy documented inline: "The Calm Ledger" — near-white ground, single indigo/violet accent used at ≤10% coverage, color reserved for meaning (action/selection/status/category) not decoration.

## 2. Component Library

**Location:** two tiers, both flat (no atomic-design subfolders):
- `components/ui/` — primitive/generic elements: `Button.tsx`, `Badge.tsx`, `Input.tsx`
- `components/` (root) — feature/domain components: `ReceiptUploader.tsx`, `ReviewCard.tsx`, `TransactionList.tsx`, `BudgetPanel.tsx`, `Recap.tsx`, `Projection.tsx`, `CategoryPicker.tsx`, `MonthSelector.tsx`, `DonutChart.tsx`, `CameraCapture.tsx`, `ProcessingState.tsx`, `BackupBar.tsx`, `Toast.tsx`

No Storybook or component documentation site exists. No barrel/index file — import components by direct path.

**Primitive pattern** (see `components/ui/Button.tsx`, `Badge.tsx`):
```tsx
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" };
const variants = { primary: "bg-primary text-primary-ink hover:bg-primary-hover", ... };
export function Button({ variant = "primary", className = "", ...props }: Props) {
  return <button className={`...base classes... ${variants[variant]} ${className}`} {...props} />;
}
```
- Named exports only (no default exports for components).
- Props type extends the native HTML element's attributes and spreads `...props` onto the root DOM node.
- Variant styling via a plain object map keyed by a union-typed prop, not `cva`/`tailwind-variants`/`clsx` — no variant-management library is installed.
- `className` is always an override slot appended last, defaulting to `""`.
- Focus states use `focus-visible:` with a boxed glow via `shadow-[0_0_0_3px_var(--color-primary-soft)]` rather than default `ring-*` utilities.

## 3. Frameworks & Libraries

- **UI:** React 19, Next.js 16 App Router (`app/` directory: `app/page.tsx`, `app/layout.tsx`, `app/login/page.tsx`, `app/api/*` route handlers).
- **Styling:** Tailwind CSS v4 via `@tailwindcss/postcss` (PostCSS plugin, no separate `tailwind.config.ts`). Global styles/tokens live entirely in `app/globals.css`.
- **State/data:** no external state library (no Redux/Zustand/TanStack Query visible); server data via `pg` (raw Postgres) in `lib/db.ts`.
- **Build/deploy:** `next.config.ts` sets `output: "standalone"` for Docker; deployed via `Dockerfile` + `docker-compose.yml` + Traefik.
- **Lint:** flat ESLint config (`eslint.config.mjs`) extending `eslint-config-next` core-web-vitals + typescript.
- ⚠️ Per `AGENTS.md`, this project pins a **non-standard Next.js version** with breaking API changes from the trained-on Next.js — consult `node_modules/next/dist/docs/` before assuming any Next.js API/convention.

## 4. Asset Management

- Static assets in `public/` (currently only stock SVGs — `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` — leftover Next.js defaults, not part of the product's visual system).
- Product icons are **not files** — they're inline React components, see §5.
- Docs/marketing screenshots live in `docs/screenshots/*.png` (product documentation, not app assets).
- No image CDN or `next/image` remote-pattern config is set up; no asset optimization pipeline beyond Next's default `next/image`.

## 5. Icon System

**Location:** single file, `components/icons.tsx` — every icon is a hand-authored inline SVG React component (no icon package like `lucide-react`/`heroicons` is installed).

Shared factory pattern:
```tsx
type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };
function base({ size = 20, ...props }: IconProps) {
  return { width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const, "aria-hidden": true, ...props };
}
export const CameraIcon = (p: IconProps) => <svg {...base(p)}>...</svg>;
```
- Grid: 24×24. Stroke: 1.6, round caps/joins, `currentColor` (icons inherit text color — never hardcode icon fill/stroke colors).
- Naming convention: `<Concept>Icon` (PascalCase, `Icon` suffix) — e.g. `CameraIcon`, `UploadIcon`, `ScanIcon`, `CheckIcon`, `AlertIcon`, `XIcon`, `RefreshIcon`, `ReceiptIcon`, `ChevronDownIcon`, `TrashIcon`, `TrendIcon`, `PlusIcon`, `SearchIcon`, `ChevronLeftIcon`, `ChevronRightIcon`.
- **When Figma provides new icons, add them to this same file following the exact `base()` factory pattern** rather than introducing a new icon component/library.

## 6. Styling Approach

- **Methodology:** Tailwind utility classes directly in JSX (no CSS Modules, no styled-components/emotion). The only bespoke CSS is the token layer and reduced-motion rules in `app/globals.css`, plus rare component-scoped `<style>` blocks for keyframes not expressible via utilities alone (see `components/Toast.tsx`'s inline `@keyframes toast-in`).
- **Global styles:** `app/globals.css` — `@import "tailwindcss";`, `@theme {...}` tokens, and an `@layer base {...}` block setting body font/background/color, `::selection`, a `.nums` utility (`font-variant-numeric: tabular-nums lining-nums` for money/tabular alignment), and a global `:focus-visible` outline. Also a top-level `@media (prefers-reduced-motion: reduce)` block disabling animation globally.
- **Responsive design:** standard Tailwind responsive prefixes (`sm:`, `md:`, etc.) used ad hoc in component markup; no dedicated breakpoint tokens beyond Tailwind defaults.
- **Accessibility conventions already in place:** visible on-brand focus rings everywhere, `aria-live`/`role="status"` on the Toast, `aria-hidden` on all decorative icons, reduced-motion handling both globally and per-component.

## 7. Project Structure

```
app/                    # Next.js App Router
  layout.tsx            # root layout: fonts (Inter, Fraunces), metadata, viewport
  page.tsx              # main app entry
  globals.css           # design tokens + base styles
  login/page.tsx
  api/                  # route handlers: auth, budget, extract, import, transactions
components/
  ui/                   # generic primitives (Button, Badge, Input)
  icons.tsx             # all icon components
  *.tsx                 # feature components, flat, PascalCase, one per file
lib/                    # framework-agnostic logic: db.ts, excel.ts, extraction.ts,
                        # pdf.ts, recap.ts, categories.ts, format.ts, types.ts, etc.
middleware.ts           # auth middleware at root
```
- No feature-folder/domain-folder nesting — components stay flat and are distinguished by name, not directory.
- Business logic and data access are pushed into `lib/`, kept out of components.
- No barrel files (`index.ts`) anywhere — always import from the concrete file path.

## Notes for Figma → Code / Code → Figma work

1. **Bind Figma variables to the exact `@theme` token names in `app/globals.css`** — do not fabricate a new naming scheme or a separate tokens file.
2. **Reuse `components/ui/*` primitives** (`Button`, `Badge`, `Input`) for any matching Figma component instance instead of generating new one-off styled elements.
3. **New icons go into `components/icons.tsx`**, following the `base()` factory (24×24 viewBox, stroke 1.6, `currentColor`), named `<Name>Icon`.
4. Respect the "Calm Ledger" constraint: `--color-primary` (indigo/violet) is the only saturated accent and should stay a minority of any screen's color usage; everything else is neutral ink/surface/border tokens or semantic status colors.
5. Tailwind v4 is CSS-first — there is no `tailwind.config.ts` to edit; all design-system changes happen in `app/globals.css`.
