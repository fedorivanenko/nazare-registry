---
schemaVersion: 1

id: s-hero
title: Hero Section
status: ready

dependencies:
  - component-registry
  - component-list
  - component-add
  - s-announcement

surfaces:
  storefront:
    - sections/s-hero.liquid

invariants:
  - Component ID is s-hero
  - Installs through nazare add s-hero
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Does not require JavaScript
  - Optional CTA renders only when both URL and label exist
  - Does not mutate theme scaffold source

nonGoals:
  - Slideshow or carousel behavior
  - Video backgrounds
  - Multiple image art direction sources
  - Header integration
  - Theme scaffold template placement
  - JavaScript animations
  - Custom CSS files

codebaseOwnership:
  owns:
    repo:
      - components/s-hero/**
      - nazare.registry.yml s-hero metadata
      - test/ registry component validation for s-hero
      - README.md default component notes if needed

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# Hero Section

## Goal

Add an installable Shopify hero section for first-screen storefront messaging.

The section gives merchants a flexible landing-page hero with heading, text, optional image, and optional CTA while staying self-contained in the component registry.

---

## Scope

Included:

- `components/s-hero/sections/s-hero.liquid`
- `nazare.registry.yml` component metadata for `s-hero`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add s-hero` installs the section from the local registry
- configurable section settings:
  - eyebrow text
  - heading
  - body text
  - optional image
  - optional image alt text
  - optional CTA URL
  - optional CTA label
  - content alignment: left, center
  - color scheme: dark, light

Component metadata:

```yaml
components:
  s-hero:
    version: 1.0.0
    type: section
    dependencies: []
    files:
      - from: components/s-hero/sections/s-hero.liquid
        to: sections/s-hero.liquid
        checksum:
          algorithm: sha256
          value: <sha256>
```

Section render contract:

- Uses `{% render 'section-css', section_name: 's-hero' %}`.
- Root section uses Tailwind utility classes only.
- Empty eyebrow/body/image values are omitted.
- Heading renders from settings and has a safe default.
- CTA link renders only when both `cta_url` and `cta_label` are present.
- Image renders only when an image is selected.
- Image alt text uses explicit setting when present and falls back to image alt metadata.

---

## Success behavior

- `nazare list` shows `s-hero` as available after registry update.
- `nazare add s-hero` installs `sections/s-hero.liquid`.
- Installed section renders default hero content without merchant setup.
- Installed section schema exposes eyebrow, heading, body, image, image alt, CTA URL, CTA label, content alignment, and color scheme settings.
- Optional CTA renders only when both URL and label exist.
- Optional image renders only when selected.
- Section uses Tailwind utility classes only.
- Component source checksum matches registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- Section must not depend on JavaScript, snippets, templates, or scaffold changes.
- Empty optional settings must not render broken links, empty media wrappers, or placeholder content.

---

## Verification

Result: ready for implementation.

- [ ] component source exists at registry path
- [ ] registry contains `s-hero` metadata
- [ ] registry checksum matches component source bytes
- [ ] component metadata validates with component registry parser
- [ ] section schema contains eyebrow, heading, body, image, image alt, CTA URL, CTA label, alignment, and color scheme settings
- [ ] section uses Tailwind utilities
- [ ] CTA render is gated by URL and label
- [ ] image render is gated by selected image
- [ ] `nazare add s-hero` smoke installs section from local registry

---

## Architecture notes

Keep this component self-contained. No JavaScript asset, no snippets, no template changes.

Use the existing section CSS render convention from scaffold and registry sections:

```liquid
{% render 'section-css', section_name: 's-hero' %}
```

Use Liquid variables for settings and Tailwind classes inline in markup. Conditional styling should live directly in `class` attributes or Liquid branches; do not add custom CSS.

Prefer one hero layout with responsive image placement over multiple layout modes to keep v1 small.

---

## Open questions

None.
