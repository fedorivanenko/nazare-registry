---
schemaVersion: 1

id: s-press-bar
title: Press Bar Section
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add
  - c-carousel

surfaces:
  storefront:
    - sections/s-press-bar.liquid

invariants:
  - Component ID is s-press-bar
  - Installs through nazare add s-press-bar
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Does not require JavaScript beyond what c-carousel provides
  - Heading renders only when the setting is non-empty
  - Renders nothing when no logo blocks are added
  - Each logo block is wrapped in data-c-carousel-item and passed to c-carousel exactly once
  - c-carousel mode is merchant-configurable: static or marquee
  - Does not mutate theme scaffold source

nonGoals:
  - Per-logo color or hover tint customization
  - JavaScript interactions beyond carousel motion and drag
  - Custom CSS files

codebaseOwnership:
  owns:
    repo:
      - components/s-press-bar/**
      - nazare.registry.yml s-press-bar metadata
      - test/ registry component validation for s-press-bar

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# Press Bar Section

## Goal

Add an installable Shopify section that displays a horizontal strip of press or partner logos with an optional heading label above.

The section gives merchants a social-proof placement — "Featured In", "As Seen In", "Our Partners" — with logos scrolling in a continuous marquee or arranged in a static drag-scrollable row. Logo rendering and carousel motion are delegated to `c-carousel`; the section owns only the heading and the logo block markup.

---

## Scope

Included:

- `components/s-press-bar/s-press-bar.liquid`
- `nazare.registry.yml` component metadata for `s-press-bar`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add s-press-bar` installs the section from the local registry
- configurable section settings:
  - optional heading text (e.g. "FEATURED IN")
  - heading alignment: `left`, `center`, or `right`, default `center`
  - carousel mode: `static` or `marquee`, default `marquee`
  - marquee direction: `left` or `right`, default `left`
  - marquee speed: `slow`, `normal`, or `fast`, default `normal`
  - pause on hover: boolean, default `true`
  - logo max height (px): controls rendered image height, default `40`
- section blocks (type: `logo`):
  - logo image (required)
  - logo alt text (optional, defaults to empty for decorative logos)
  - optional link URL

Layout contract:

- Section uses `page-width` container for horizontal padding.
- Optional heading renders above the carousel, aligned per the alignment setting.
- Each logo block is captured once into a `{% capture %}` block: a `<div data-c-carousel-item>` containing the logo image (wrapped in an anchor when a link URL is set).
- Captured markup is passed to `{% render 'c-carousel', content: ..., mode: ..., direction: ..., speed: ..., pause_on_hover: ..., gap: 'lg' %}`.
- Logo images are rendered at a fixed height (from the max height setting) with `object-fit: contain` and `width: auto`.
- Section renders nothing when zero logo blocks are present.

Component metadata:

```yaml
components:
  s-press-bar:
    version: 1.0.0
    type: section
    dependencies:
      - c-carousel
    files:
      - from: components/s-press-bar/s-press-bar.liquid
        to: sections/s-press-bar.liquid
        checksum:
          algorithm: sha256
          value: ""
```

---

## Success behavior

- `nazare list` shows `s-press-bar` as available after registry update.
- `nazare add s-press-bar` installs `sections/s-press-bar.liquid` and transitively installs `c-carousel` and `c-drag-scroll`.
- Zero logo blocks renders nothing.
- Heading renders above the carousel when the setting is non-empty.
- Heading is absent when the setting is empty.
- Each logo block renders its image at the configured height with `object-fit: contain`.
- Logo with a link URL renders the image inside an anchor; logo without a URL renders the image directly.
- Logo alt text is set when provided; omitted (empty string) otherwise for decorative use.
- In marquee mode logos scroll continuously; drag pauses and resumes on release.
- In static mode logos are drag-scrollable with no automatic motion.
- Pause on hover pauses marquee on pointer hover and keyboard focus when enabled.
- Component source checksum matches registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- Logo block with no image renders nothing for that item without broken markup.
- Missing `c-carousel` dependency does not crash section render — registry resolves transitively.

---

## Verification

- [ ] component source exists at registry path
- [ ] registry contains `s-press-bar` metadata with c-carousel dependency
- [ ] registry checksum matches component source bytes
- [ ] component metadata validates with component registry parser
- [ ] zero blocks renders nothing
- [ ] heading renders when non-empty, absent otherwise
- [ ] each logo renders at configured height with object-fit contain
- [ ] logo with link URL renders inside anchor
- [ ] logo without link URL renders image directly
- [ ] marquee mode scrolls logos continuously
- [ ] static mode renders drag-scrollable row
- [ ] pause on hover pauses marquee on hover and focus when enabled
- [ ] section uses Tailwind utilities only
- [ ] `nazare add s-press-bar` smoke installs section and transitive dependencies

---

## Architecture notes

The section follows the same capture-and-pass pattern as other `c-carousel` consumers: capture block markup once, wrap each block in `data-c-carousel-item`, hand off to `c-carousel`. The section owns only the logo image and optional link markup inside each item.

Logo height is controlled by a single `logo_max_height` setting applied as an inline style (`max-height: {{ section.settings.logo_max_height }}px`) with `object-fit: contain` and `width: auto`, so logos of different aspect ratios align on a shared baseline without cropping.

Marquee is the default mode — press bars are almost always used as ambient scrolling strips, not static grids.

---

## Open questions

- Should logos render in grayscale by default (CSS filter) with full color on hover, or full color always? Grayscale is a common press-bar pattern but requires deciding where the filter lives (Tailwind utility vs. inline style).
