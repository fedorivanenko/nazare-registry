---
schemaVersion: 1

id: s-image-gallery
title: Image Gallery Section
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add
  - c-carousel

surfaces:
  storefront:
    - sections/s-image-gallery.liquid

invariants:
  - Component ID is s-image-gallery
  - Installs through nazare add s-image-gallery
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Does not require JavaScript beyond what c-carousel provides
  - Renders nothing when no image blocks are added
  - Each image block is wrapped in data-c-carousel-item and passed to c-carousel exactly once
  - c-carousel mode is merchant-configurable: static or marquee
  - Does not mutate theme scaffold source

nonGoals:
  - Video items (use s-video-gallery)
  - Lightbox or fullscreen image viewer
  - Custom CSS files

codebaseOwnership:
  owns:
    repo:
      - components/s-image-gallery/**
      - nazare.registry.yml s-image-gallery metadata
      - test/ registry component validation for s-image-gallery

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# Image Gallery Section

## Goal

Add an installable Shopify section that displays a horizontal row of images as a drag-scrollable or marquee carousel.

The section is the image counterpart to `s-video-gallery` — same carousel primitive, image blocks instead of video blocks. It is designed for UGC feeds, lookbooks, and lifestyle image strips. No video rendering or `c-video` dependency.

---

## Scope

Included:

- `components/s-image-gallery/s-image-gallery.liquid`
- `nazare.registry.yml` component metadata for `s-image-gallery`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add s-image-gallery` installs the section from the local registry
- configurable section settings:
  - carousel mode: `static` or `marquee`, default `static`
  - marquee direction: `left` or `right`, default `left`
  - marquee speed: `slow`, `normal`, or `fast`, default `normal`
  - pause on hover: boolean, default `true`
  - image aspect ratio: `square`, `portrait`, `landscape`, default `square`
- section blocks (type: `image`):
  - image (required)
  - image alt text (optional)
  - optional link URL

Layout contract:

- Each image block is captured once: a `<div data-c-carousel-item>` containing the image (wrapped in an anchor when a link URL is set).
- Captured markup passed to `{% render 'c-carousel', content: ..., mode: ..., direction: ..., speed: ..., pause_on_hover: ..., gap: 'sm' %}`.
- Image aspect ratio is enforced via Tailwind aspect-ratio utilities on each item.
- Section renders nothing when zero image blocks are present.

Component metadata:

```yaml
components:
  s-image-gallery:
    version: 1.0.0
    type: section
    dependencies:
      - c-carousel
    files:
      - from: components/s-image-gallery/s-image-gallery.liquid
        to: sections/s-image-gallery.liquid
        checksum:
          algorithm: sha256
          value: ""
```

---

## Success behavior

- `nazare list` shows `s-image-gallery` as available after registry update.
- `nazare add s-image-gallery` installs `sections/s-image-gallery.liquid` and transitively installs `c-carousel` and `c-drag-scroll`.
- Zero image blocks renders nothing.
- Each image block renders at the configured aspect ratio.
- Image with link URL renders inside an anchor.
- In static mode: drag-scrollable row.
- In marquee mode: continuous motion at configured direction and speed.
- Component source checksum matches registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- Image block with no image renders nothing for that item without broken markup.
- Zero blocks renders nothing without broken markup.

---

## Verification

- [ ] component source exists at registry path
- [ ] registry contains `s-image-gallery` metadata with c-carousel dependency
- [ ] registry checksum matches component source bytes
- [ ] component metadata validates with component registry parser
- [ ] zero blocks renders nothing
- [ ] each image renders at configured aspect ratio
- [ ] image with link renders inside anchor
- [ ] static mode renders drag-scrollable row
- [ ] marquee mode moves images continuously
- [ ] section uses Tailwind utilities only
- [ ] `nazare add s-image-gallery` smoke installs section and transitive dependencies

---

## Architecture notes

Structurally identical to `s-video-gallery` in carousel mode — same capture-and-pass pattern, different block content. Kept as a separate section rather than extending `s-video-gallery` to avoid mixing image and video rendering concerns in one section schema.

---

## Open questions

None.
