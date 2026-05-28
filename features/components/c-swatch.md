---
schemaVersion: 1

id: c-swatch
title: Swatch Snippet
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add

surfaces:
  storefront:
    - snippets/c-swatch.liquid

invariants:
  - Component ID is c-swatch
  - Installs through nazare add c-swatch
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Renders a row of circular color swatches for a single product option
  - Renders the selected variant option value as a label below the swatch row
  - Selecting a swatch updates the visible label and the active swatch indicator
  - Selecting a swatch updates the nearest [data-c-swatch-image] element when the variant has an image
  - Does not navigate to a new URL on swatch selection
  - Does not mutate theme scaffold source

nonGoals:
  - Full variant picker replacing Shopify's native variant selector
  - Add-to-cart on swatch selection
  - Out-of-stock swatch strikethrough
  - Image swatch (pattern/texture) support
  - Non-color option types (size, material)
  - Custom CSS files
  - Theme scaffold template placement

codebaseOwnership:
  owns:
    repo:
      - components/c-swatch/**
      - nazare.registry.yml c-swatch metadata
      - test/ registry component validation for c-swatch

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# Swatch Snippet

## Goal

Add an installable Shopify swatch snippet for displaying product color options as clickable circles with a selected value label.

The snippet gives product card and PDP components a shared color picker primitive. It renders a horizontal row of color circles derived from a product's variant option values, highlights the active selection, and updates a label below the row when the selected swatch changes.

---

## Scope

Included:

- `components/c-swatch/c-swatch.liquid`
- `components/c-swatch/c-swatch.js`
- `nazare.registry.yml` component metadata for `c-swatch`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add c-swatch` installs both files from the local registry
- snippet parameters:
  - `product` (required) — Shopify product object
  - `option_name` (required) — the option name to render swatches for (e.g. `"Color"`)
  - `selected_variant` (optional) — pre-selected variant; defaults to `product.selected_or_first_available_variant`
  - optional `class`

Component metadata:

```yaml
components:
  c-swatch:
    version: 1.0.0
    type: snippet
    dependencies: []
    files:
      - from: components/c-swatch/c-swatch.liquid
        to: snippets/c-swatch.liquid
        checksum:
          algorithm: sha256
          value: ""
      - from: components/c-swatch/c-swatch.js
        to: assets/c-swatch.js
        checksum:
          algorithm: sha256
          value: ""
```

Snippet render contract:

```liquid
{% render 'c-swatch', product: product, option_name: 'Color', selected_variant: selected_variant %}
```

- Renders a `<div>` root with `data-nazare-use="snippets/c-swatch"`.
- Iterates `product.options_with_values` to find the matching option by `option_name`.
- Renders one circle button per option value.
- Each circle button carries a `data-variant-image` attribute containing the variant image URL for that option value, serialized in Liquid at render time.
- Circle background color is derived from the option value name via a CSS custom property or inline style.
- The circle matching the selected variant's option value receives an active ring indicator.
- A `<span>` below the swatch row displays the currently selected option value name.
- Clicking a swatch updates the active ring and the label via `c-swatch.js`.
- When the clicked swatch has a non-empty `data-variant-image`, `c-swatch.js` finds the nearest `[data-c-swatch-image]` ancestor element and updates its `src` and `srcset`.
- When the clicked swatch has no variant image, the image element is left unchanged.
- Renders nothing when no matching option is found for `option_name`.

---

## Success behavior

- `nazare list` shows `c-swatch` as available after registry update.
- `nazare add c-swatch` installs `snippets/c-swatch.liquid` and `assets/c-swatch.js`.
- Snippet renders one circle per option value for the given option name.
- Active circle matches the selected variant's color option on initial render.
- Clicking a non-active swatch updates the active ring to the clicked swatch.
- Label below the row updates to the clicked swatch's option value name.
- Clicking a swatch whose variant has an image updates the nearest `[data-c-swatch-image]` element's `src` and `srcset`.
- Clicking a swatch whose variant has no image leaves the image element unchanged.
- No matching option renders nothing without Liquid errors.
- Snippet uses Tailwind utility classes only.
- Component source checksums match registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- Unknown `option_name` renders nothing without broken markup.
- Missing `product` renders nothing without Liquid errors.
- Snippet must not navigate the page or mutate the cart on swatch click.

---

## Verification

- [ ] component source exists at registry path for both liquid and js files
- [ ] registry contains `c-swatch` metadata
- [ ] registry checksums match component source bytes for both files
- [ ] component metadata validates with component registry parser
- [ ] snippet renders one circle per color option value
- [ ] active swatch matches selected variant on initial render
- [ ] clicking swatch updates active ring
- [ ] clicking swatch updates label text
- [ ] clicking swatch with variant image updates nearest [data-c-swatch-image] src and srcset
- [ ] clicking swatch without variant image leaves image element unchanged
- [ ] unknown option_name renders nothing
- [ ] missing product renders nothing
- [ ] snippet uses Tailwind utilities only
- [ ] `nazare add c-swatch` smoke installs both files from local registry

---

## Architecture notes

Color mapping from option value name to a visible circle color is the main open problem — see open questions. The JS (`c-swatch.js`) handles click events via `data-nazare-use` and has two responsibilities: (1) update active state and label within the component root, (2) update the nearest `[data-c-swatch-image]` element in the DOM when the selected variant has an image.

Image swap uses DOM traversal: `c-swatch.js` walks up from the swatch root to find the nearest ancestor containing a `[data-c-swatch-image]` element, then updates its `src` and `srcset`. Variant image URLs are embedded as `data-variant-image` attributes on each swatch button at Liquid render time, so no runtime API call is needed.

This couples `c-swatch` to any parent that marks its image with `data-c-swatch-image`. The contract is intentionally minimal — callers opt in by adding the attribute; c-swatch does nothing if no matching element is found.

The snippet is scoped to a single option type (color). Other option types (size, material) are out of scope and would require a separate component.

---

## Open questions

- How should option value names map to circle background colors? Options: (a) CSS named colors matched by lowercase value name, (b) product metafield map, (c) merchant-configured hex values in theme settings. This affects whether the snippet can be purely Liquid or needs a JS/metafield lookup.
- Should swatch selection update a hidden variant input so a parent add-to-cart form picks up the selection, or is image-swap + label update sufficient for the product card use case?
