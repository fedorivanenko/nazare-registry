---
schemaVersion: 1

id: c-badge
title: Badge Snippet
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add

surfaces:
  storefront:
    - snippets/c-badge.liquid

invariants:
  - Component ID is c-badge
  - Installs through nazare add c-badge
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Does not require JavaScript
  - Renders nothing when label is blank
  - Supports filled and outline styles
  - Does not mutate theme scaffold source

nonGoals:
  - Icon inside badge
  - Dismissible or closeable badges
  - JavaScript behavior
  - Custom CSS files
  - Theme scaffold template placement

codebaseOwnership:
  owns:
    repo:
      - components/c-badge/**
      - nazare.registry.yml c-badge metadata
      - test/ registry component validation for c-badge

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# Badge Snippet

## Goal

Add an installable Shopify badge snippet for labeling products, categories, and content across registry components.

The snippet gives future components a shared pill-shaped label primitive with two visual styles: filled (for high-emphasis labels like "Bestseller") and outline (for neutral labels like category tags).

---

## Scope

Included:

- `components/c-badge/c-badge.liquid`
- `nazare.registry.yml` component metadata for `c-badge`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add c-badge` installs the snippet from the local registry
- snippet parameters:
  - `label` (required)
  - `style`: `filled` or `outline` (defaults to `outline`)
  - optional `color`: Tailwind background color token for filled style (defaults to theme primary)
  - optional `class`

Component metadata:

```yaml
components:
  c-badge:
    version: 1.0.0
    type: snippet
    dependencies: []
    files:
      - from: components/c-badge/c-badge.liquid
        to: snippets/c-badge.liquid
        checksum:
          algorithm: sha256
          value: ""
```

Snippet render contract:

```liquid
{% render 'c-badge', label: 'Bestseller', style: 'filled' %}
{% render 'c-badge', label: 'Acid Reflux & Gut Health', style: 'outline' %}
```

- Renders a `<span>` pill when `label` is present.
- Renders nothing when `label` is blank.
- `filled` renders with a solid background color and contrasting text.
- `outline` renders with a transparent background, border, and matching text color.
- Defaults to `outline` when `style` is blank or unknown.
- Optional `class` appends caller-provided Tailwind utility classes to the root element.

---

## Success behavior

- `nazare list` shows `c-badge` as available after registry update.
- `nazare add c-badge` installs `snippets/c-badge.liquid`.
- Blank `label` renders nothing.
- Missing or invalid `style` falls back to `outline`.
- `filled` style renders solid background with legible text.
- `outline` style renders border with no background fill.
- Snippet uses Tailwind utility classes only.
- Component source checksum matches registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- Blank `label` must not render an empty pill element.
- Snippet must not depend on JavaScript, sections, templates, or scaffold changes.

---

## Verification

- [ ] component source exists at registry path
- [ ] registry contains `c-badge` metadata
- [ ] registry checksum matches component source bytes
- [ ] component metadata validates with component registry parser
- [ ] snippet renders pill when label is present
- [ ] snippet renders nothing when label is blank
- [ ] filled style renders solid background
- [ ] outline style renders border with no fill
- [ ] unknown style falls back to outline
- [ ] snippet uses Tailwind utilities only
- [ ] `nazare add c-badge` smoke installs snippet from local registry

---

## Architecture notes

Purely presentational — no JavaScript, no interactivity. The pill shape and size are fixed via Tailwind utilities. Color customization for filled badges is handled through the optional `color` param; callers pass a Tailwind background class token rather than raw CSS values.

---

## Open questions

- Should `filled` support a predefined set of named color tokens (e.g. `green`, `red`, `neutral`) rather than raw Tailwind class tokens, to prevent callers from passing arbitrary classes?
