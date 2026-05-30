---
schemaVersion: 1

id: s-hero
title: Hero Section
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add
  - c-bg-video
  - c-button
  - c-heading
  - s-announcement

surfaces:
  storefront:
    - sections/s-hero.liquid

invariants:
  - Component ID is s-hero
  - Installs through nazare add s-hero
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - JavaScript is provided through the c-bg-video dependency, not the section itself
  - Optional CTA renders only when both URL and label exist
  - Background video uses c-bg-video snippet
  - Background image is used as video poster when a video is set, and as a static background when no video is set
  - c-heading renders all heading output — no inline heading markup in s-hero
  - heading_size maps directly to c-heading size param
  - section_height controls min-height of the root section element
  - content_vertical controls vertical alignment of the content flex container
  - layout: split puts heading in left column and body in right column; ignores eyebrow and CTA
  - layout: stack preserves single-column constrained-grid behavior
  - All new settings have safe defaults that reproduce current visual output
  - Does not mutate theme scaffold source

nonGoals:
  - Slideshow or carousel behavior
  - Multiple image art direction sources
  - Header integration
  - Theme scaffold template placement
  - JavaScript animations
  - Custom CSS files
  - Multiple background layers
  - Animated layout transitions
  - Mobile-specific layout override settings

codebaseOwnership:
  owns:
    repo:
      - components/s-hero/**
      - nazare.registry.yml s-hero metadata
      - test/ registry component validation for s-hero

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
    - components/c-heading/** (separate feature)
---

# Hero Section

## Goal

Add an installable Shopify hero section for first-screen storefront messaging.

The section covers three distinct visual treatments using a single component with different settings:

- **Full hero**: tall, content bottom-left, large heading, eyebrow + body + CTA
- **Banner**: short, heading left column, body right column, xl heading
- **Centered**: full height, heading and content centered on both axes

Video backgrounds are delegated to `c-bg-video`, keeping the section Liquid-only while supporting ambient autoplay and reduced-motion behavior. Heading typography is delegated to `c-heading` to share the typographic scale with other sections.

---

## Scope

### Settings

**Background**
- `video` — Shopify-hosted background video
- `image` — background image; used as video poster when video is set, static background otherwise
- `image_alt` — explicit image alt text; falls back to image metadata alt
- `overlay` — select: `none` / `light` / `medium` / `dark`

**Content**
- `eyebrow` — small label above heading
- `heading` — main heading text (default: `"Hero heading"`)
- `body` — rich text below heading

**Primary CTA**
- `cta_url` — button URL
- `cta_label` — button label
- `cta_scheme` — select: `solid` / `outline` / `ghost`

**Secondary CTA**
- `cta2_url` — link URL
- `cta2_label` — link label

**Badge**
- `badge` — image displayed bottom-right; recommended 320×320px

**Layout**
- `alignment` — select: `left` / `center`
- `color_scheme` — select: `dark` (white text) / `light` (black text)
- `heading_size` — select: `sm` / `md` / `lg` / `xl`; default `lg`
- `section_height` — select: `banner` / `full` / `screen`; default `full`
- `content_vertical` — select: `bottom` / `center`; default `bottom`
- `layout` — select: `stack` / `split`; default `stack`

### Height mapping

| value | min-height |
|-------|-----------|
| `banner` | `280px` |
| `full` | `clamp(560px, 48vw, 700px)` |
| `screen` | `100dvh` |

### Responsive layout — stack

Content column uses a constrained grid. When `alignment` is `left`:

| breakpoint | grid | content occupies |
|------------|------|-----------------|
| default (mobile) | `grid-cols-1` | full width |
| `sm` (640px+) | `grid-cols-2` | first column (~50%) |
| `lg` (1024px+) | `grid-cols-3` | first column (~33%) |

When `alignment` is `center`, no grid — content is `mx-auto max-w-[540px] text-center` at all breakpoints.

### Responsive layout — split

Heading in left column, body in right column. Eyebrow and CTA are not rendered. Both columns vertically centered within the row.

```
| HEADING TEXT       | Body copy describing    |
|                    | the product or page.    |
```

| breakpoint | grid | behavior |
|------------|------|----------|
| default (mobile) | `grid-cols-1` | heading above body, stacked |
| `sm` (640px+) | `grid-cols-2` | heading left, body right |

No lg-specific column change — two equal columns from `sm` upward.

### c-heading render call

```liquid
{% render 'c-heading', text: hero_heading, size: hero_heading_size, tag: 'h1', class: 'py-5' %}
```

### Component metadata

```yaml
components:
  s-hero:
    version: 1.2.0
    type: section
    dependencies:
      - c-bg-video
      - c-button
      - c-heading
    files:
      - from: components/s-hero/s-hero.liquid
        to: sections/s-hero.liquid
        checksum:
          algorithm: sha256
          value: <sha256>
```

### Section render contract

- Root is a plain `<section>` element. `min-height` is driven by `section_height`.
- When a video is set, the section renders `{% render 'c-bg-video', ... %}` with the resolved min-height.
- When no video is set but an image is set, the image renders absolutely positioned behind the content.
- Hero content is captured once via `{% capture hero_inner %}` and reused in both the video and non-video branches. In split layout, `hero_inner` captures the full two-column grid so `c-bg-video` receives the complete content block.
- Content container uses `justify-end` for `content_vertical: bottom` and `justify-center` for `content_vertical: center`.
- CTA renders using `{% render 'c-button', ... %}` only when both `cta_url` and `cta_label` are present.
- CTA and eyebrow are not rendered when `layout` is `split`.
- Empty eyebrow/body values render nothing.
- `c-heading` renders the heading; blank heading renders nothing.

---

## Success behavior

- `nazare list` shows `s-hero` as available after registry update.
- `nazare add s-hero` installs `sections/s-hero.liquid` and transitively installs `c-bg-video`, `c-button`, and `c-heading`.
- Section renders default hero content without merchant setup.
- Default values (`heading_size: lg`, `section_height: full`, `content_vertical: bottom`, `layout: stack`) reproduce prior visual output without merchant changes.
- Section schema exposes all settings listed above.
- When a video is set, `c-bg-video` renders as the background with reduced-motion and intersection pause/resume behavior.
- Background image is passed as poster to `c-bg-video` when video is also set.
- When no video is set but an image is set, the image renders as a static full-bleed background.
- Overlay applies in both video and image cases when set.
- `section_height: banner` renders section at 280px min-height.
- `section_height: screen` renders section at 100dvh min-height.
- `content_vertical: center` vertically centers the content flex container.
- `layout: split` renders heading in the left column and body in the right column on desktop, collapsing to stack on mobile.
- `layout: split` ignores eyebrow and CTA without Liquid errors.
- `heading_size` is forwarded to `c-heading` and changes the rendered font size.
- Content alignment and text color settings affect rendered output.
- Component source checksum matches registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- Empty video setting falls back to image-or-plain rendering without Liquid errors.
- Empty image setting renders no background without broken `<img>` markup.
- Empty optional settings render nothing without broken links or placeholder content.
- Missing `c-bg-video`, `c-button`, or `c-heading` dependency does not crash install — registry resolves dependencies first.
- Blank or unknown `section_height` falls back to `full`.
- Blank or unknown `content_vertical` falls back to `bottom`.
- Blank or unknown `layout` falls back to `stack`.
- Blank or unknown `heading_size` falls back to `lg` (delegated to `c-heading` default).
- Split layout with blank body renders a single-column heading without broken grid markup.

---

## Verification

- [x] component source exists at registry path
- [x] registry contains `s-hero` metadata with c-bg-video and c-button dependencies
- [x] registry checksum matches component source bytes
- [x] component metadata validates with component registry parser
- [x] section schema contains video, image, image alt, overlay, eyebrow, heading, body, CTA URL, CTA label, CTA style, alignment, and text color settings
- [x] section uses Tailwind utilities only
- [x] CTA render is gated by URL and label
- [x] video case renders c-bg-video with image as poster and overlay forwarded
- [x] non-video image case renders absolute background image with overlay
- [x] hero_inner content captured once and shared across both branches
- [x] `nazare add s-hero` smoke installs section from local registry
- [ ] four new layout settings present in section schema (`heading_size`, `section_height`, `content_vertical`, `layout`)
- [ ] default values reproduce existing hero output
- [ ] `section_height: banner` renders 280px min-height
- [ ] `section_height: screen` renders 100dvh min-height
- [ ] `content_vertical: center` centers content vertically
- [ ] `layout: split` renders two-column layout on desktop
- [ ] `layout: split` collapses to stack on mobile
- [ ] `layout: split` skips eyebrow and CTA without errors
- [ ] `heading_size` forwarded to `c-heading` correctly
- [ ] `c-heading` declared as dependency in registry metadata
- [ ] `nazare add s-hero` transitively installs `c-heading`
- [ ] updated checksum matches component source bytes

---

## Architecture notes

Hero content (eyebrow, heading, body, CTA) is captured once with `{% capture hero_inner %}` and passed into `c-bg-video`'s `content` parameter for the video case, or rendered directly in the non-video branch. In split layout, the two-column grid structure is included inside `hero_inner` so `c-bg-video` still receives the complete content block.

The section is Liquid-only — no JavaScript file. Ambient video behavior (autoplay, reduced-motion pause, off-screen pause) lives entirely in `c-bg-video.js`.

Overlay is resolved in the Liquid layer so both `c-bg-video` (video case) and the manual image case share the same named values (`none` / `light` / `medium` / `dark`).

The four new layout settings are added under a `"Layout"` schema header alongside the existing `alignment` and `color_scheme` settings.

---

## Open questions

None.
