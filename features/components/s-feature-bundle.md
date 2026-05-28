---
schemaVersion: 1

id: s-feature-bundle
title: Feature Bundle Section
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add
  - c-badge
  - c-button
  - c-bundle-item

surfaces:
  storefront:
    - sections/s-feature-bundle.liquid

invariants:
  - Component ID is s-feature-bundle
  - Installs through nazare add s-feature-bundle
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Does not require JavaScript
  - Heading is always rendered
  - Badge, body text, bundle items, and both CTAs are each optional
  - Badge renders only when badge_label is non-empty
  - Primary CTA renders only when both primary_cta_url and primary_cta_label exist
  - Secondary CTA renders only when both secondary_cta_url and secondary_cta_label exist
  - Bundle items grid renders only when at least one item block exists
  - Each item block renders via c-bundle-item
  - Does not mutate theme scaffold source

nonGoals:
  - Add-to-cart or bundle builder interactivity
  - Quantity selectors
  - Dynamic pricing calculation
  - Custom CSS files

codebaseOwnership:
  owns:
    repo:
      - components/s-feature-bundle/**
      - nazare.registry.yml s-feature-bundle metadata
      - test/ registry component validation for s-feature-bundle

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# Feature Bundle Section

## Goal

Add an installable Shopify section that presents a product bundle offer — lifestyle image, discount badge, bold headline, body copy, bundled product items with benefit lists, and primary/secondary CTAs.

The section is designed to convert shoppers on the value of buying a bundle over individual products. The bundled items are displayed as a set of `c-bundle-item` tiles (image + name + benefits), not as a cart mechanism. All commerce interactivity (add-to-cart, bundle builder) is out of scope — the section links to an existing bundle product or collection page.

---

## Scope

Included:

- `components/s-feature-bundle/s-feature-bundle.liquid`
- `nazare.registry.yml` component metadata for `s-feature-bundle`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add s-feature-bundle` installs the section from the local registry
- configurable section settings:
  - lifestyle image (optional; renders on the opposite side from content)
  - image alt text (optional)
  - image border radius: none or rounded — default `rounded`
  - content side: `left` or `right` — default `right` (image left, content right per design)
  - optional badge label (e.g. `Save 20%`)
  - badge style: `filled` or `outline` — default `filled`
  - heading text (required display; plain text)
  - body text (optional; rich text; supports inline bold and links)
  - optional primary CTA URL
  - optional primary CTA label
  - primary CTA style: `solid`, `outline`, `ghost` — default `solid`
  - optional secondary CTA URL
  - optional secondary CTA label
  - secondary CTA style: `solid`, `outline`, `ghost` — default `ghost`
- section blocks (type: `item`):
  - product picker (optional; used for image and default name)
  - name override (optional plain text; overrides product.title)
  - benefits (textarea; newline-separated benefit lines)

Layout contract:

- Section is a two-column split at full width — image column and content column, side determined by `content_side`.
- Image column: lifestyle image fills the column with `object-fit: cover`; rounded corners applied when `image border radius` is `rounded`.
- Content column: badge → heading → body text → bundle items grid → CTA row, stacked vertically with consistent spacing.
- Badge renders via `{% render 'c-badge', label: badge_label, style: badge_style %}` when `badge_label` is non-empty.
- Bundle items grid: responsive columns — 4 on desktop, 2 on tablet, 1 on mobile. Each block renders via `{% render 'c-bundle-item', product: ..., name: ..., benefits: ... %}`.
- Bundle items grid is absent when zero item blocks are present.
- CTA row: primary and secondary buttons side by side, each via `{% render 'c-button', ... %}`, each gated by URL + label.
- On mobile: columns stack vertically, image above content.

Component metadata:

```yaml
components:
  s-feature-bundle:
    version: 1.0.0
    type: section
    dependencies:
      - c-badge
      - c-button
      - c-bundle-item
    files:
      - from: components/s-feature-bundle/s-feature-bundle.liquid
        to: sections/s-feature-bundle.liquid
        checksum:
          algorithm: sha256
          value: ""
```

---

## Success behavior

- `nazare list` shows `s-feature-bundle` as available after registry update.
- `nazare add s-feature-bundle` installs `sections/s-feature-bundle.liquid` and transitively installs `c-badge`, `c-button`, and `c-bundle-item`.
- Heading always renders.
- Badge renders when `badge_label` is non-empty; absent otherwise.
- Body text renders when non-empty; absent otherwise.
- Each item block renders via `c-bundle-item` with product image, name, and benefits.
- Bundle items grid is absent when no item blocks are added.
- Primary CTA renders when both URL and label are set; absent otherwise.
- Secondary CTA renders when both URL and label are set; absent otherwise.
- Lifestyle image renders in its column when set; column collapses when no image is set.
- `content_side` setting correctly positions the content and image columns.
- Image rounded corners apply when the border radius setting is `rounded`.
- Component source checksum matches registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- No item blocks renders no grid without broken markup.
- Missing CTA URL or label renders no button without broken markup.
- Missing image renders no image element without broken markup.
- Missing dependency snippets do not crash section render — registry resolves transitively.

---

## Verification

- [ ] component source exists at registry path
- [ ] registry contains `s-feature-bundle` metadata with c-badge, c-button, c-bundle-item dependencies
- [ ] registry checksum matches component source bytes
- [ ] component metadata validates with component registry parser
- [ ] heading always renders
- [ ] badge renders when badge_label non-empty, absent otherwise
- [ ] body text renders when non-empty, absent otherwise
- [ ] each item block renders via c-bundle-item
- [ ] bundle items grid absent when no blocks added
- [ ] primary CTA renders when URL and label set, absent otherwise
- [ ] secondary CTA renders when URL and label set, absent otherwise
- [ ] lifestyle image renders when set, column collapses when absent
- [ ] content_side swaps column positions
- [ ] rounded border radius applies to image when setting is rounded
- [ ] section uses Tailwind utilities only
- [ ] `nazare add s-feature-bundle` smoke installs section and all transitive dependencies

---

## Architecture notes

The section is structurally similar to `s-feature-product` — two-column split with lifestyle image and content — but the content side is more complex: badge + heading + body + a product grid + two CTAs. The product grid delegates entirely to `c-bundle-item`; the section owns only the grid column layout and block iteration.

Body text is rich text to support inline bold product name links (e.g. "The **Kick Acid Reflux Bundle** calms reflux...") without requiring a separate heading or link setting.

The lifestyle image column has no `page-width` constraint — it bleeds to the section edge on its side, same as `s-feature-product`. The content column carries its own horizontal padding to align with the site grid.

---

## Open questions

- Should the image column have a configurable max-height or fixed aspect ratio, or fill the full content column height?
- Should item blocks support a link URL per item so individual products in the bundle are clickable, or is the bundle-level CTA sufficient?
