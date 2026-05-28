---
schemaVersion: 1

id: s-faq
title: FAQ Section
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add
  - c-button
  - c-faq-item

surfaces:
  storefront:
    - sections/s-faq.liquid

invariants:
  - Component ID is s-faq
  - Installs through nazare add s-faq
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Does not require JavaScript
  - Heading is always rendered
  - CTA renders only when both cta_url and cta_label exist
  - Renders no FAQ list when zero faq blocks are added
  - Each faq block renders via c-faq-item
  - Does not mutate theme scaffold source

nonGoals:
  - Accordion expand/collapse behavior
  - Search or filtering of FAQ items
  - JavaScript behavior
  - Custom CSS files

codebaseOwnership:
  owns:
    repo:
      - components/s-faq/**
      - nazare.registry.yml s-faq metadata
      - test/ registry component validation for s-faq

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# FAQ Section

## Goal

Add an installable Shopify section that displays frequently asked questions as a staggered list of dark question pills with offset answers, beneath a centered heading and optional CTA.

The section delegates all question/answer rendering to `c-faq-item` and owns only the heading, CTA, and vertical list layout. Answers are always visible — no accordion behavior.

---

## Scope

Included:

- `components/s-faq/s-faq.liquid`
- `nazare.registry.yml` component metadata for `s-faq`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add s-faq` installs the section from the local registry
- configurable section settings:
  - heading text (required display; plain text)
  - optional CTA URL
  - optional CTA label
  - CTA style: `solid`, `outline`, `ghost` — default `outline`
- section blocks (type: `faq`):
  - question (required plain text)
  - answer (optional rich text)

Layout contract:

- Section uses `page-width` container with a narrower max-width to keep the FAQ list readable.
- Heading renders centered above the CTA.
- CTA renders centered below the heading via `{% render 'c-button', ... %}` when both URL and label are set.
- FAQ list renders below the CTA as a vertical stack of `{% render 'c-faq-item', ... %}` calls, one per block.
- Vertical spacing between FAQ items is generous to give each question/answer pair room to breathe.
- Zero faq blocks renders nothing below the CTA.

Component metadata:

```yaml
components:
  s-faq:
    version: 1.0.0
    type: section
    dependencies:
      - c-button
      - c-faq-item
    files:
      - from: components/s-faq/s-faq.liquid
        to: sections/s-faq.liquid
        checksum:
          algorithm: sha256
          value: ""
```

---

## Success behavior

- `nazare list` shows `s-faq` as available after registry update.
- `nazare add s-faq` installs `sections/s-faq.liquid` and transitively installs `c-button` and `c-faq-item`.
- Heading always renders.
- CTA renders centered below heading when both URL and label are set; absent otherwise.
- Each faq block renders via `c-faq-item` with question pill and answer.
- Zero faq blocks renders nothing below the CTA without broken markup.
- Component source checksum matches registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- Zero faq blocks renders no list without broken markup.
- Empty CTA URL or label renders no button without broken markup.
- Missing dependency snippets do not crash section render — registry resolves transitively.

---

## Verification

- [ ] component source exists at registry path
- [ ] registry contains `s-faq` metadata with c-button and c-faq-item dependencies
- [ ] registry checksum matches component source bytes
- [ ] component metadata validates with component registry parser
- [ ] heading always renders
- [ ] CTA renders when URL and label set, absent otherwise
- [ ] each faq block renders via c-faq-item
- [ ] zero blocks renders nothing below CTA
- [ ] section uses Tailwind utilities only
- [ ] `nazare add s-faq` smoke installs section and transitive dependencies

---

## Architecture notes

The section constrains its max-width to keep the staggered question/answer layout readable — full `page-width` would make the answer offset too wide on large screens. A `max-w-2xl` or `max-w-3xl` centered container is appropriate.

The heading and CTA are centered; the FAQ list is left-aligned within the container. This matches the design where the heading sits above a left-anchored list of items.

---

## Open questions

- Should the section support a two-column FAQ layout (two stacks of items side by side) for pages with many questions, or always single-column?
- Should the CTA link to a dedicated FAQ page or support any URL?
