---
schemaVersion: 1

id: s-trust-bar
title: Trust Bar Section
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add

surfaces:
  storefront:
    - sections/s-trust-bar.liquid

invariants:
  - Component ID is s-trust-bar
  - Installs through nazare add s-trust-bar
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Does not require JavaScript
  - Checkmark icon is inline SVG — no external asset dependency
  - Renders nothing when no item blocks are added
  - Each item renders its icon and label in a single horizontal row
  - Does not mutate theme scaffold source

nonGoals:
  - Per-item custom icons
  - Links on items
  - Marquee or scroll behavior
  - JavaScript interactions
  - Custom CSS files

codebaseOwnership:
  owns:
    repo:
      - components/s-trust-bar/**
      - nazare.registry.yml s-trust-bar metadata
      - test/ registry component validation for s-trust-bar

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# Trust Bar Section

## Goal

Add an installable Shopify section that displays a horizontal row of trust signals — each a checkmark icon paired with a short label.

The section gives merchants a lightweight credibility strip for landing pages, product pages, and collection pages. All items share the same inline SVG checkmark; the merchant configures only the label text for each item via section blocks.

---

## Scope

Included:

- `components/s-trust-bar/s-trust-bar.liquid`
- `nazare.registry.yml` component metadata for `s-trust-bar`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add s-trust-bar` installs the section from the local registry
- no section-level settings beyond Shopify defaults
- section blocks (type: `item`):
  - label text (required)

Layout contract:

- Section uses `page-width` container for horizontal padding.
- Items are distributed evenly in a single horizontal row (`justify-between` or `justify-evenly`).
- Each item is a flex row: inline SVG checkmark icon left, label text right, with a small gap.
- On mobile, items wrap or scroll horizontally if they exceed viewport width.
- Checkmark icon is a fixed-size circle with a checkmark stroke, rendered as inline SVG in the Liquid loop.
- Section renders nothing when zero item blocks are present.

Component metadata:

```yaml
components:
  s-trust-bar:
    version: 1.0.0
    type: section
    dependencies: []
    files:
      - from: components/s-trust-bar/s-trust-bar.liquid
        to: sections/s-trust-bar.liquid
        checksum:
          algorithm: sha256
          value: ""
```

---

## Success behavior

- `nazare list` shows `s-trust-bar` as available after registry update.
- `nazare add s-trust-bar` installs `sections/s-trust-bar.liquid`.
- Zero item blocks renders nothing.
- Each item block renders a checkmark icon and its label text.
- Items are distributed evenly across the full section width.
- Checkmark icon renders as inline SVG with no external asset request.
- Section uses Tailwind utility classes only.
- Component source checksum matches registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- Empty label renders an icon-only item without broken markup.
- Section must not emit JavaScript, custom CSS, or external asset requests.

---

## Verification

- [ ] component source exists at registry path
- [ ] registry contains `s-trust-bar` metadata with no dependencies
- [ ] registry checksum matches component source bytes
- [ ] component metadata validates with component registry parser
- [ ] zero blocks renders nothing
- [ ] each block renders checkmark icon and label
- [ ] items distributed evenly across section width
- [ ] checkmark renders as inline SVG with no external request
- [ ] section uses Tailwind utilities only
- [ ] `nazare add s-trust-bar` smoke installs section from local registry

---

## Architecture notes

No dependencies. The checkmark SVG is inlined directly in the Liquid loop — one `<svg>` per item. This avoids any snippet or asset dependency for a section this simple.

Mobile behavior is the main layout decision: items can either wrap to a second row or scroll horizontally. Wrapping is simpler and avoids needing `c-drag-scroll`; horizontal scroll would require it as a dependency. Wrapping is the default.

---

## Open questions

- Should items wrap to multiple rows on mobile or scroll horizontally? Wrapping is the current default; scroll would add `c-drag-scroll` as a dependency.
- Should the section support an optional background color setting (e.g. to switch between the light surface and a dark strip)?
