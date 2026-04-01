# Livepeer Brand Tokens

Design system reference. Originally derived from the Holographik brand guidelines (2023). Color and animation tokens live in `app/globals.css` under the `@theme` block and as utility classes.

---

## 1. Color Palette

### Primary Colors

| Name              | Hex       | RGB           | CMYK          | Usage                         |
| ----------------- | --------- | ------------- | ------------- | ----------------------------- |
| **Accent Green**  | `#18794E` | 24, 121, 78   | 30, 0, 17, 53 | Primary accent, links, CTAs   |
| **Primary Black** | `#121212` | 18, 18, 18    | 0, 0, 0, 93   | Backgrounds, text on light    |
| **Primary White** | `#FFFFFF` | 255, 255, 255 | 0, 0, 0, 0    | Text on dark, logo on dark bg |

### Green Variants

| Token          | Hex                    | Usage                           |
| -------------- | ---------------------- | ------------------------------- |
| `green`        | `#18794E`              | Primary accent                  |
| `green-light`  | `#1E9960`              | Gradient endpoint, hover states |
| `green-dark`   | `#115C3B`              | Darker accents, pressed states  |
| `green-bright` | `#40BF86`              | Gradient start, highlights      |
| `green-subtle` | `rgba(24,121,78,0.15)` | Tinted backgrounds, badges      |

### Blue Accent Family

| Token         | Hex                     | HSL            | Usage              |
| ------------- | ----------------------- | -------------- | ------------------ |
| `blue`        | `#146A8F`               | 198°, 75%, 32% | Secondary accent   |
| `blue-light`  | `#1380AE`               | 198°, 80%, 38% | Hover states       |
| `blue-bright` | `#25ABD0`               | 193°, 70%, 48% | Highlights         |
| `blue-dark`   | `#145571`               | 198°, 70%, 26% | Pressed states     |
| `blue-subtle` | `rgba(20,106,143,0.15)` | —              | Tinted backgrounds |

### Dark Surface Scale

| Token          | Hex       | Usage             |
| -------------- | --------- | ----------------- |
| `dark`         | `#121212` | Page background   |
| `dark-lighter` | `#181818` | Elevated surfaces |
| `dark-card`    | `#1E1E1E` | Cards, panels     |
| `dark-border`  | `#2A2A2A` | Borders, dividers |

### Greyscale Ramp

| Token     | Hex       |
| --------- | --------- |
| Black 100 | `#121212` |
| Black 90  | `#2F2F2F` |
| Black 80  | `#464646` |
| Black 70  | `#5D5D5D` |
| Black 60  | `#747474` |
| Black 50  | `#8B8B8B` |
| Black 40  | `#A3A3A3` |
| Black 30  | `#BABABA` |
| Black 20  | `#D1D1D1` |
| Black 10  | `#E8E8E8` |
| White     | `#FFFFFF` |

### Text Hierarchy (Opacity)

White-on-dark with opacity levels for text hierarchy:

| Class           | Opacity | Usage                   |
| --------------- | ------- | ----------------------- |
| `text-white`    | 100%    | Headings, primary text  |
| `text-white/70` | 70%     | Strong secondary text   |
| `text-white/60` | 60%     | Body text, descriptions |
| `text-white/50` | 50%     | Supporting text         |
| `text-white/40` | 40%     | Labels, metadata (mono) |
| `text-white/25` | 25%     | Subtle hints, disabled  |

### Primary Gradient

```
#171717 → #18794E → #6DB09C
```

Used for hero backgrounds, gradient overlays, and brand visual elements. Green gradients are combinations of green and black hues, some with a bit of blue for depth. All derived from the Radix UI palette.

### Gradient Text

`.text-gradient` — green gradient applied as text fill:

```css
background: linear-gradient(to right, #40bf86, #1e9960);
```

### Section Divider

`.divider-gradient` — 1px line with a centered white glow:

```css
background: linear-gradient(
  to right,
  transparent,
  rgba(255, 255, 255, 0.15) 25%,
  rgba(255, 255, 255, 0.2) 50%,
  rgba(255, 255, 255, 0.15) 75%,
  transparent
);
```

---

## 2. Typography

### Primary Typeface — Favorit Pro (Dinamo Typefaces)

- **Style**: Straightforward, low-contrast grotesque with geometric rigidity and subtle oddities
- **Weights in use**: Book, Regular, Medium, Bold
- **Role**: Body text, headings, all general typography
- **CSS variable**: `--font-sans` / `font-sans`

### Secondary Typeface — Favorit Mono (Dinamo Typefaces)

- **Style**: Monospaced companion to Favorit Pro, clean and professional with a technological touch
- **Weights in use**: Regular, Medium, Bold
- **Role**: Stats, labels, code snippets, dates, metadata
- **CSS variable**: `--font-mono` / `font-mono`

### Line Heights

