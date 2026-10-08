---
name: livepeer-design-guidelines
description: "How Livepeer surfaces are designed: colour and type roles, spacing, composition, responsive behaviour and accessibility. Use when building or changing anything on livepeer.org, and for any product, tool, document or prototype that should feel native to Livepeer."
---

# Livepeer design guidelines

These are the rules livepeer.org is built to. They began as the Livepeer UI guidelines from Peace Node and now live with the site, so they change with it.

## Design thesis

Livepeer surfaces use neutral canvases, precise borders, restrained typography and compact product controls. Public surfaces introduce more breathing room and deliberate display type. Brand colour and motion are sparing, non-interactive expressions, never affordance systems. Establish hierarchy through content, type, spacing and alignment before adding visual treatment.

## Priorities

When requirements compete, protect them in this order:

1. Preserve the user's task, supplied content, data and functional constraints.
2. Use the theme and the existing components instead of parallel styles or substitute component libraries.
3. Make the primary job and next action immediately clear.
4. Preserve accessibility, responsive behaviour and semantic HTML.
5. Refine hierarchy and density without adding decoration.

## Foundations

### Colour roles

- Use semantic Tailwind utilities so light and dark themes remain intact. `background` and `foreground` define the canvas and default text; `card` groups a genuinely self-contained object; `muted` supports subdued regions and supporting text.
- `primary` is the default action treatment. `secondary` and `accent` provide lower-emphasis actions and state changes. `border`, `input` and `ring` define separation, controls and visible focus. `destructive` is reserved for destructive actions and errors.
- Use `chart-1` to `chart-5` for ordered data-series distinction, never as an alternative action palette.
- Livepeer green (`brand`) is not an affordance colour. Do not use it for buttons, links, hover or focus treatments, selected controls, success or product actions. It is limited to non-interactive brand expression in diagrams, artwork and branded motion.
- The Livepeer mark is black or white, never green, never a gradient.
- Do not introduce a second token layer or hard-coded theme colours for roles the theme already covers.

### Typography roles

- Inter (`font-sans`) is the one face for everything: product UI, navigation, forms, data, docs, body copy, headings and display statements. Hierarchy comes from the type roles below, not from a second face.
- Geist Mono (`font-mono`) is limited to code, commands, paths, IDs, timestamps and short technical annotations, normally at `text-xs` or `text-sm`. Use tabular numerals where aligned values matter. Never set explanatory prose in monospace.
- The Agent display face is lockup-only. Do not use it for headings, controls or body copy.

The semantic type scale is defined in the theme. Each `text-*` utility carries its size, line height, weight and letter spacing.

- **UI caption** — `text-ui-caption`, 12/16px, 500. Compact labels, table annotations, timestamps and technical metadata.
- **UI body** — `text-ui-body`, 14/20px, 400. Controls, navigation, tables, forms and routine product copy.
- **Reading body** — `text-reading-body`, 16/28px, 400. Docs, editorial prose and explanatory content inside a constrained measure.
- **Page title** — `text-page-title`, 32px, 300, −0.025em. The primary title in product and console shells; pair with `text-balance`.
- **Display small** — `text-display-sm`, 36px, 300, −0.045em. Mobile public headings and smaller statements.
- **Display medium** — `text-display-md`, 48px, 300, −0.045em. Public section statements and compact desktop heroes.
- **Display large** — `text-display-lg`, 60px, 300, −0.045em. Large desktop heroes and mobile-menu navigation.
- **Display fluid** — `text-display-fluid`, 40–64px with the viewport, 300, −0.045em. Wide public or editorial statements that should grow continuously.

Use responsive roles rather than arbitrary sizes: `text-display-sm sm:text-display-md` for a 36→48px statement, `text-display-sm sm:text-display-lg` for a 36→60px hero, `text-display-sm sm:text-display-fluid` for a statement that grows with the window. Do not add a token for a one-off size.

### Spacing and shape

- Work from Tailwind's 4px spacing rhythm. Common steps are 8, 16, 24 and 40px; choose them by relationship rather than applying one gap everywhere.
- Page gutters start at 16px, grow to 24px at `sm`, and may reach 40px on wide layouts.
- Use `rounded-sm` for controls, menus, alerts, tabs and dialogs. Reserve `rounded-full` for geometry that must stay circular or track-shaped: avatars, radio controls, switches, sliders, progress tracks.
- Prefer borders and fill changes for static separation. Reserve pronounced shadows for modal, floating or focused overlay layers.
- Use Lucide icons only. Icons clarify an action or a state; they are not decoration.

## Composition

Start with the user's job, not a generic page category. The first viewport should make the purpose, the current state and the primary action obvious.

