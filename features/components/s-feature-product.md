---
schemaVersion: 1

id: s-feature-product
title: Feature Product Section
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add
  - c-button
  - c-product-chip

surfaces:
  storefront:
    - sections/s-feature-product.liquid

invariants:
  - Component ID is s-feature-product
  - Installs through nazare add s-feature-product
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Does not require JavaScript
  - Heading and image are always rendered
  - Body text, primary CTA, secondary CTA, footnote, and product chip are each optional
  - Primary CTA renders only when both primary_cta_url and primary_cta_label exist
  - Secondary CTA renders only when both secondary_cta_url and secondary_cta_label exist
  - Product chip renders only when a product is selected
  - Does not mutate theme scaffold source

nonGoals:
  - Video background on the image side
  - Multiple featured products
  - Add-to-cart from the section
  - Custom CSS files

codebaseOwnership:
  owns:
    repo:
      - components/s-feature-product/**
      - nazare.registry.yml s-feature-product metadata
      - test/ registry component validation for s-feature-product

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# Feature Product Section

## Goal

Add an installable Shopify section that pairs a bold editorial statement on the left with a full-bleed lifestyle image on the right, with an optional product chip overlaid on the image.

The section is designed for high-impact product storytelling: the left side delivers the claim (headline, supporting copy, CTAs, footnote) and the right side shows the product in context with a compact chip linking directly to the product page. The product chip is delegated to `c-product-chip`; CTA buttons are delegated to `c-button`.

---

## Scope

Included:

- `components/s-feature-product/s-feature-product.liquid`
- `nazare.registry.yml` component metadata for `s-feature-product`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add s-feature-product` installs the section from the local registry
- configurable section settings:
  - heading text (required display; plain text)
  - body text (optional; rich text)
  - optional primary CTA URL
  - optional primary CTA label
  - primary CTA button style: solid, outline, ghost — default `outline`
  - optional secondary CTA URL
  - optional secondary CTA label
  - secondary CTA button style: solid, outline, ghost — default `ghost`
  - optional footnote text (plain text; renders below CTAs in small type)
  - lifestyle image (required display)
  - image alt text (optional)
  - product picker (optional)
  - product badge label (optional; forwarded to `c-product-chip`)
  - product badge style: filled or outline — default `filled`
  - product CTA label (optional; forwarded to `c-product-chip`, default `Shop now`)
  - content side: `left` or `right`, default `left` — controls which side the text column appears on

Layout contract:

- Section is a two-column split at full viewport width, no `page-width` container — image extends edge to edge on its side.
- Content column (left by default): heading, body text, CTA row (primary + secondary side by side), footnote — all stacked vertically with consistent spacing.
- Image column: lifestyle image fills the column with `object-fit: cover` and a fixed min-height.
- `c-product-chip` is absolutely positioned in the bottom-right corner of the image column when a product is selected.
- Primary CTA renders via `{% render 'c-button', label: ..., url: ..., scheme: primary_cta_style %}`.
- Secondary CTA renders via `{% render 'c-button', label: ..., url: ..., scheme: secondary_cta_style %}`.
- On mobile, columns stack vertically: content column on top, image column below.

Component metadata:

```yaml
components:
  s-feature-product:
    version: 1.0.0
    type: section
    dependencies:
      - c-button
      - c-product-chip
    files:
      - from: components/s-feature-product/s-feature-product.liquid
        to: sections/s-feature-product.liquid
        checksum:
          algorithm: sha256
          value: ""
```

---

## Success behavior

- `nazare list` shows `s-feature-product` as available after registry update.
- `nazare add s-feature-product` installs `sections/s-feature-product.liquid` and transitively installs `c-button`, `c-product-chip`, and `c-badge`.
- Heading and lifestyle image always render.
- Body text renders when non-empty; absent otherwise.
- Primary CTA renders when both URL and label are set; absent otherwise.
- Secondary CTA renders when both URL and label are set; absent otherwise.
- Footnote renders when non-empty in small type below the CTA row; absent otherwise.
- Product chip renders in the bottom-right corner of the image when a product is selected.
- Product chip is absent when no product is selected.
- `content_side` setting correctly swaps which column holds text vs image.
- Component source checksum matches registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- Missing product selection renders no chip without broken markup.
- Empty CTA URL or label renders no button without broken markup.
- Missing dependency snippets do not crash section render — registry resolves transitively.

---

## Verification

- [ ] component source exists at registry path
- [ ] registry contains `s-feature-product` metadata with c-button and c-product-chip dependencies
- [ ] registry checksum matches component source bytes
- [ ] component metadata validates with component registry parser
- [ ] heading and image always render
- [ ] body text renders when non-empty, absent otherwise
- [ ] primary CTA renders when URL and label set, absent otherwise
- [ ] secondary CTA renders when URL and label set, absent otherwise
- [ ] footnote renders in small type when non-empty, absent otherwise
- [ ] product chip renders bottom-right of image when product selected
- [ ] product chip absent when no product selected
- [ ] content_side setting swaps column positions
- [ ] section uses Tailwind utilities only
- [ ] `nazare add s-feature-product` smoke installs section and all transitive dependencies

---

## Architecture notes

The image column uses `relative` positioning as a containing block for the absolutely positioned `c-product-chip`. The chip receives `class: 'absolute bottom-6 right-6'` from the section to place it in the corner — chip positioning is the section's responsibility, not the snippet's.

The section has no `page-width` container — the image bleeds to the viewport edge on its side while the content column uses internal padding to align with the site grid. This requires the two-column split to be at the root level with the content column carrying its own horizontal padding.

Both CTAs delegate to `c-button`. The primary/secondary distinction is purely a scheme setting — the section does not duplicate button rendering logic.

---

## Open questions

- Should the footnote support rich text (for links or italics in legal copy) or plain text only?
- On mobile, should the product chip remain overlaid on the image or detach and render below the image as an inline card?
