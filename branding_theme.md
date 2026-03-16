## Kotak811 — Branding & Theming Guide

This document describes the branding tokens, color palette, typography, spacing, and implementation notes for the Kotak811 web project. It's written so a developer (or an automated tool like Cursor) can implement the same theme in a different project.

Contents
- Brand overview
- Design tokens (CSS variables)
- Color palette (HSL + suggested hex)
- Typography
- Spacing, radii, and shadows
- Tailwind mapping and config snippet
- Usage examples (CSS var, Tailwind, React/JSX)
- Dark mode
- Accessibility notes
- How to apply this theme to another project (step-by-step)

---

## Brand overview

- Primary color: vivid brand blue used for CTAs and highlights.
- Accent: energetic magenta/red used as an accent or error/attention color.
- Overall voice: modern, clean, slightly rounded radii, soft shadows, generous spacing.

Design token philosophy: keep semantic tokens (primary, foreground, background, card, muted, accent, destructive, ring, border) as CSS variables. Map Tailwind color names to these variables so the design system can be consumed by Tailwind and plain CSS.

---

## Design tokens (CSS variables)

The project defines tokens in `src/tokens.css` and refines them in `src/index.css`. Use the same variable names to keep compatibility.

Root (light mode) token examples:

- --background: 210 20% 98%; (HSL components)
- --foreground: 215 25% 15%;
- --card: 0 0% 100%;
- --card-foreground: 215 25% 15%;
- --primary: 231 100% 61%;
- --primary-foreground: 0 0% 100%;
- --secondary: 231 100% 96%;
- --secondary-foreground: 231 100% 30%;
- --muted: 210 25% 95%;
- --muted-foreground: 215 15% 45%;
- --accent: 343 100% 96%;
- --accent-foreground: 343 100% 50%; (NOTE: some files reference exact hex #ff0049 for accent foreground)
- --destructive: 0 84.2% 60.2%;
- --border / --input / --ring: used for form borders and focus styles
- --radius: 0.75rem (project currently uses 0.75rem in `index.css` but `tokens.css` sets 0.5rem; prefer 0.75rem for Kotak811)

Also: chart palette variables (--chart-1 ... --chart-5), sidebar-specific tokens, gradient and shadow tokens like --gradient-primary and --shadow-primary.

How they are consumed (Tailwind): colors are set as `hsl(var(--token))`, so the raw token is H S% L% components.

---

## Color palette (HSL with suggested hex)

Use the HSL values as the source of truth. I include approximate hex values for convenience where the project comments provide them.

- Primary (HSL): 231 100% 61% — approx #3857FF (project comment: `#3857ff`).
- Accent (HSL): 343 100% 50% (accent-foreground) — approximate hex varies; project references `#ff0049` for the accent foreground in places. Use the HSL tokens for precise theming and keep the explicit hex for asset matches if required.
- Background (light HSL): 210 20% 98% — very light
- Foreground (light): 215 25% 15% — dark text
- Muted / surfaces: ranges of light blues/greys via HSL tokens in `tokens.css` / `index.css`.

Chart suggestions (from tokens):
- --chart-1: primary (231 100% 61%)
- --chart-2: 231 100% 50%
- --chart-3..5: variants of accent (343 ...) at different lightness values

Note: Always prefer tokens (HSL) for color calculations and semantic mapping. Hex values may be used for images or 3rd-party assets that don't support HSL.

---

## Typography

- Font stack (token): --font-sans: "Plus Jakarta Sans", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
- Body font: use `var(--font-sans)`; optional self-hosted font is supported via `src/fonts.css` (commented @font-face example).
- Tailwind mapping: `fontFamily.sans: ['var(--font-sans)']` is already present in `tailwind.config.ts`.

Suggested scale (match project styling):
- Base: 16px (1rem)
- Headings: h1 ~ 2rem, h2 ~ 1.5rem, h3 ~ 1.25rem (customize in the other project to match desired hierarchy)

Icon sizing tokens (from tokens.css):
- --icon-size-sm: 16px
- --icon-size-md: 20px
- --icon-size-lg: 24px
- --icon-stroke: 1.75

---

## Spacing, radii, shadows

- Border radius tokens in Tailwind extend: --radius is used to compute `lg`, `md`, `sm` variants. Project values: 0.5rem in `tokens.css` and 0.75rem in `index.css`. Prefer 0.75rem for Kotak811; pick one and be consistent.
- Shadows: --shadow-primary (complex multi-layer RGBA in `tokens.css`). Use for primary elevated cards or hero elements.

---

## Tailwind mapping (how the project wires tokens to Tailwind)

Key pattern used in `tailwind.config.ts`:

colors: {
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
  secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
  /* ... card, popover, accent, destructive, muted, chart etc. */
}

This is the recommended approach: keep Tailwind color names semantic and map them to the HSL CSS variables so components can use `bg-primary`, `text-primary-foreground`, `border-border`, etc.

---

## Usage examples

1) Plain CSS using variables

```css
.btn-primary {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-radius: var(--radius);
  box-shadow: var(--shadow-primary);
}
```

2) Tailwind classes (once Tailwind config is wired)

```html
<button class="bg-primary text-primary-foreground px-4 py-2 rounded-lg">Get started</button>
```

3) React + Tailwind example (component)

```tsx
export function Button({ children }: { children: React.ReactNode }) {
  return <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">{children}</button>
}
```

4) Dark mode: add class `dark` to `<html>` or `<body>` to flip tokens as defined in `tokens.css`/`index.css`.

---

## Dark mode

The project includes a `.dark` selector block in `src/tokens.css` and `src/index.css` that redefines the HSL components for all semantic tokens. Implementation:

- Strategy A (class): Add `class="dark"` at the root element to enable dark tokens.
- Strategy B (prefers-color-scheme): you can also set tokens via a media query if you prefer auto-switching (not present in this repo but supported).

Important: Keep the same token names across light/dark to ensure components don't need variant-specific logic.

---

## Modularism & Journey Builder

The theme supports the embedded **Journey Builder** (opened via logo click during the journey). The builder can override:

- **Colors**: `--primary-bank`, `--primary-bank-dark`, `--secondary-bank` (via BrandingContext)
- **Font**: Open Sans, Inter, Poppins, Roboto, Plus Jakarta Sans
- **Radius**: `--radius-bank`
- **CTA labels, step titles, legal texts**: via JourneyConfigContext

**Token hierarchy:**
1. Dashboard/portal UI uses `dashboard-primary` (Tailwind) — Kotak811 vivid blue by default
2. Journey steps use `--primary-bank` — overridden by the journey builder (BrandingContext)
3. Classes `.btn-primary`, `.enterprise-input:focus`, `.btn-link`, etc. use `var(--primary-bank)` so they respond to the builder

---

## Accessibility notes

- Ensure primary-foreground on primary colors meets 4.5:1 contrast for body text when used for text. The project sets `--primary-foreground: 0 0% 100%` (white) for a dark primary; test contrast for different L values.
- For buttons and interactive controls, always include visible focus styles. Tailwind `ring` maps to `--ring` token; prefer `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring`.
- Use `muted-foreground` for secondary descriptive text.
