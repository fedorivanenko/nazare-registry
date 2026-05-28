---
schemaVersion: 1

id: c-social-links
title: Social Links Snippet
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add

surfaces:
  storefront:
    - snippets/c-social-links.liquid

invariants:
  - Component ID is c-social-links
  - Installs through nazare add c-social-links
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Does not require JavaScript
  - Renders nothing when all platform URLs are blank
  - Only platforms with non-blank URLs render an icon
  - Each icon is inline SVG — no external asset dependency
  - Each icon links to its platform URL in a new tab
  - Does not mutate theme scaffold source

nonGoals:
  - Follower counts
  - Feed embeds
  - JavaScript behavior
  - Custom CSS files
  - Theme scaffold template placement

codebaseOwnership:
  owns:
    repo:
      - components/c-social-links/**
      - nazare.registry.yml c-social-links metadata
      - test/ registry component validation for c-social-links

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# Social Links Snippet

## Goal

Add an installable Shopify snippet that renders a row of circular social platform icon links for any platforms with a configured URL.

The snippet is reusable across header, footer, and social gallery surfaces. Platform icons are inline SVG; only platforms with non-blank URLs render, so callers configure exactly which icons appear without conditionals.

---

## Scope

Included:

- `components/c-social-links/c-social-links.liquid`
- `nazare.registry.yml` component metadata for `c-social-links`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add c-social-links` installs the snippet from the local registry
- snippet parameters (all optional URL strings):
  - `instagram`
  - `facebook`
  - `youtube`
  - `tiktok`
  - `twitter`
  - `pinterest`
  - optional `class`

Component metadata:

```yaml
components:
  c-social-links:
    version: 1.0.0
    type: snippet
    dependencies: []
    files:
      - from: components/c-social-links/c-social-links.liquid
        to: snippets/c-social-links.liquid
        checksum:
          algorithm: sha256
          value: ""
```

Snippet render contract:

```liquid
{% render 'c-social-links',
  instagram: section.settings.instagram_url,
  facebook: section.settings.facebook_url,
  youtube: section.settings.youtube_url
%}
```

- Renders nothing when all platform params are blank.
- Renders a flex row of icon links; only platforms with non-blank URLs are included.
- Each icon is a circular bordered anchor (`target="_blank"`, `rel="noopener"`) containing an inline SVG brand icon.
- Icon render order is fixed: Instagram, Facebook, YouTube, TikTok, Twitter, Pinterest.
- Optional `class` appends caller-provided Tailwind utility classes to the root flex element.

---

## Success behavior

- `nazare list` shows `c-social-links` as available after registry update.
- `nazare add c-social-links` installs `snippets/c-social-links.liquid`.
- All blank URLs renders nothing.
- Only platforms with non-blank URLs render an icon link.
- Each icon links to its URL in a new tab with `rel="noopener"`.
- Icons render as inline SVG with no external requests.
- Snippet uses Tailwind utility classes only.
- Component source checksum matches registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- All blank URLs renders nothing without empty wrapper element.
- Snippet must not depend on JavaScript, sections, templates, or scaffold changes.

---

## Verification

- [ ] component source exists at registry path
- [ ] registry contains `c-social-links` metadata with no dependencies
- [ ] registry checksum matches component source bytes
- [ ] component metadata validates with component registry parser
- [ ] all blank renders nothing
- [ ] only platforms with non-blank URLs render
- [ ] each icon links to its URL in a new tab
- [ ] icons render as inline SVG with no external requests
- [ ] snippet uses Tailwind utilities only
- [ ] `nazare add c-social-links` smoke installs snippet from local registry

---

## Architecture notes

Each platform icon is a separate inline SVG block inside a Liquid conditional. The render order is fixed so the visual sequence is predictable regardless of which platforms are configured.

---

## Open questions

- Should the icon style be configurable (circular bordered vs. plain icon vs. filled circle)?
