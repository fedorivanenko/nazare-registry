---
schemaVersion: 1

id: c-email-signup
title: Email Signup Snippet
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add

surfaces:
  storefront:
    - snippets/c-email-signup.liquid

invariants:
  - Component ID is c-email-signup
  - Installs through nazare add c-email-signup
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Does not own submission logic — callers pass provider-specific data attributes via the attrs param
  - Renders a form with an email input and a submit button
  - Submit button label is configurable
  - Email input placeholder is configurable
  - Does not mutate theme scaffold source

nonGoals:
  - Provider-specific submission logic
  - Success or error state rendering
  - JavaScript behavior
  - Double opt-in handling
  - Custom CSS files
  - Theme scaffold template placement

codebaseOwnership:
  owns:
    repo:
      - components/c-email-signup/**
      - nazare.registry.yml c-email-signup metadata
      - test/ registry component validation for c-email-signup

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# Email Signup Snippet

## Goal

Add an installable Shopify snippet that renders an email capture form — input field and submit button — as a provider-agnostic UI primitive.

The snippet owns the form markup and styling only. Provider-specific submission logic (Klaviyo, Mailchimp, etc.) is added by provider wrapper snippets that call `c-email-signup` with the required `data-` attributes and `data-nazare-use` pointing to their JS file. This mirrors the `c-ratings` / `c-ratings-klaviyo` pattern.

---

## Scope

Included:

- `components/c-email-signup/c-email-signup.liquid`
- `nazare.registry.yml` component metadata for `c-email-signup`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add c-email-signup` installs the snippet from the local registry
- snippet parameters:
  - `placeholder` (optional) — email input placeholder text, default `Email Address`
  - `button_label` (optional) — submit button label, default `Sign up`
  - `attrs` (optional) — raw HTML attribute string injected onto the `<form>` element by the caller (used by provider wrappers to add `data-nazare-use`, `data-list-id`, etc.)
  - optional `class`

Component metadata:

```yaml
components:
  c-email-signup:
    version: 1.0.0
    type: snippet
    dependencies: []
    files:
      - from: components/c-email-signup/c-email-signup.liquid
        to: snippets/c-email-signup.liquid
        checksum:
          algorithm: sha256
          value: ""
```

Snippet render contract:

```liquid
{% capture signup_attrs %}
  data-nazare-use="snippets/c-email-signup-klaviyo"
  data-list-id="{{ section.settings.klaviyo_list_id }}"
{% endcapture %}

{% render 'c-email-signup',
  placeholder: 'Email Address',
  button_label: 'Sign Up',
  attrs: signup_attrs
%}
```

- Renders a `<form>` element with the `attrs` string injected as raw attributes.
- Inside: an email `<input type="email">` with the configured placeholder and `required`.
- Inside: a `<button type="submit">` with the configured label.
- Provider wrappers use `attrs` to attach `data-nazare-use` (to load their JS) and any provider-specific data attributes.

---

## Success behavior

- `nazare list` shows `c-email-signup` as available after registry update.
- `nazare add c-email-signup` installs `snippets/c-email-signup.liquid`.
- Form renders with email input and submit button.
- `attrs` content is injected onto the `<form>` element.
- Placeholder and button label use configured values; fall back to defaults when blank.
- Snippet uses Tailwind utility classes only.
- Component source checksum matches registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- Blank `attrs` renders a form with no provider data attributes — submission will not work until a provider wrapper is used.
- Snippet must not depend on JavaScript, sections, templates, or scaffold changes.

---

## Verification

- [ ] component source exists at registry path
- [ ] registry contains `c-email-signup` metadata with no dependencies
- [ ] registry checksum matches component source bytes
- [ ] component metadata validates with component registry parser
- [ ] form renders with email input and submit button
- [ ] attrs string is injected onto the form element
- [ ] placeholder and button label use configured values
- [ ] snippet uses Tailwind utilities only
- [ ] `nazare add c-email-signup` smoke installs snippet from local registry

---

## Architecture notes

`c-email-signup` is a pure UI shell. It has no opinion about where the form data goes. Provider wrappers (`c-email-signup-klaviyo`, etc.) call it with a `attrs` capture block that injects `data-nazare-use` and any provider-specific attributes. The provider JS file handles submission, success state, and error state entirely — none of that lives in this snippet.

The `attrs` injection pattern (raw string into the form element) is the Liquid-compatible way to pass arbitrary HTML attributes without a fixed param list. Callers use `{% capture %}` to build the attribute string cleanly.

---

## Open questions

- Should `c-email-signup` own a success/error state UI (hidden by default, shown by provider JS), or should each provider snippet own its own success/error markup?
