---
schemaVersion: 1

id: s-banner
title: Banner Section
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add
  - c-button

surfaces:
  storefront:
    - sections/s-banner.liquid

invariants:
  - Component ID is s-banner
  - Installs through nazare add s-banner
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Does not require JavaScript
  - Background image is always rendered as the section background
  - Heading is always rendered centered over the background image
  - CTA renders only when both cta_url and cta_label exist
  - Content is always center-aligned — no alignment setting
  - Does not mutate theme scaffold source

nonGoals:
  - Body text or eyebrow text
  - Background video
  - Background overlay
  - Content alignment options
  - Multiple CTAs
  - JavaScript behavior
  - Custom CSS files

codebaseOwnership:
  owns:
    repo:
      - components/s-banner/**
      - nazare.registry.yml s-banner metadata
      - test/ registry component validation for s-banner

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# Banner Section

## Goal

Add an installable Shopify section that displays a bold centered heading and optional CTA over a full-bleed background image in a wide, shallow strip format.

The section is designed for mid-page quiz prompts, campaign CTAs, and brand moments that need visual impact without the full complexity of a hero. It is intentionally minimal — no body text, no overlay, no alignment options. Where `s-hero` is a full landing experience, `s-banner` is a focused interruption.

---

## Scope

Included:

- `components/s-banner/s-banner.liquid`
- `nazare.registry.yml` component metadata for `s-banner`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add s-banner` installs the section from the local registry
- configurable section settings:
  - background image (required display)
  - background image alt text (optional)
  - heading text (required display; plain text)
  - text color: `light` or `dark` — default `dark`
  - optional CTA URL
  - optional CTA label
  - CTA style: `solid`, `outline`, `ghost` — default `solid`
  - section height: `sm` (25dvh), `md` (40dvh), `lg` (55dvh) — default `md`

Layout contract:

- Section root is `relative` with height driven by the `section_height` setting.
- Background image is absolutely positioned, fills the section with `object-fit: cover`.
- Content (heading + CTA) is centered both horizontally and vertically over the background image.
- Heading renders in large bold display type; `text_color` setting applies light or dark text utility.
- CTA renders via `{% render 'c-button', ... %}` below the heading when both URL and label are set.
- No `page-width` container — content is centered within the full section width.

Component metadata:

```yaml
components:
  s-banner:
    version: 1.0.0
    type: section
    dependencies:
      - c-button
    files:
      - from: components/s-banner/s-banner.liquid
        to: sections/s-banner.liquid
        checksum:
          algorithm: sha256
          value: ""
```

---

## Success behavior

- `nazare list` shows `s-banner` as available after registry update.
- `nazare add s-banner` installs `sections/s-banner.liquid` and transitively installs `c-button`.
- Background image renders full-bleed at the configured height.
- Heading renders centered over the background in the configured text color.
- CTA renders below the heading when both URL and label are set; absent otherwise.
- Section height setting controls the rendered height via `dvh` values.
- Component source checksum matches registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- Missing background image renders a section with no background without broken layout.
- Empty CTA URL or label renders no button without broken markup.
- Missing `c-button` dependency does not crash section render — registry resolves transitively.

---

## Verification

- [ ] component source exists at registry path
- [ ] registry contains `s-banner` metadata with c-button dependency
- [ ] registry checksum matches component source bytes
- [ ] component metadata validates with component registry parser
- [ ] background image renders full-bleed
- [ ] heading renders centered in configured text color
- [ ] CTA renders when URL and label set, absent otherwise
- [ ] section height setting produces correct dvh height
- [ ] section uses Tailwind utilities only
- [ ] `nazare add s-banner` smoke installs section and c-button

---

## Architecture notes

Intentionally a strict subset of `s-hero`. Where `s-hero` supports video, overlay, eyebrow, body text, and alignment options, `s-banner` fixes content to center-aligned with heading + CTA only. This keeps the section schema short and the merchant decision surface small — the only real choices are the image, the text, and the height.

`text_color` replaces a full overlay system: merchants pick light or dark text to suit their background image rather than applying a semi-transparent overlay. This works for high-contrast images like the one in the design.

---

## Open questions

- Should `text_color` be supplemented with an optional overlay intensity setting for images that don't have sufficient natural contrast?
