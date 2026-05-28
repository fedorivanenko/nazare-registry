---
schemaVersion: 1

id: s-editorial
title: Editorial Section
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add
  - c-button

surfaces:
  storefront:
    - sections/s-editorial.liquid

invariants:
  - Component ID is s-editorial
  - Installs through nazare add s-editorial
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Headline and body text are always rendered; neither is optional
  - CTA renders only when both URL and label exist
  - Conditions row renders only when at least one condition block exists
  - Conditions label renders only when the setting is non-empty
  - Each condition block requires a label; icon is optional
  - Does not mutate theme scaffold source

nonGoals:
  - Animated icon interactions or hover effects
  - More than one CTA
  - Condition blocks linking to individual pages
  - Custom CSS files
  - JavaScript animations

codebaseOwnership:
  owns:
    repo:
      - components/s-editorial/**
      - nazare.registry.yml s-editorial metadata
      - test/ registry component validation for s-editorial

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# Editorial Section

## Goal

Deliver a persuasive above-the-fold statement section that pairs a large headline with supporting body copy and a CTA, then anchors the message with a row of icons representing the problems the brand solves.

The section is designed for brands that lead with a bold problem-framing narrative. The top split communicates the hook (headline) and the argument (body + CTA). The conditions row below surfaces the specific symptoms or problems the brand addresses, giving shoppers an immediate signal of relevance.

---

## Scope

Included:

- `components/s-editorial/s-editorial.liquid`
- `nazare.registry.yml` component metadata for `s-editorial`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add s-editorial` installs the section from the local registry
- configurable section settings:
  - headline text
  - body text (rich text)
  - optional CTA URL
  - optional CTA label
  - optional CTA button style: solid, outline, ghost
  - conditions row label (e.g. "WE DEAL WITH")
- repeatable section blocks (type: `condition`):
  - icon image (optional)
  - icon alt text (optional)
  - condition label (required)

Layout contract:

- Section background is a flat light surface (no image or video).
- Top area: two-column grid. Left column holds the headline (large, bold, uppercase). Right column holds the body text and CTA stacked vertically.
- Bottom area: full-width conditions row. The conditions label appears above the icon grid. Icons and labels are distributed evenly in a single horizontal row.
- Section uses `page-width` container for horizontal padding.

Component metadata:

```yaml
components:
  s-editorial:
    version: 1.0.0
    type: section
    dependencies:
      - c-button
    files:
      - from: components/s-editorial/s-editorial.liquid
        to: sections/s-editorial.liquid
        checksum:
          algorithm: sha256
          value: ""
```

---

## Success behavior

- `nazare list` shows `s-editorial` as available after registry update.
- `nazare add s-editorial` installs `sections/s-editorial.liquid` and transitively installs `c-button`.
- Section renders headline and body text without merchant setup.
- Section schema exposes headline, body, CTA URL, CTA label, CTA style, and conditions label settings.
- Schema exposes a `condition` block type with icon image, icon alt, and label fields.
- CTA renders only when both URL and label are set.
- Conditions row is hidden when no condition blocks are added.
- Conditions label above the icon row renders only when the setting is non-empty.
- Each condition block renders its icon (when set) above its label.
- Layout is a two-column split (headline left, body+CTA right) on desktop; stacks vertically on mobile.
- Icon row distributes conditions evenly across the full section width.
- Component source checksum matches registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- Empty CTA URL or label renders no button without broken markup.
- Empty conditions label setting renders no label element without empty placeholder.
- Condition block with no icon renders label-only without broken `<img>` markup.
- Missing c-button dependency does not crash install — registry resolves dependencies first.

---

## Verification

- [ ] component source exists at registry path
- [ ] registry contains `s-editorial` metadata with c-button dependency
- [ ] registry checksum matches component source bytes
- [ ] component metadata validates with component registry parser
- [ ] section schema contains headline, body, CTA URL, CTA label, CTA style, and conditions label settings
- [ ] section schema contains `condition` block type with icon image, icon alt, and label fields
- [ ] section uses Tailwind utilities only
- [ ] CTA render is gated by URL and label
- [ ] conditions row hidden when zero condition blocks added
- [ ] condition block renders icon only when image is set
- [ ] two-column layout on desktop, stacked on mobile
- [ ] `nazare add s-editorial` smoke installs section from local registry

---

## Architecture notes

The section is split into two visual zones: the top statement zone (headline + body + CTA) and the bottom conditions zone (label + icon grid). Both zones are rendered within a single section file with no sub-snippets needed — the conditions row is a native Shopify section blocks loop.

Condition icons are merchant-uploaded images (Shopify `image_picker`), not inline SVGs. This keeps the component source static and avoids bundling SVG assets into the registry. Merchants upload their own icon set via the theme editor.

The CTA delegates to `c-button` via `{% render 'c-button', ... %}` and is gated by `cta_url` and `cta_label` being non-empty, matching the pattern established in `s-hero`.

No JavaScript is required. All layout is Tailwind CSS.

---

## Open questions

- Should condition blocks support a link URL so each condition is clickable (e.g. links to a collection filtered by condition)?
- Should the headline support rich text or plain text only? Current spec is plain text to preserve the large-display uppercase treatment.
- Should the icon grid scroll horizontally on mobile when there are more than 4 conditions, or wrap to a second row?
