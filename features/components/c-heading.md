---
schemaVersion: 1

id: c-heading
title: Heading Snippet
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add

surfaces:
  storefront:
    - snippets/c-heading.liquid

invariants:
  - Component ID is c-heading
  - Installs through nazare add c-heading
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Does not require JavaScript
  - Always applies font-heading, font-bold, and uppercase
  - Supports exactly four sizes: sm, md, lg, xl
  - tag param controls semantic HTML element
  - Defaults to h2 when tag is blank or unknown
  - Defaults to lg when size is blank or unknown
  - Does not mutate theme scaffold source

nonGoals:
  - Italic or non-uppercase variants
  - Icon slots
  - JavaScript behavior
  - Responsive tag switching
  - Custom CSS files
  - Theme scaffold template placement

codebaseOwnership:
  owns:
    repo:
      - components/c-heading/**
      - nazare.registry.yml c-heading metadata
      - test/ registry component validation for c-heading

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# Heading Snippet

## Goal

Add an installable Shopify heading snippet that enforces the shared typographic scale across registry sections.

Every section that renders a prominent heading (`s-hero`, and ~3 future sections) delegates to `c-heading` so font size, line height, weight, and letter treatment stay consistent without duplication.

---

## Scope

Included:

- `components/c-heading/c-heading.liquid`
- `nazare.registry.yml` component metadata for `c-heading`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add c-heading` installs the snippet from the local registry
- snippet parameters:
  - `text` — heading string, escaped on output
  - `size`: `sm`, `md`, `lg`, `xl`
  - `tag`: semantic HTML element — `h1`, `h2`, `h3`, `h4`, `p`; defaults to `h2`
  - optional `class` — extra Tailwind utilities appended to the root element

Typography scale:

| size | mobile | desktop |
|------|--------|---------|
| `sm` | `text-[40px]/[36px]` | `lg:text-[52px]/[44px]` |
| `md` | `text-[56px]/[48px]` | `lg:text-[72px]/[60px]` |
| `lg` | `text-[70px]/[56px]` | `lg:text-[90px]/[72px]` |
| `xl` | `text-[100px]/[80px]` | `lg:text-[130px]/[104px]` |

All sizes share: `font-heading font-bold uppercase`.

Component metadata:

```yaml
components:
  c-heading:
    version: 1.0.0
    type: snippet
    dependencies: []
    files:
      - from: components/c-heading/c-heading.liquid
        to: snippets/c-heading.liquid
        checksum:
          algorithm: sha256
          value: <sha256>
```

Snippet render contract:

```liquid
{% render 'c-heading', text: section.settings.heading, size: 'lg', tag: 'h1', class: 'py-5' %}
```

- Renders the heading element when `text` is present.
- Renders nothing when `text` is blank.
- `tag` defaults to `h2` when blank or unknown.
- `size` defaults to `lg` when blank or unknown.
- `text` is always HTML-escaped.
- Optional `class` appends to the root element's class attribute.

---

## Success behavior

- `nazare list` shows `c-heading` as available after registry update.
- `nazare add c-heading` installs `snippets/c-heading.liquid`.
- Blank `text` renders nothing.
- All four sizes render with correct mobile and desktop font-size and line-height classes.
- Unknown or blank `size` falls back to `lg`.
- Unknown or blank `tag` falls back to `h2`.
- All sizes apply `font-heading font-bold uppercase`.
- Optional `class` is appended without duplicating base classes.
- Component source checksum matches registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- Snippet must not depend on JavaScript, sections, templates, or scaffold changes.
- Blank `text` must not render an empty heading element.

---

## Verification

Result: planned.

- [ ] component source exists at registry path
- [ ] registry contains `c-heading` metadata
- [ ] registry checksum matches component source bytes
- [ ] component metadata validates with component registry parser
- [ ] snippet renders nothing when text is blank
- [ ] all four sizes render correct Tailwind classes
- [ ] unknown size falls back to lg
- [ ] unknown tag falls back to h2
- [ ] optional class is appended correctly
- [ ] snippet uses Tailwind utilities only
- [ ] `nazare add c-heading` smoke installs snippet from local registry

---

## Architecture notes

`c-heading` is a pure presentational primitive — no logic beyond size-to-class mapping. Callers own the semantic tag choice; the snippet owns the typographic style.

The `tag` param uses Liquid's `capture` + output approach since Liquid cannot dynamically set the element name inline. The snippet emits the correct opening and closing tags based on the `tag` value.

---

## Open questions

None.
