---
schemaVersion: 1

id: c-email-signup-klaviyo
title: Email Signup — Klaviyo
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add
  - c-email-signup

surfaces:
  storefront:
    - snippets/c-email-signup-klaviyo.liquid

invariants:
  - Component ID is c-email-signup-klaviyo
  - Installs through nazare add c-email-signup-klaviyo
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Renders c-email-signup with Klaviyo-specific data attributes and data-nazare-use
  - Requires a Klaviyo list ID to function
  - JavaScript submits the form to the Klaviyo subscribe endpoint without page reload
  - Does not mutate theme scaffold source

nonGoals:
  - Klaviyo popup or flyout behavior
  - Double opt-in flow UI
  - Custom CSS files
  - Theme scaffold template placement

codebaseOwnership:
  owns:
    repo:
      - components/c-email-signup-klaviyo/**
      - nazare.registry.yml c-email-signup-klaviyo metadata
      - test/ registry component validation for c-email-signup-klaviyo

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# Email Signup — Klaviyo

## Goal

Add an installable Shopify snippet that wires `c-email-signup` to Klaviyo's subscribe API.

The snippet renders the `c-email-signup` form shell with Klaviyo-specific data attributes and loads the Klaviyo submission JS via `data-nazare-use`. It is the Klaviyo counterpart to `c-email-signup`, mirroring the relationship between `c-ratings` and `c-ratings-klaviyo`.

---

## Scope

Included:

- `components/c-email-signup-klaviyo/c-email-signup-klaviyo.liquid`
- `components/c-email-signup-klaviyo/c-email-signup-klaviyo.js`
- `nazare.registry.yml` component metadata for `c-email-signup-klaviyo`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add c-email-signup-klaviyo` installs both files from the local registry
- snippet parameters:
  - `list_id` (required) — Klaviyo list ID to subscribe the email address to
  - `placeholder` (optional) — forwarded to `c-email-signup`
  - `button_label` (optional) — forwarded to `c-email-signup`
  - optional `class`

Component metadata:

```yaml
components:
  c-email-signup-klaviyo:
    version: 1.0.0
    type: snippet
    dependencies:
      - c-email-signup
    files:
      - from: components/c-email-signup-klaviyo/c-email-signup-klaviyo.liquid
        to: snippets/c-email-signup-klaviyo.liquid
        checksum:
          algorithm: sha256
          value: ""
      - from: components/c-email-signup-klaviyo/c-email-signup-klaviyo.js
        to: assets/c-email-signup-klaviyo.js
        checksum:
          algorithm: sha256
          value: ""
```

Snippet render contract:

```liquid
{% render 'c-email-signup-klaviyo',
  list_id: section.settings.klaviyo_list_id,
  placeholder: 'Email Address',
  button_label: 'Sign Up'
%}
```

- Captures a `{% capture attrs %}` block with `data-nazare-use="snippets/c-email-signup-klaviyo"` and `data-list-id="{{ list_id }}"`.
- Calls `{% render 'c-email-signup', placeholder: placeholder, button_label: button_label, attrs: attrs %}`.

JavaScript behavior (`c-email-signup-klaviyo.js`):

- `init(root)` attaches a `submit` event listener to the form.
- On submit: prevents default, reads the email input value and `data-list-id`.
- POSTs to the Klaviyo `/client/subscriptions/` endpoint with the list ID and email.
- On success: shows a success state (input replaced with a confirmation message or class toggle).
- On error: shows an inline error message without clearing the input.

---

## Success behavior

- `nazare list` shows `c-email-signup-klaviyo` as available after registry update.
- `nazare add c-email-signup-klaviyo` installs both files and transitively installs `c-email-signup`.
- Form renders via `c-email-signup` with Klaviyo data attributes present.
- Submitting a valid email subscribes it to the configured Klaviyo list without page reload.
- Success state renders after successful subscription.
- Error state renders after failed subscription without clearing the email input.
- Component source checksums match registry metadata.

---

## Failure behavior

- Invalid registry metadata or checksum mismatch fails existing component validation/tests.
- Missing component source file fails registry component tests.
- Blank `list_id` renders the form but subscription will fail — no Liquid error.
- Network error on submission shows error state without throwing uncaught exceptions.

---

## Verification

- [ ] component source exists at registry path for both liquid and js files
- [ ] registry contains `c-email-signup-klaviyo` metadata with c-email-signup dependency
- [ ] registry checksums match component source bytes for both files
- [ ] component metadata validates with component registry parser
- [ ] form renders with correct Klaviyo data attributes
- [ ] valid email submission subscribes to configured list without page reload
- [ ] success state renders after successful subscription
- [ ] error state renders after network failure without clearing input
- [ ] `nazare add c-email-signup-klaviyo` smoke installs both files and c-email-signup

---

## Architecture notes

The Liquid snippet is a thin wrapper — it builds the `attrs` capture and delegates rendering to `c-email-signup`. All Klaviyo-specific logic (API endpoint, list ID, success/error state) lives in `c-email-signup-klaviyo.js`.

The Klaviyo `/client/subscriptions/` endpoint requires a public API key. This should be set as a theme setting (not hardcoded) and passed via a `data-api-key` attribute, or read from a global Shopify theme variable. Exact approach depends on how the Klaviyo JS SDK is loaded in the theme.

---

## Open questions

- Should the Klaviyo public API key be passed as a snippet param or read from a global theme setting?
- Should success/error state UI (confirmation text, error message) be configurable as snippet params, or fixed strings in the JS?
