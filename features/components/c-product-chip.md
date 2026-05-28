---
schemaVersion: 1

id: c-product-chip
title: Product Chip Snippet
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add
  - c-badge

surfaces:
  storefront:
    - snippets/c-product-chip.liquid

invariants:
  - Component ID is c-product-chip
  - Installs through nazare add c-product-chip
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Does not require JavaScript
  - Renders nothing when product is blank
  - Product image, name, and price are always rendered when product is present
  - Badge renders only when badge_label is non-empty
  - CTA link always renders and points to product.url
  - Does not mutate theme scaffold source

nonGoals:
  - Variant selection or swatches
  - Ratings
  - Add-to-cart
  - Full-size product card behavior
  - Custom CSS files
  - Theme scaffold template placement

codebaseOwnership:
  owns:
    repo:
      - components/c-product-chip/**
      - nazare.registry.yml c-product-chip metadata
      - test/ registry component validation for c-product-chip

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# Product Chip Snippet

## Goal

Add an installable Shopify snippet for a compact product callout card designed to overlay images and media.

The chip renders a small white card with a product image, name, price, optional badge, and a CTA link. It is intentionally minimal — no swatches, no ratings, no add-to-cart — so it can be positioned over rich backgrounds without visual competition. It is distinct from `c-product-card`, which is designed for flat collection grid surfaces.

---

## Scope

Included:

- `components/c-product-chip/c-product-chip.liquid`
- `nazare.registry.yml` component metadata for `c-product-chip`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add c-product-chip` installs the snippet from the local registry
- snippet parameters:
  - `product` (required) — Shopify product object
  - `badge_label` (optional) — label for the badge rendered above the product image
  - `badge_style` (optional) — `filled` or `outline`, default `filled`
  - `cta_label` (optional) — CTA link text, default `Shop now`
  - optional `class`

Component metadata:

```yaml
components:
  c-product-chip:
    version: 1.0.0
    type: snippet
    dependencies:
      - c-badge
    files:
      - from: components/c-product-chip/c-product-chip.liquid
        to: snippets/c-product-chip.liquid
        checksum:
          algorithm: sha256
          value: ""
```

Snippet render contract:

```liquid
{% render 'c-product-chip',
  product: product,
  badge_label: 'Bestseller',
  badge_style: 'filled',
  cta_label: 'Shop now'
%}
```

- Renders a white rounded card with a drop shadow.
- Blank `product` renders nothing.
- Left side of the card: product featured image, square-cropped.
- Right side of the card: stacked vertically — badge (when `badge_label` is non-empty), product title, price, CTA link.
- Badge renders via `{% render 'c-badge', label: badge_label, style: badge_style %}`.
- CTA link is a plain anchor to `product.url` with `cta_label` as text; always rendered when product is present.
- Card is not itself a link — only the CTA anchor is interactive.

---

## Success behavior

- `nazare list` shows `c-product-chip` as available after registry update.
- `nazare add c-product-chip` installs `snippets/c-product-chip.liquid` and transitively installs `c-badge`.
- Blank `product` renders nothing.
- Product image, title, price, and CTA link render for any valid product.
- Badge renders when `badge_label` is non-empty.
- Badge is absent when `badge_label` is blank.
- CTA link points to `product.url`.
- Snippet uses Tailwind utility classes only.
- Component source checksum matches registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- Blank `product` renders nothing without Liquid errors.
- Missing `c-badge` dependency does not crash render — registry resolves transitively.
- Product with no featured image renders no image element without broken markup.

---

## Verification

- [ ] component source exists at registry path
- [ ] registry contains `c-product-chip` metadata with c-badge dependency
- [ ] registry checksum matches component source bytes
- [ ] component metadata validates with component registry parser
- [ ] blank product renders nothing
- [ ] product image, title, price, and CTA render for valid product
- [ ] badge renders when badge_label is non-empty
- [ ] badge absent when badge_label is blank
- [ ] CTA links to product.url
- [ ] snippet uses Tailwind utilities only
- [ ] `nazare add c-product-chip` smoke installs snippet and c-badge

---

## Architecture notes

The chip is a display-only callout — no interactivity beyond the CTA link. The card background and shadow are fixed Tailwind utilities; callers can extend via the optional `class` param if positioning is needed (e.g. `absolute bottom-6 right-6`).

The two-column layout (image left, content right) is fixed and not configurable. This keeps the snippet predictable for image overlay use cases where space is constrained.

---

## Open questions

- Should the chip support a `selected_variant` param so price reflects the variant rather than the base product price?
