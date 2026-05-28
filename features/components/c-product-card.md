---
schemaVersion: 1

id: c-product-card
title: Product Card Snippet
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add
  - c-badge
  - c-ratings
  - c-swatch

surfaces:
  storefront:
    - snippets/c-product-card.liquid

invariants:
  - Component ID is c-product-card
  - Installs through nazare add c-product-card
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Does not require JavaScript beyond what c-ratings and c-swatch provide
  - Renders nothing when product is blank
  - Product image, title, and price are always rendered when product is present
  - Badges render only when the product has relevant tags or metafields
  - Ratings render only when the product has a ratings provider configured
  - Swatches render only when the product has a color option
  - Does not mutate theme scaffold source

nonGoals:
  - Add-to-cart button on the card
  - Quick-view modal
  - Wishlist/save button
  - Quantity selector
  - Sale price strikethrough and discount badge
  - Custom CSS files
  - Theme scaffold template placement

codebaseOwnership:
  owns:
    repo:
      - components/c-product-card/**
      - nazare.registry.yml c-product-card metadata
      - test/ registry component validation for c-product-card

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# Product Card Snippet

## Goal

Add an installable Shopify product card snippet for displaying products in collection grids, featured product lists, and recommendation rows.

The card composes `c-badge`, `c-ratings`, and `c-swatch` into a single reusable product tile. It renders the product image, badges from tags, star rating, title, price, and color swatches — giving collection and recommendation surfaces a consistent product representation without duplicating rendering logic across sections.

---

## Scope

Included:

- `components/c-product-card/c-product-card.liquid`
- `nazare.registry.yml` component metadata for `c-product-card`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add c-product-card` installs the snippet from the local registry
- snippet parameters:
  - `product` (required) — Shopify product object
  - `selected_variant` (optional) — defaults to `product.selected_or_first_available_variant`
  - `badge_tags` (optional) — array of tag strings to render as filled badges (e.g. `'Bestseller'`)
  - `show_ratings` (optional) — boolean, defaults to `true`
  - `show_swatches` (optional) — boolean, defaults to `true`
  - `color_option_name` (optional) — option name for swatches, defaults to `'Color'`
  - optional `class`

Layout contract:

- Root is a `<div>` with an anchor wrapping the image that links to `product.url`.
- Top of card: horizontal row of `c-badge` pills — filled badges from `badge_tags` first, then outline badges from `product.tags` filtered to category-style tags.
- Image area: product featured image, aspect-ratio constrained, with `object-fit: cover`. The `<img>` element carries `data-c-swatch-image` so `c-swatch.js` can swap it on swatch selection.
- Below image: `c-ratings` row when `show_ratings` is true and product is present.
- Title and price: single row, title left-aligned, price right-aligned.
- Bottom: `c-swatch` row when `show_swatches` is true and the product has the matching color option.

Component metadata:

```yaml
components:
  c-product-card:
    version: 1.0.0
    type: snippet
    dependencies:
      - c-badge
      - c-ratings
      - c-swatch
    files:
      - from: components/c-product-card/c-product-card.liquid
        to: snippets/c-product-card.liquid
        checksum:
          algorithm: sha256
          value: ""
```

Snippet render contract:

```liquid
{% render 'c-product-card',
  product: product,
  badge_tags: 'Bestseller',
  show_ratings: true,
  show_swatches: true,
  color_option_name: 'Color'
%}
```

---

## Success behavior

- `nazare list` shows `c-product-card` as available after registry update.
- `nazare add c-product-card` installs `snippets/c-product-card.liquid` and transitively installs `c-badge`, `c-ratings`, and `c-swatch`.
- Blank `product` renders nothing.
- Product image, title, and price render for any product with a present object.
- Filled badges render for each tag in `badge_tags` that matches a product tag.
- Outline badges render for each remaining product tag surfaced as a category label.
- Ratings row renders when `show_ratings` is true.
- Ratings row is absent when `show_ratings` is false.
- Swatch row renders when `show_swatches` is true and the product has the matching color option.
- Swatch row is absent when `show_swatches` is false or no matching color option exists.
- Selecting a swatch updates the card image to the variant's image when one exists.
- Image links to `product.url`.
- Snippet uses Tailwind utility classes only.
- Component source checksum matches registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- Blank `product` renders nothing without Liquid errors or broken markup.
- Missing dependency snippets do not crash the card render — registry resolves transitively.
- No matching color option renders no swatch row without broken markup.
- Empty `badge_tags` renders no filled badges without empty pill elements.

---

## Verification

- [ ] component source exists at registry path
- [ ] registry contains `c-product-card` metadata with c-badge, c-ratings, c-swatch dependencies
- [ ] registry checksum matches component source bytes
- [ ] component metadata validates with component registry parser
- [ ] blank product renders nothing
- [ ] image, title, and price render for a valid product
- [ ] filled badges render for matched badge_tags
- [ ] ratings row present when show_ratings is true
- [ ] ratings row absent when show_ratings is false
- [ ] swatch row present when show_swatches is true and color option exists
- [ ] swatch row absent when show_swatches is false
- [ ] selecting a swatch swaps the card image to the variant image
- [ ] card image carries data-c-swatch-image attribute
- [ ] image links to product.url
- [ ] snippet uses Tailwind utilities only
- [ ] `nazare add c-product-card` smoke installs snippet and all dependencies

---

## Architecture notes

The card is a pure composition layer — no logic lives here that isn't already in a dependency. Badge filtering (which tags become filled vs. outline) is the only card-specific logic: `badge_tags` param controls the filled set; remaining tags are rendered as outline badges. This keeps the card declarative and predictable for callers.

Ratings hydration (fetching review data) is delegated entirely to `c-ratings` via `data-nazare-use`. The card passes the product object and renders the `c-ratings` shell; the ratings JS fills in the score and count asynchronously.

Swatch color mapping is delegated to `c-swatch`. The card only decides whether to render the swatch row at all, and marks its `<img>` with `data-c-swatch-image` to opt in to image swapping. No card-level JS is needed — the swap is handled entirely by `c-swatch.js`.

---

## Open questions

- Should the card expose an `image_ratio` param (e.g. `square`, `portrait`, `natural`) so callers in different grid contexts can control aspect ratio, or should a single ratio be fixed for all uses?
- Should outline badges be driven by a merchant-configured tag allowlist (to avoid rendering every internal Shopify tag), or should all non-`badge_tags` tags render as outline badges by default?
