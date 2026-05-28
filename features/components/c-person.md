---
schemaVersion: 1

id: c-person
title: Person Snippet
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add

surfaces:
  storefront:
    - snippets/c-person.liquid

invariants:
  - Component ID is c-person
  - Installs through nazare add c-person
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Does not require JavaScript
  - Renders nothing when both name and image are blank
  - Avatar renders only when image is present
  - Name and role are each optional but at least one must be present to render
  - Does not mutate theme scaffold source

nonGoals:
  - Link to author or team page
  - Social media icons
  - JavaScript behavior
  - Custom CSS files
  - Theme scaffold template placement

codebaseOwnership:
  owns:
    repo:
      - components/c-person/**
      - nazare.registry.yml c-person metadata
      - test/ registry component validation for c-person

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# Person Snippet

## Goal

Add an installable Shopify snippet for displaying a person attribution — a circular avatar image alongside a name and role — as a reusable identity unit.

The snippet is used wherever a human source needs to be credited: quote attributions, testimonial authors, team members, blog post bylines. It encodes the circular avatar + stacked name/role layout once so all surfaces share consistent rendering.

---

## Scope

Included:

- `components/c-person/c-person.liquid`
- `nazare.registry.yml` component metadata for `c-person`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add c-person` installs the snippet from the local registry
- snippet parameters:
  - `image` (optional) — Shopify image object for the avatar
  - `image_alt` (optional) — alt text for the avatar image
  - `name` (optional) — person's name; renders in bold
  - `role` (optional) — person's title or role; renders in normal weight below name
  - optional `class`

Component metadata:

```yaml
components:
  c-person:
    version: 1.0.0
    type: snippet
    dependencies: []
    files:
      - from: components/c-person/c-person.liquid
        to: snippets/c-person.liquid
        checksum:
          algorithm: sha256
          value: ""
```

Snippet render contract:

```liquid
{% render 'c-person',
  image: section.settings.person_image,
  image_alt: section.settings.person_image_alt,
  name: section.settings.person_name,
  role: section.settings.person_role
%}
```

- Renders nothing when both `name` and `image` are blank.
- Root is a flex row: avatar left, name + role stacked right.
- Avatar renders as a circle-cropped image (`rounded-full`, `object-cover`) when `image` is present; avatar slot is absent when image is blank.
- `name` renders in bold type when non-empty; absent otherwise.
- `role` renders in normal weight below name when non-empty; absent otherwise.
- `image_alt` is used as the avatar `alt` attribute; defaults to empty string (decorative) when blank.
- Optional `class` appends caller-provided Tailwind utility classes to the root element.

---

## Success behavior

- `nazare list` shows `c-person` as available after registry update.
- `nazare add c-person` installs `snippets/c-person.liquid`.
- Blank name and blank image renders nothing.
- Avatar renders as a circle when image is present; absent when image is blank.
- Name renders in bold when non-empty; absent otherwise.
- Role renders in normal weight below name when non-empty; absent otherwise.
- Snippet uses Tailwind utility classes only.
- Component source checksum matches registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- Blank name and blank image renders nothing without empty wrapper elements.
- Missing image renders no avatar without broken `<img>` markup.
- Snippet must not depend on JavaScript, sections, templates, or scaffold changes.

---

## Verification

- [ ] component source exists at registry path
- [ ] registry contains `c-person` metadata with no dependencies
- [ ] registry checksum matches component source bytes
- [ ] component metadata validates with component registry parser
- [ ] blank name and blank image renders nothing
- [ ] avatar renders as circle when image present, absent when image blank
- [ ] name renders in bold when non-empty, absent otherwise
- [ ] role renders below name when non-empty, absent otherwise
- [ ] snippet uses Tailwind utilities only
- [ ] `nazare add c-person` smoke installs snippet from local registry

---

## Architecture notes

Purely presentational — a flex row with a fixed avatar size and stacked text. Avatar size is fixed via Tailwind utilities; callers that need a different size can override via the `class` param. No JavaScript, no interactivity.

---

## Open questions

None.
