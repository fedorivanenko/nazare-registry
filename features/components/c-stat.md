---
schemaVersion: 1

id: c-stat
title: Stat Snippet
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add

surfaces:
  storefront:
    - snippets/c-stat.liquid

invariants:
  - Component ID is c-stat
  - Installs through nazare add c-stat
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Renders nothing when value is blank
  - label and description are each optional
  - Liquid renders 0 + suffix as initial visible text; real numeric target is stored in data-c-stat-target
  - aria-label on the value element always carries the real value string for screen readers
  - JavaScript animates 0 → target when the element enters the viewport via IntersectionObserver
  - Without JavaScript the value element displays the real value via aria-label but shows 0 + suffix visually — callers must decide if this is acceptable
  - Does not mutate theme scaffold source

nonGoals:
  - Icon or image alongside the stat
  - Custom CSS files
  - Theme scaffold template placement

codebaseOwnership:
  owns:
    repo:
      - components/c-stat/**
      - nazare.registry.yml c-stat metadata
      - test/ registry component validation for c-stat

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# Stat Snippet

## Goal

Add an installable Shopify snippet for displaying a single statistic — a category label, a large numeric value, and a supporting description — as a reusable typographic unit with a count-up animation on scroll.

The snippet encodes the three-tier typographic hierarchy of a stat display and handles the SSR/animation split: the server renders `0` + suffix as the initial visible state while storing the real target in a `data-` attribute, so JavaScript can animate cleanly without a flash of the final value.

---

## Scope

Included:

- `components/c-stat/c-stat.liquid`
- `components/c-stat/c-stat.js`
- `nazare.registry.yml` component metadata for `c-stat`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add c-stat` installs both files from the local registry
- snippet parameters:
  - `value` (required) — the full statistic string, e.g. `91%`
  - `label` (optional) — category label rendered above the value in small uppercase type
  - `description` (optional) — supporting text rendered below the value in body type
  - optional `class`

Component metadata:

```yaml
components:
  c-stat:
    version: 1.0.0
    type: snippet
    dependencies: []
    files:
      - from: components/c-stat/c-stat.liquid
        to: snippets/c-stat.liquid
        checksum:
          algorithm: sha256
          value: ""
      - from: components/c-stat/c-stat.js
        to: assets/c-stat.js
        checksum:
          algorithm: sha256
          value: ""
```

Snippet render contract:

```liquid
{% render 'c-stat', label: 'Reflux Relief', value: '91%', description: 'less acid reflux*' %}
```

- Renders nothing when `value` is blank.
- `label` renders above the value element in small uppercase tracking-wide type when non-empty.
- Value element:
  - carries `data-nazare-use="snippets/c-stat"` to load `c-stat.js`
  - carries `data-c-stat-target` set to the numeric portion of `value` (e.g. `91`)
  - carries `data-c-stat-suffix` set to the non-numeric suffix (e.g. `%`)
  - carries `aria-label` set to the full `value` string (e.g. `91%`) for screen readers
  - initial visible text content is `0` + suffix (e.g. `0%`)
- `description` renders below the value element in standard body type when non-empty.
- Optional `class` appends caller-provided Tailwind utility classes to the root element.

JavaScript behavior (`c-stat.js`):

- `init(root)` reads `data-c-stat-target` and `data-c-stat-suffix` from the value element.
- Sets up an `IntersectionObserver` on the value element.
- On first intersection: starts a `requestAnimationFrame` loop interpolating the displayed integer from `0` to `target` over a fixed duration (~1s).
- Each frame: sets `textContent` to `Math.round(current)` + suffix.
- On completion: sets `textContent` to `target` + suffix exactly.
- Observer disconnects after the animation fires once.

---

## Success behavior

- `nazare list` shows `c-stat` as available after registry update.
- `nazare add c-stat` installs `snippets/c-stat.liquid` and `assets/c-stat.js`.
- Blank `value` renders nothing.
- `label` renders in small uppercase type above the value when non-empty; absent when blank.
- Value element initial text is `0` + suffix before JS runs.
- `aria-label` on the value element carries the real value string.
- When the element enters the viewport, the displayed number animates from `0` to the target over ~1s.
- Animation fires once; re-scrolling does not restart it.
- `description` renders in body type below the value when non-empty; absent when blank.
- Snippet uses Tailwind utility classes only.
- Component source checksums match registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- Blank `value` renders nothing without empty wrapper elements.
- Without JavaScript, the value element displays `0` + suffix visually; `aria-label` carries the real value for screen readers.
- If `IntersectionObserver` is unavailable, animation does not run and the element stays at `0` + suffix.
- Animation must not throw on non-integer targets or malformed `data-c-stat-target` values.

---

## Verification

- [ ] component source exists at registry path for both liquid and js files
- [ ] registry contains `c-stat` metadata with no dependencies
- [ ] registry checksums match component source bytes for both files
- [ ] component metadata validates with component registry parser
- [ ] blank value renders nothing
- [ ] value element initial text is 0 + suffix before JS initializes
- [ ] aria-label on value element carries the real value string
- [ ] label renders in small uppercase type when non-empty, absent when blank
- [ ] value animates from 0 to target when element enters viewport
- [ ] animation fires once; does not restart on re-scroll
- [ ] description renders in body type when non-empty, absent when blank
- [ ] snippet uses Tailwind utilities only
- [ ] `nazare add c-stat` smoke installs both files from local registry

---

## Architecture notes

The SSR/animation split is handled entirely in Liquid: `data-c-stat-target` carries the numeric target, `data-c-stat-suffix` carries the suffix, and the initial text content is `0` + suffix. JavaScript never needs to parse or override a server-rendered final value — the initial state is already correct for animation. This eliminates the one-frame flash that would occur if JS had to overwrite a rendered `91%` with `0%` after paint.

`aria-label` on the value element carries the real value string so screen readers announce the correct number regardless of the animated display state. The visual `0` → target animation is marked `aria-hidden` if needed, but since `aria-label` overrides text content for assistive tech, no additional ARIA is required.

The `rAF` loop uses a fixed easing (ease-out) over a fixed duration. Duration and easing are not configurable — keeping the animation consistent across all stat instances is preferable to per-instance customization.

---

## Open questions

- Should the no-JS fallback show the real value instead of `0` + suffix? This would require either a `<noscript>` tag rendering the real value or a CSS-based show/hide that JS toggles on init — both add complexity. Current decision: accept `0` + suffix as the no-JS state since screen readers get the correct value via `aria-label`.
