---
schemaVersion: 1

id: c-faq-item
title: FAQ Item Snippet
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add

surfaces:
  storefront:
    - snippets/c-faq-item.liquid

invariants:
  - Component ID is c-faq-item
  - Installs through nazare add c-faq-item
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Does not require JavaScript
  - Renders nothing when question is blank
  - Question renders as a dark rounded pill with white bold text
  - Answer renders as body text offset to the right of the question
  - Answer is always visible — no accordion toggle behavior
  - Does not mutate theme scaffold source

nonGoals:
  - Accordion expand/collapse toggle
  - JavaScript behavior
  - Custom CSS files
  - Theme scaffold template placement

codebaseOwnership:
  owns:
    repo:
      - components/c-faq-item/**
      - nazare.registry.yml c-faq-item metadata
      - test/ registry component validation for c-faq-item

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# FAQ Item Snippet

## Goal

Add an installable Shopify snippet for displaying a single FAQ entry — a question rendered as a dark rounded pill and an answer rendered as offset body text below it.

The snippet encodes the staggered FAQ layout so sections that display frequently asked questions share consistent question/answer rendering without duplicating the pill and offset markup pattern.

---

## Scope

Included:

- `components/c-faq-item/c-faq-item.liquid`
- `nazare.registry.yml` component metadata for `c-faq-item`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add c-faq-item` installs the snippet from the local registry
- snippet parameters:
  - `question` (required) — question text; renders in the dark pill
  - `answer` (optional) — answer body; rich text to support inline links and emphasis
  - optional `class`

Component metadata:

```yaml
components:
  c-faq-item:
    version: 1.0.0
    type: snippet
    dependencies: []
    files:
      - from: components/c-faq-item/c-faq-item.liquid
        to: snippets/c-faq-item.liquid
        checksum:
          algorithm: sha256
          value: ""
```

Snippet render contract:

```liquid
{% render 'c-faq-item',
  question: block.settings.question,
  answer: block.settings.answer
%}
```

- Renders nothing when `question` is blank.
- Question renders as a dark (`bg-neutral-800` or equivalent) rounded-full pill with white bold text and generous horizontal padding.
- Answer renders below the question, offset to the right (left margin of ~40% or equivalent) in body-weight type.
- Answer renders only when non-empty; absent otherwise.
- Optional `class` appends caller-provided Tailwind utility classes to the root element.

---

## Success behavior

- `nazare list` shows `c-faq-item` as available after registry update.
- `nazare add c-faq-item` installs `snippets/c-faq-item.liquid`.
- Blank `question` renders nothing.
- Question renders as a dark rounded pill with white bold text.
- Answer renders offset to the right when non-empty; absent when blank.
- Snippet uses Tailwind utility classes only.
- Component source checksum matches registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- Blank `question` renders nothing without empty pill element.
- Snippet must not depend on JavaScript, sections, templates, or scaffold changes.

---

## Verification

- [ ] component source exists at registry path
- [ ] registry contains `c-faq-item` metadata with no dependencies
- [ ] registry checksum matches component source bytes
- [ ] component metadata validates with component registry parser
- [ ] blank question renders nothing
- [ ] question renders as dark rounded pill with white bold text
- [ ] answer renders offset right when non-empty, absent when blank
- [ ] snippet uses Tailwind utilities only
- [ ] `nazare add c-faq-item` smoke installs snippet from local registry

---

## Architecture notes

The staggered layout (question left, answer indented right) is achieved with a left margin on the answer element. The pill width is `fit-content` so short and long questions both render naturally without a fixed width constraint.

Answer is rich text to support inline product name links and formatting, consistent with the design where answers contain bolded product links.

Always-visible answers — no accordion behavior — keeps the snippet dependency-free. Accordion toggle would require JavaScript and is deferred; see open questions.

---

## Open questions

- Should a future version support an accordion toggle (click question pill to expand/collapse answer) as an opt-in `accordion` boolean param, adding a `c-faq-item.js` file?