| Context                 | Font               | Line Height |
| ----------------------- | ------------------ | ----------- |
| Display / Hero headings | Favorit Pro Bold   | 93%         |
| Subheadings / metadata  | Favorit Mono Bold  | 120%        |
| Body / medium text      | Favorit Pro Medium | 100%        |

---

## 3. Logo

### Composition

- **Lockup** = Symbol + Wordmark (separated by 3x spacing where x = symbol square width)
- **Wordmark** = "LIVEPEER" text, constructed in Favorit Pro with custom 'E' letters (notch cut from middle of each E, matching vertical stroke width)
- **Symbol** = 6 squares in a play-button arrangement (3 columns, 5 rows)

### When to Use

- **Symbol**: Favicons, app icons, avatars, social profiles, and compact spaces where the brand is already established
- **Wordmark**: App and website headers, navigation bars, and product UI where a clean, text-forward identity is preferred
- **Lockup**: Footers, splash screens, co-marketing, partner pages, event signage, and press kits — anywhere the audience may not already know the brand

### Color Variants

- **Black** (`#121212`) — default, for light/white backgrounds
- **White** (`#FFFFFF`) — for dark/colored/gradient backgrounds
- On green gradient backgrounds: use white logo

### Clear Space

- **Lockup**: Minimum clear space = width of the symbol on all sides
- **Wordmark**: Minimum clear space = height of the wordmark on all sides
- **Symbol**: Minimum clear space = width of one square on all sides

### Logo Placement

- **Primary**: Top-left or bottom-left corner
- **Secondary**: Top-right, bottom-right, or center (when primary would clash with content)

### Avatars / Favicons

Three options: green gradient bg + white symbol, black bg + white symbol, white bg + black symbol

---

## 4. Graphic Elements

### Grain Texture

The primary graphic element. Used on most gradient and colour elements, from subjects to backgrounds. Integral to the Livepeer visual language.

### Grid System

Organizes design elements and provides structure to visuals. Applied as an overlay on gradient backgrounds.

`.tile-bg` — structural grid overlay at 48px intervals, 4% green opacity:

```css
background-image:
  linear-gradient(to right, rgba(24, 121, 78, 0.04) 1px, transparent 1px),
  linear-gradient(to bottom, rgba(24, 121, 78, 0.04) 1px, transparent 1px);
background-size: 48px 48px;
```

### Pixel Overlay

Extension of the grid system with colored squares adding depth. Also used as image treatment for landscape images.

### Graphic Shapes

Simple geometric line shapes (radiating lines, circles, angular forms) layered over gradients for additional visual interest.

### Combining Elements

Elements can be layered: Start with standard grid → Add pixel overlay → Add graphic shape. Used to create graded visuals representing stages or aspects of Livepeer.

---

## 5. Image Treatment

### ImageMask Component

Pure CSS implementation of the pixel overlay / image mask. No canvas or JS animation. 5-layer system:

1. **Dark green base** — `linear-gradient(160deg, #030d09 → #051a10 → #071e14)`
2. **B&W media** — Image or video with `contrast(1.1) brightness(0.5)` + green tint overlay
3. **Tile grid** — CSS grid with `1px solid rgba(255,255,255,0.18)` borders
4. **Scan line** — 2px sweep animation (`scanLine` keyframe, 4s cycle)
5. **Vignette** — radial gradient fading edges to near-black

Component: `components/ui/ImageMask.tsx`. Props: `src`, `video`, `children`, `cols` (default 9), `rows` (default 5), `seed`.

---

## 6. Background Contrast Rules

| Background     | Logo Color        |
| -------------- | ----------------- |
| White / light  | Black (`#121212`) |
| Black / dark   | White (`#FFFFFF`) |
| Green gradient | White (`#FFFFFF`) |

---

## 7. Symbol Construction Details

- 6 squares arranged in 3 columns and 5 rows forming a play-button shape
- Horizontal spacing between squares = 5/6 of square width
- Vertical spacing between squares = 1/6 of square width
- The squares represent blockchain structure; the play-button shape represents video

---

## 8. Animations

| Name            | Duration  | Effect                                          |
| --------------- | --------- | ----------------------------------------------- |
| `breathe`       | —         | Opacity oscillates 0.6 → 1 → 0.6                |
| `node-pulse`    | —         | Scale pulses 1 → 1.3 → 1 at 86% mark            |
| `scanLine`      | 4s linear | Translates Y from -100% to 100vh                |
| `imageMaskFlow` | 20s ease  | Background position cycles for flowing gradient |
| `fadeIn`        | —         | Opacity 0→1, translateY -4px→0                  |
| `fadeInUp`      | —         | Opacity 0→1, translateY 4px→0                   |
| `bounceDown`    | —         | TranslateY 0→8px→0                              |

All animations respect `prefers-reduced-motion: reduce`.
