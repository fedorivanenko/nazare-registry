---
schemaVersion: 1

id: c-product-carousel
title: Product Carousel Snippet
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add
  - c-carousel
  - c-product-card

surfaces:
  storefront:
    - snippets/c-product-carousel.liquid

invariants:
  - Component ID is c-product-carousel
  - Installs through nazare add c-product-carousel
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Does not require JavaScript beyond what c-carousel and c-product-card dependencies provide
  - Renders nothing when products array is blank or empty
  - Each product is wrapped in data-c-carousel-item and rendered via c-product-card exactly once
  - Caller is responsible for source selection; snippet accepts only a resolved products array
  - c-carousel mode is caller-configurable: static or marquee
  - Does not mutate theme scaffold source

nonGoals:
  - Source selection (collection picker, manual product blocks)
  - Previous/next navigation buttons
  - Pagination dots
  - Quick-view modal
  - Add-to-cart from the carousel
  - Custom CSS files
  - Theme scaffold template placement

codebaseOwnership:
  owns:
    repo:
      - components/c-product-carousel/**
      - nazare.registry.yml c-product-carousel metadata
      - test/ registry component validation for c-product-carousel

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# Product Carousel Snippet

## Goal

Add an installable Shopify snippet that renders a horizontal carousel of product cards from a caller-provided products array.

The snippet encapsulates the capture-and-render pattern: it wraps each product in `data-c-carousel-item`, renders it via `c-product-card`, and hands the result to `c-carousel`. Sections that need a product carousel handle their own source selection (collection, manual blocks, recommendations) and pass the resolved array in — keeping source logic out of the snippet and the carousel pattern out of each section.

---

## Scope

Included:

- `components/c-product-carousel/c-product-carousel.liquid`
- `nazare.registry.yml` component metadata for `c-product-carousel`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add c-product-carousel` installs the snippet from the local registry
- snippet parameters:
  - `products` (required) — array of Shopify product objects
  - `mode`: `static` or `marquee`, default `static`
  - `direction`: `left` or `right`, default `left`
  - `speed`: `slow`, `normal`, or `fast`, default `normal`
  - `pause_on_hover`: boolean, default `true`
  - `gap`: `sm`, `md`, or `lg`, default `md`
  - `badge_tags` (optional) — space-separated tag strings to render as filled badges
  - `show_ratings`: boolean, default `true`
  - `show_swatches`: boolean, default `true`
  - `color_option_name`: default `Color`
  - optional `class`

Component metadata:

```yaml
components:
  c-product-carousel:
    version: 1.0.0
    type: snippet
    dependencies:
      - c-carousel
      - c-product-card
    files:
      - from: components/c-product-carousel/c-product-carousel.liquid
        to: snippets/c-product-carousel.liquid
        checksum:
          algorithm: sha256
          value: ""
```

Snippet render contract:

```liquid
{% render 'c-product-carousel',
  products: collection.products,
  mode: 'static',
  badge_tags: 'Bestseller',
  show_ratings: true,
  show_swatches: true
%}
```

- Renders nothing when `products` is blank or empty.
- Captures each product once into a `{% capture %}` block: each item is a `<div data-c-carousel-item>` containing `{% render 'c-product-card', product: product, ... %}`.
- Passes the captured markup to `{% render 'c-carousel', content: ..., mode: mode, direction: direction, speed: speed, pause_on_hover: pause_on_hover, gap: gap %}`.
- Missing or unknown `mode`, `direction`, `speed`, `gap` fall back to `c-carousel` defaults.

---

## Success behavior

- `nazare list` shows `c-product-carousel` as available after registry update.
- `nazare add c-product-carousel` installs `snippets/c-product-carousel.liquid` and transitively installs `c-carousel`, `c-product-card`, `c-badge`, `c-ratings`, and `c-swatch`.
- Blank or empty `products` renders nothing.
- Each product in the array renders as a card exactly once.
- In static mode the row is drag-scrollable with no automatic motion.
- In marquee mode the row moves continuously at the configured direction and speed; drag pauses and resumes on release.
- Pause on hover pauses marquee on pointer hover and keyboard focus when enabled.
- Badge tags drive filled badge rendering in each card.
- Ratings and swatches are included or excluded per their boolean params.
- Swatch selection on any card swaps that card's image; other cards are unaffected.
- Component source checksum matches registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- Blank `products` renders nothing without broken markup or Liquid errors.
- Missing dependency snippets do not crash render — registry resolves transitively.

---

## Verification

- [ ] component source exists at registry path
- [ ] registry contains `c-product-carousel` metadata with c-carousel and c-product-card dependencies
- [ ] registry checksum matches component source bytes
- [ ] component metadata validates with component registry parser
- [ ] blank products renders nothing
- [ ] each product renders exactly once
- [ ] static mode renders drag-scrollable row
- [ ] marquee mode moves cards continuously at configured direction and speed
- [ ] pause on hover pauses marquee on hover and focus when enabled
- [ ] swatch selection swaps correct card image without affecting other cards
- [ ] snippet uses Tailwind utilities only
- [ ] `nazare add c-product-carousel` smoke installs snippet and all transitive dependencies

---

## Architecture notes

The snippet owns exactly one thing: the capture-and-render pattern that glues `c-product-card` items into a `c-carousel` track. Source selection is deliberately excluded — callers resolve their product array before passing it in, so the snippet stays reusable across collection sections, recommendation rows, featured product placements, and any future surface.

All carousel motion and drag behavior is owned by `c-carousel` and `c-drag-scroll`. All card rendering is owned by `c-product-card`. This snippet is a thin composition shim with no logic of its own.

---

## Open questions

- Should `badge_tags` accept a Liquid array in addition to a space-separated string, for callers that already have the tags in array form?
