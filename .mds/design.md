# Pitstop Robotics design

This file is the source of truth for the site's design language. When the design language changes, update this file in the same change. Tokens live in `src/style.css` under `:root` and must match the values here.

## Design read

Introduction page for an early-stage robotics company with two separate products, written for industrial buyers, partners, and investors. Pi-Scan is an underbody inspection robot (AMR plus vision AI). Pi-Sim is AI-native offline programming and virtual commissioning software. They are independent: copy must not imply one trains or feeds the other. Calm, technical, honest about stage. Modeled on [MKII](https://markii.ai/): one centered screen, one statement, a status flag, one email form. Inverted from MKII's black to a very soft, yellowish off-white.

## Dials

| Dial | Value | Why |
| --- | --- | --- |
| Design variance | 4 | Centered launch-style hero, one asymmetric product row below |
| Motion intensity | 5 | Load-in fade, scroll reveal, button press. Loops only in backgrounds: the hero floor and scan, and the product shadow drift |
| Visual density | 2 | Gallery-airy, few words per section |

## Theme

Light and dark. The default follows the visitor's system or browser setting (`prefers-color-scheme`) and keeps following it live. A small icon button at the top right of the nav (sun or moon, 16px, `--muted`, `--ink` on hover, no border) switches theme; the choice is remembered in `localStorage` (`pitstop:theme`) and then overrides the system setting. An inline script in `<head>` sets `data-theme` on `<html>` before first paint, so there is no flash. Switching crossfades through the View Transitions API where available (not under reduced motion). `color-scheme` and `<meta name="theme-color">` follow the active theme.

Dark is the same design inverted onto a warm near-black, not a new look: same single accent family, same hierarchy, no pure black or white.

## Color

| Token | Hex | Use |
| --- | --- | --- |
| `--bg` | `#F6F4E9` | Page background. Soft, yellowish off-white |
| `--bg-raised` | `#EDEADD` | Image frames and empty media |
| `--field` | `#FBFAF4` | Input background |
| `--ink` | `#111316` | Headlines, primary button fill |
| `--ink-soft` | `#3D3C37` | Body copy (warm grey) |
| `--muted` | `#615F57` | Secondary text, mono captions (about 5.9:1 on `--bg`) |
| `--line` | `#DEDAC9` | Hairlines, borders |
| Placeholder | `#6E6B62` | Input placeholder text |
| Input hover border | `#CDC8B4` | |
| Button hover | `#2A2926` | |
| `--accent` | `#0E50B3` | Only accent. Logo blue from "Robotics". Status text, focus ring, success |
| `--accent-soft` | `#61A6D1` | Logo light blue. Currently unused |
| Hero glow | `#FFFEF8` at 85% | Radial light behind the hero mark. Not blue: blue on the yellow base turns muddy |
| Scan blue | `#5B9BFF` | The scan triangle in the logo mark only |
| Error | `#B3261E` | Form error border and text only |

Rules: one accent across the page. No other hues. No pure black or pure white.

Semantic tokens added so both themes can swap them: `--placeholder` (light `#6E6B62`), `--field-hover` (light `#CDC8B4`), `--btn-hover` (light `#2A2926`), `--glow` (light `#FFFEF8`), `--error` (light `#B3261E`).

### Dark theme (`[data-theme="dark"]`)

| Token | Hex | Use |
| --- | --- | --- |
| `--bg` | `#12130F` | Page background. Warm near-black |
| `--bg-raised` | `#1A1B16` | Image frames |
| `--field` | `#171813` | Input background |
| `--ink` | `#F2F0E4` | Headlines, primary button fill (button text becomes `--bg`) |
| `--ink-soft` | `#C9C6B8` | Body copy |
| `--muted` | `#9A978A` | Secondary text (about 6.6:1 on `--bg`) |
| `--line` | `#2A2B24` | Hairlines |
| `--accent` | `#5B9BFF` | Logo light blue, the on-dark accent from the logo rules |
| `--placeholder` | `#858276` | |
| `--field-hover` | `#3A3B33` | |
| `--btn-hover` | `#DAD7CA` | |
| `--glow` | `#1D1E19` | Hero glow, a lighter near-black |
| `--error` | `#F2877E` | |

Shadow media in dark: images are inverted, fully desaturated, and blended with `screen` instead of `multiply`, so the silhouettes read as light shapes on the dark frame. Footer icon and the product-name marks swap to `icon-dark.svg` (light square, dark "pi", `#0E50B3` dot), via `.only-light` / `.only-dark`.

## Typography

- Sans: Geist Sans 400, 500, 600 (self-hosted via `@fontsource/geist-sans`).
- Mono: Geist Mono 400 (self-hosted via `@fontsource/geist-mono`). Used for status, captions, form, button, footer.
- Hero headline: `clamp(2rem, 4.4vw, 3.5rem)`, weight 400 with the key phrase in 600, line-height 1.08, tracking -0.035em, max 20ch.
- Section title: `clamp(1.75rem, 3vw, 2.5rem)`, weight 500, tracking -0.03em.
- Product title: 1.5rem, weight 500.
- Statement: `clamp(1.5rem, 2.8vw, 2.25rem)`, weight 500, max 34ch. Second sentence in `--muted`.
- Body: 16px, line-height 1.6, max 52ch.
- Mono labels: 12-14px. Uppercase with 0.12-0.14em tracking only in the nav status and the button.

## Shape

All sharp: radius 0 on inputs, buttons, and media frames. The only round element is the status dot.

## Layout

- Container max 1200px, gutter `clamp(20px, 4vw, 40px)`.
- Nav: 68px, sticky, translucent `--bg` with blur, hairline bottom. Wordmark left (26px), status and theme toggle (28px hit area) right.
- Hero: centered, fills the first viewport under the nav. No logo (the load intro introduces the brand): headline (`clamp(2.25rem, 5vw, 4rem)`), mono sub line, email form. Soft radial glow of brighter off-white behind the headline. Behind the glow: a perspective floor grid (48px cells, lines `--ink` at 10%, a 420px-deep plane tilted 64deg under a 640px perspective, starting just under the headline, faded out toward the horizon, the sides, and the bottom) and a thin `--accent` scan line that passes over the floor. The grid stands for the simulator floor, the scan for the inspection pass. Decorative, `aria-hidden`.
- Products: section title, then a `7fr 5fr` grid. Pi-Sim (wide 16:10 frame) left, Pi-Scan (4:5 frame, offset down) right. Each: blurred shadow media, mono status in accent, title, body. Title: the "pi" icon (0.95em square, `.pi-mark`, theme-swapped), then "Sim" or "Scan" in text, then a muted 400-weight category. Screen readers get "Pi-Sim" / "Pi-Scan" through a visually hidden "Pi-". The hero sub line keeps the names as plain text ("Pi-Scan and Pi-Sim"); the mark is only used in the product titles.
- Statement: one large left-aligned paragraph.
- Footer: icon (32px), copyright, contact email.
- Sections separated by a 1px `--line` top border, vertical padding `clamp(80px, 10vw, 140px)`.

## Mobile (under 768px)

- Product grid to one column, AMR offset removed, AMR frame becomes 4:3.
- Footer email drops to its own line.
- Under 420px the email input and button stack.

## Components

- Button: `--ink` fill, `--bg` text, mono 12px uppercase, 50px tall. Hover `#2A2926`, active moves down 1px.
- Email input: `--field`, 1px `--line`, focus becomes `--accent` border. Loading: muted "Sending..." below, button disabled (hover fill, progress cursor). Empty submit: no message, just refocus the input. Invalid email: red border and "Please enter a valid email." below, cleared after 5s or as soon as the visitor types. Success: the input fades out (350ms), the button label fades, swaps to "Thanks, you're on the list" (same button style), and the button widens and glides to the center of the row (700ms, `--ease`). The form is then locked until the page reloads. On the stacked mobile layout the button stays full width and only the label swaps. Under reduced motion the end state appears without transitions.
- Duplicates: emails that already signed up are remembered in `localStorage` (`pitstop:signups`). Submitting one again shows the thank-you state without sending.
- Signup delivery: posts to FormSubmit (`formsubmit.co/ajax/founders@pitstoprobotics.com`), which emails the founders inbox with the visitor's address as reply-to. Hidden `_honey` field catches bots.
- Media frame: `--bg-raised` with a hairline. Empty state (image failed to load) is a light diagonal hatch.
- Shadow media (pre-reveal teaser): the product image, heavily blurred (16px Pi-Scan, 14px Pi-Sim), at 55% opacity with `multiply` blend, scaled 1.15 so blurred edges stay outside the frame. A second copy of the image, blurred more (28px) and at 22% opacity, is the motion ghost. Decorative only (`alt=""`); the product is described in text below.

## Motion

**Load intro** (`src/intro.js`, timeline in `INTRO_TIMELINE`, about 4s). Full-screen `--bg` overlay, word at `clamp(64px, 9vw, 112px)`:

1. 0.2s: ink square (1.6em, same proportions as the icon) pops in with a slight overshoot.
2. 0.55s: "pı" in `--bg` rises into the square.
3. 0.85s: the square i-dot (`#5B9BFF`) falls from 3em above with gravity easing, squashes on landing, settles.
4. 1.65s: square and "pı" slide left together to the wordmark's position. "tstop" letters slide out from behind the square's right edge, farthest letter first (50ms stagger), so letters never cross.
5. 2.35s: the square fades out (450ms, linear). "pı" flips to `--ink` and the dot to `--accent` in a quick switch at the fade's midpoint (42% to 58%), not a slow crossfade, which would pass through grey-on-grey and make the letters vanish.
6. 2.65s: `ROBOTICS` (mono 16px, 0.32em tracking, `--ink-soft`, 6px below the word) fades in under the word, tracking tightening from 0.6em.
7. 3.2s: `ROBOTICS` fades out (300ms). 3.35s: the word travels to the nav wordmark (translate plus scale measured from both elements, 950ms, ease-in-out) while the overlay's background clears (3.45s, 750ms), so the page and header appear around it. The word fades only in the last quarter of the move, as it lands on the nav wordmark, so the big logo reads as settling into the header. Hero items then fade up (paused until the overlay is removed).

Click or any key fast-forwards the intro (5x). Skipped entirely under reduced motion. Page scroll is locked while it plays.

- Hero items fade up on load, staggered 90ms.
- Hero floor: the grid scrolls toward the viewer one cell every 3s (linear, endless). The scan line sweeps from horizon to front over 5s, then pauses about 2s before the next pass (7s cycle), fading in and out at the ends. Transform and opacity only. Grid static and scan hidden under reduced motion.
- Sections and product cards fade up 20px when they enter the viewport (IntersectionObserver).
- Shadow drift: Pi-Scan's shadow drives side to side (translateX about 6%, 9s, ease-in-out, alternate) with the ghost trailing behind it, reading as motion blur. Pi-Sim's shadow pans like a slow orbiting camera (translate plus slight scale, 14s, alternate) with the ghost offset the other way. Transform only. Static under reduced motion.
- All motion turns off under `prefers-reduced-motion: reduce`.

## Assets

- `public/icon.svg`: the icon, used in the footer (light theme).
- `public/icon-dark.svg`: the icon for the dark theme.
- Theme toggle glyphs: Phosphor `sun` and `moon` (regular), from `@phosphor-icons/core`.
- `public/favicon.svg`: same artwork as the icon, used as the browser favicon.
- `logos/pitstop-wordmark.svg`, `logos/pitstop-icon.svg`: master logo files, text outlined to paths (Geist Sans 600). Use these outside the website.
- `public/media/pi-sim-shadow.jpg`: generated silhouette of a robot cell in a simulator viewport (1024x576). Shown blurred only. Replace with a real Pi-Sim capture when ready.
- `public/media/pi-scan-shadow.jpg`: generated silhouette of a low-profile AMR (768x1024). Shown blurred only. Replace with the CAD render when ready.

## Logo

Wordmark only. The A2 solid beam mark (vehicle bar, scan triangle, robot bar) was used for a while, then removed; there is no symbol.

**Wordmark**: `pitstop`, lowercase, Geist Sans 600, tracking -0.055em, line-height 1. The i is dotless; its dot is an accent square 0.17em wide, centered on the i, 0.1em from the top of the line box. On dark: ink becomes `--bg`, the dot lightens to `#5B9BFF`.

**Icon**: the wordmark's first two letters, "pi", in `--bg` on a solid `--ink` square (48x48 grid, letters about 30px), with the square i-dot in `#5B9BFF`. Used in the footer and as the favicon. It is not used in the nav or hero; those use the wordmark.

No "Robotics" descriptor next to the wordmark or in the nav (a stacked mono `ROBOTICS` under the nav wordmark was tried and removed). The full name "Pitstop Robotics" appears only in the page title, meta description, logo aria-label, and footer.

On the website the wordmark is live text (`.wm` + `.i-dot` in `src/style.css`). Outside the website use the outlined files in `logos/`.

## Logo exploration (history)

The original logo (vehicle with gradient and network lines) was replaced. The board is `/logos.html` (dev server only, not in the production build).

Round 1 had six directions (below). A (Underscan) and F (Wordmark) were shortlisted.

Round 2 (on the board):

| Option | What it is |
| --- | --- |
| A1 | Underscan as in round 1: bar, soft beam, scan line, robot, ground line |
| A2 | Bar, solid accent beam (downward triangle), robot. No ground line |
| A3 | Bar, three accent scan lines fading out, robot |
| A4 | Three bars: vehicle, accent scan line, narrower robot |
| F1 | `pitstop`, accent square as the i-dot |
| F2 | `pitstop`, accent downward triangle (the beam) as the i-dot |
| F3 | `pitstop`, flat accent scan line as the i-dot |
| L1 | A2 mark + F1 wordmark |
| L2 | A2 mark + F2 wordmark, `ROBOTICS` in mono under |
| L3 | A4 mark + F3 wordmark + `robotics` muted on one line |
| L4 | F2 wordmark alone, A2 used only as an ink-square app icon and favicon |

Round 1 directions:

All directions share these rules:

- Built on a 48x48 grid, flat geometry, no gradients, no shadows.
- Two colors only: `--ink` and `--accent`. On dark, ink becomes `--bg` and the accent lightens to `#5B9BFF`.
- Must read at 16px (favicon) and on dark.
- Wordmark set in Geist Sans or Geist Mono. Final pick gets outlined to paths.

| Direction | Mark | Wordmark |
| --- | --- | --- |
| A. Underscan | Vehicle bar on top, robot block below, accent scan beam between | `PITSTOP` 600 tracked 0.24em, `ROBOTICS` mono under |
| B. Twin | Solid P with an accent outline P offset behind it (sim and real) | `pitstop` 600 tight, `robotics` 400 muted |
| C. Aperture | P whose bowl is a thick ring with an accent lens dot | `Pitstop Robotics` 500 |
| D. Lattice | P drawn as a node graph, one accent node | `PITSTOP/ROBOTICS` mono, accent slash |
| E. Clearance | Vehicle slab with a slot, accent robot in the slot, ground line | `PITSTOP` 600 plus `ROBOTICS` 400 muted, tracked 0.1em |
| F. Wordmark | None. Dotless i with an accent square as the dot | `pitstop` 600, tight |

## Copy rules

- State the stage plainly. Pi-Sim status reads "Just connecting the dots" (founder's wording for proof of concept). Pi-Scan reads "In design".
- Say what each product does and the outcome, not a full feature list. No accuracy claims, no "replaces tool X" claims until there is proof.
- No customer logos, deployments, or numbers the company can't back.
- One call to action on the page: "Get updates".
- No em dashes.