- Establish hierarchy with type, spacing and alignment before adding surfaces.
- Keep pages on one continuous canvas unless a boundary communicates a real group, state or interaction.
- Use cards for self-contained objects, not as the default wrapper for every section.
- Give repeated peers consistent structure and visual weight. Do not force unequal content into identical cards.
- Keep labels concrete and in sentence case. Avoid decorative eyebrows, invented categories, marketing filler and redundant section introductions.
- Never add ornamental sequence numbers, slide counters, progress fractions or labels such as "01 / 08" around headings. Show position or progress only when it is information the reader needs.
- Prefer a compact table for exact comparison, prose for one conclusion, and charts only when a relationship is faster to understand visually.
- Keep forms direct: visible labels, useful placeholders, nearby validation and one obvious submit action.
- Use badges for compact status or categorisation, not for ordinary metadata or decoration.
- Use dialogs for focused decisions and sheets for supporting tasks that should keep the page in view.
- Default to stillness. Add motion only to explain a change of state, preserve continuity or confirm an action.

### Choose the surface mode first

- **Console:** persistent sidebar, page header, responsive 16/24/40px gutters and stacked data sections. Compact density, neutral treatment.
- **Public and marketing:** full-width sections, generous vertical space, intentional display type and one primary call to action. Let editorial hierarchy and approved brand expression lead.
- **Docs and planning:** a stable navigation shell, a readable measure, and scannable headings, lists, code, tables and links.
- **Fixed output:** an explicit aspect ratio and safe areas for slides, social images, email or exports. Preserve exact internal geometry inside any responsive preview.

Foundations cross surface modes; shells and density do not. Do not force one mode's navigation, spacing or composition into another.

### Recipes

- **Console page:** shell → page title and supporting description → one primary action when needed → stacked data or settings sections. Keep repeated controls compact and align numeric data.
- **Catalogue:** concrete title and description → search and filter controls → consistent result peers → a useful empty state. Let one item own one destination.
- **Data view:** orient with a short summary, place controls next to the data they affect, then the table or chart with loading, empty, error, unavailable and ready states.
- **Marketing hero:** clear product statement → concise support → one primary call to action → restrained proof or branded visual. Avoid a cluster of equal-weight actions.
- **Document:** stable navigation → readable title and introduction → semantic sections in a constrained measure → tables, code and media only where they clarify.
- **Fixed output:** set dimensions and safe areas first, then title, content, brand mark and any export requirements. An export is not a responsive web page.

## Responsive behaviour

- Design the mobile behaviour with the desktop composition, not after it.
- Keep padding and gaps at every breakpoint. Avoid layouts that touch the viewport's edges.
- Stack related controls when horizontal space makes labels, targets or values cramped.
- Keep touch targets comfortable and primary actions easy to reach.
- Let tables scroll within a labelled region when they cannot reflow without losing meaning.
- Prevent character-level wrapping in labels, buttons, navigation and identifiers.
- Use balanced wrapping for large headings and readable line lengths for prose.

## Accessibility

- Use semantic elements and keep the accessibility behaviour the components supply.
- Every input has a visible label. Every icon-only control has an accessible name.
- Keep keyboard focus visible and the order of interaction logical.
- Do not communicate status or validation through colour alone.
- Provide useful empty, loading, error and disabled states.
- Respect reduced-motion preferences.

## Workflow

1. Identify the user's job and choose one surface mode.
2. Look at the nearest existing page, section or component on the site.
3. Use the theme and only the components the job needs.
4. Establish real content and its loading, empty, error, unavailable, disabled and ready states before visual polish.
5. Compose with semantic tokens and existing roles. Invent a pattern only when nothing on the site covers the job.
6. Check light and dark themes, a 390px phone, the `sm` and `md` transitions, and a wide desktop.

When a reference conflicts with these guidelines, keep its product intent, content and functional constraints, then translate its treatment into Livepeer's tokens and components. Never copy another product's signature styling.

## Avoid

- Decorative dashboard-card grids, or cards as the default section wrapper.
- Badges, icons or eyebrows on every heading.
- Unestablished glass, glow, gradient or large-shadow treatments.
- Multiple competing accents or primary actions.
- Brand green on any interactive affordance or as a generic success colour.
- The Agent face outside its lockup.
- Monospace prose, uppercase tracking as decoration, emoji, or icons that are not Lucide.
- Decorative numbering, sequence labels, slide counts or progress fractions.
- Hard-coded theme colours, and one-off radii or spacing.
- Desktop layouts that only shrink instead of recomposing at smaller widths.

## Final check

Before shipping, confirm:

- The interface uses the site's existing components wherever one fits.
- The primary task and action are clear without explanatory decoration.
- Typography, spacing, radii, icons and colours stay within these guidelines.
- Brand green appears only as non-interactive expression.
- Mobile, keyboard, loading, empty, error and dark-theme behaviour all work.
- No duplicate component library or parallel token system was introduced.
