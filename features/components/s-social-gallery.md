---
schemaVersion: 1

id: s-social-gallery
title: Social Gallery Section
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add
  - c-carousel
  - c-social-links

surfaces:
  storefront:
    - sections/s-social-gallery.liquid

invariants:
  - Component ID is s-social-gallery
  - Installs through nazare add s-social-gallery
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Does not require JavaScript beyond what c-carousel provides
  - Handle and social icons row render only when at least one is configured
  - Renders no image strip when zero image blocks are added
  - Each image block is wrapped in data-c-carousel-item and passed to c-carousel exactly once
  - c-carousel mode is merchant-configurable: static or marquee
  - Does not mutate theme scaffold source

nonGoals:
  - Live Instagram feed API integration
  - Lightbox or fullscreen image viewer
  - Custom CSS files

codebaseOwnership:
  owns:
    repo:
      - components/s-social-gallery/**
      - nazare.registry.yml s-social-gallery metadata
      - test/ registry component validation for s-social-gallery

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# Social Gallery Section

## Goal

Add an installable Shopify section that pairs a social handle and platform icons with a horizontal image carousel — a UGC strip that signals brand social presence and drives follows.

The header zone (handle left, icons right) and image strip are rendered together as one section but remain independently optional. The section can be placed above the footer, mid-page, or anywhere a social proof image row is needed.

---

## Scope

Included:

- `components/s-social-gallery/s-social-gallery.liquid`
- `nazare.registry.yml` component metadata for `s-social-gallery`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add s-social-gallery` installs the section from the local registry
- configurable section settings:
  - social handle text (optional; e.g. `@GETOFFYOURACID`)
  - handle link URL (optional; wraps handle in anchor when set)
  - social platform URLs forwarded to `c-social-links`: instagram, facebook, youtube, tiktok, twitter, pinterest (all optional)
  - image aspect ratio: `square`, `portrait`, `landscape` — default `square`
  - carousel mode: `static` or `marquee` — default `static`
  - marquee direction: `left` or `right` — default `left`
  - marquee speed: `slow`, `normal`, `fast` — default `normal`
  - pause on hover: boolean — default `true`
- section blocks (type: `image`):
  - image (required)
  - image alt text (optional)
  - optional link URL

Layout contract:

- Section uses `page-width` container for horizontal padding.
- Header zone: flex row, handle text left, `{% render 'c-social-links', ... %}` right. Renders only when at least one of handle or a social URL is configured.
- Image strip: each image block captured once as `<div data-c-carousel-item>` containing the image (wrapped in anchor when link URL is set). Passed to `{% render 'c-carousel', content: ..., mode: ..., gap: 'sm' %}`. Renders nothing when zero blocks present.

Component metadata:

```yaml
components:
  s-social-gallery:
    version: 1.0.0
    type: section
    dependencies:
      - c-carousel
      - c-social-links
    files:
      - from: components/s-social-gallery/s-social-gallery.liquid
        to: sections/s-social-gallery.liquid
        checksum:
          algorithm: sha256
          value: ""
```

---

## Success behavior

- `nazare list` shows `s-social-gallery` as available after registry update.
- `nazare add s-social-gallery` installs `sections/s-social-gallery.liquid` and transitively installs `c-carousel`, `c-drag-scroll`, and `c-social-links`.
- Header zone renders when handle or at least one social URL is configured; absent otherwise.
- Handle renders as plain text when no handle link URL is set; as an anchor when link URL is set.
- `c-social-links` renders only platforms with non-blank URLs.
- Each image block renders at the configured aspect ratio.
- Image with link URL renders inside an anchor.
- In static mode: drag-scrollable image strip.
- In marquee mode: continuous motion at configured direction and speed.
- Zero image blocks renders no strip without broken markup.
- Component source checksum matches registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- Image block with no image renders nothing for that item without broken markup.
- All social URLs blank and handle blank renders no header zone without empty wrapper.
- Missing dependency snippets do not crash section render — registry resolves transitively.

---

## Verification

- [ ] component source exists at registry path
- [ ] registry contains `s-social-gallery` metadata with c-carousel and c-social-links dependencies
- [ ] registry checksum matches component source bytes
- [ ] component metadata validates with component registry parser
- [ ] header zone renders when handle or social URL configured, absent otherwise
- [ ] handle renders as anchor when link URL set, plain text otherwise
- [ ] c-social-links renders only configured platforms
- [ ] each image renders at configured aspect ratio
- [ ] image with link renders inside anchor
- [ ] static mode renders drag-scrollable strip
- [ ] marquee mode moves images continuously
- [ ] zero blocks renders no strip
- [ ] section uses Tailwind utilities only
- [ ] `nazare add s-social-gallery` smoke installs section and transitive dependencies

---

## Architecture notes

The header zone and image strip are independently optional — a merchant can configure the social handle and icons without adding any image blocks (social links only), or add images without a handle (pure image strip). Neither zone depends on the other being present.

Images are merchant-uploaded blocks, not a live Instagram API feed. This keeps the section dependency-free from third-party APIs and avoids OAuth or token management.

---

## Open questions

None.
