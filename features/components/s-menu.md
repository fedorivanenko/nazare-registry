---
schemaVersion: 1

id: s-menu
title: Menu Section (Header)
status: planned

dependencies:
  - component-registry
  - component-list
  - component-add
  - c-button

surfaces:
  storefront:
    - sections/s-menu.liquid
    - scripts/sections/s-menu.js

invariants:
  - Component ID is s-menu
  - Installs through nazare add s-menu
  - Registry metadata includes checksum for every component file
  - Uses Tailwind utilities for all styling
  - Section source includes nazare:layout header directive so the Vite plugin injects it into layout/theme.liquid automatically
  - Header is sticky (position: sticky top-0)
  - Logo falls back to shop.name text when no logo image is set
  - Nav items with no matching mega_tab blocks render as plain <a> links
  - Nav items with at least one matching mega_tab block render as <button> triggers
  - Nav slot matching uses handleize on both the section setting value and the nav link title — case and spacing differences do not break the match
  - Mega panel tabs default to the first block in the slot when no explicit default is set
  - All mega panels are hidden on load; JS opens them
  - Tab panel switching is client-side JS only — all tab content is pre-rendered in HTML
  - Product cards in the mega panel render inline (not via c-product-card) with title and price on the same row
  - Slot 4 renders an editorial card when editorial_image is set; falls back to product_4 when not
  - CTA button renders only when both cta_label and cta_url are set on the block
  - Does not mutate theme scaffold source

nonGoals:
  - Mobile hamburger / drawer menu
  - Search drawer or modal
  - Cart drawer
  - Announcement bar (use s-announcement)
  - Active link highlighting based on current URL
  - Per-product badges inside mega panel cards
  - Keyboard tab navigation through all menu items
  - Animated panel transitions
  - Custom CSS files
  - More than 3 mega menu slots

codebaseOwnership:
  owns:
    repo:
      - components/s-menu/**
      - nazare.registry.yml s-menu metadata
      - test/ registry component validation for s-menu

  mustNotModify:
    - theme/default/ scaffold source content
    - bin/nazare.js command behavior
    - install metadata
    - existing component source files
---

# Menu Section (Header)

## Goal

Add an installable Shopify header section with a sticky nav bar and multi-tab mega menu dropdowns.

The section handles the full header surface: logo, primary navigation, search, account and cart links. Nav items that have configured mega_tab blocks open a full-width dropdown panel with tabbed product grids and an optional editorial card. Nav items without blocks render as plain links.

---

## Scope

Included:

- `components/s-menu/s-menu.liquid`
- `components/s-menu/s-menu.js`
- `nazare.registry.yml` component metadata for `s-menu`
- checksum validation coverage for committed component source files
- smoke coverage that `nazare add s-menu` installs the section and JS from the local registry

### Section settings

| Setting | Type | Default | Notes |
|---|---|---|---|
| `logo` | image_picker | — | Falls back to shop.name text |
| `logo_width` | range 80–240 step 4 | 160 | Applied as max-width in px |
| `logo_alt` | text | shop.name | Image alt text |
| `main_menu` | link_list | main-menu | Top-level nav links |
| `mega_slot_1_title` | text | — | Title of the nav link that opens mega panel 1 (e.g. `Shop`) |
| `mega_slot_2_title` | text | — | Title of the nav link that opens mega panel 2 (e.g. `Shop By Need`) |
| `mega_slot_3_title` | text | — | Title of the nav link that opens mega panel 3 |

Slot matching uses `handleize` on both the setting value and the nav link title, so case and spacing variations ("shop by need" vs "Shop By Need") all resolve to the same handle.

### Block type: `mega_tab`

One block = one tab within a mega panel. Merchant orders blocks to control tab order within each slot.

| Setting | Type | Notes |
|---|---|---|
| `nav_slot` | select 1/2/3 | Which mega panel this tab belongs to. Matches `mega_slot_N_title`. |
| `tab_label` | text | Tab pill label (e.g. `Bestsellers`, `Acid Reflux & Heartburn`) |
| `product_1` | product | Product card slot 1 |
| `product_2` | product | Product card slot 2 |
| `product_3` | product | Product card slot 3 |
| `product_4` | product | Product card slot 4; ignored when `editorial_image` is set |
| `editorial_image` | image_picker | When set, renders as the 4th column instead of product_4 |
| `editorial_eyebrow` | text | Small label above the editorial heading (e.g. `Acid Reflux · 3 min read`) |
| `editorial_heading` | text | Large headline overlaid on the editorial image |
| `editorial_url` | url | Editorial card link destination |
| `cta_label` | text | CTA button label below the product grid (e.g. `Shop Acid Reflux`) |
| `cta_url` | url | CTA button destination |

### Layout contract

**Header bar** (`grid grid-cols-3 h-15`):
- Left column: nav links from `main_menu` linklist. Items with matching mega_tab blocks → `<button data-menu-trigger>`. Items without → `<a>`.
- Center column: logo image or shop name text, centered, links to `/`.
- Right column: search icon button, Account link (`/account`), Cart link (`/cart`), right-aligned.

**Mega panels** (one per nav slot, `position: absolute top-full left-0 right-0`):
- Hidden by default. JS shows on trigger hover (100 ms debounce) or click.
- Tab pills row: one pill per block in the slot. First pill active by default.
- Tab content area: 4-column product grid.
  - Columns 1–3: product cards rendered inline with title + price on the same row and one-line description below. Strikethrough compare price + blue sale price when `compare_at_price > price`.
  - Column 4: editorial card (image with eyebrow + heading overlay) when `editorial_image` is set; `product_4` card otherwise.
- CTA button (`c-button`, scheme `outline`) centered below the grid, renders only when `cta_label` and `cta_url` are both set.

### JavaScript behavior (`s-menu.js`, exports `init` / `destroy`)

Attaches via `data-nazare-use="sections/s-menu"` on the `<header>` element.

- **Hover open**: mouseenter on a trigger → open panel after 100 ms. mouseleave on header → close after 150 ms. Re-entering cancels the close timer.
- **Click toggle**: click trigger → open if closed, close if open.
- **Tab switch**: click tab pill → deactivate all pills for that slot, hide all panels for that slot, activate clicked pill and show its panel.
- **Escape**: close all panels.
- **Outside click**: `document` click outside the header → close all panels.
- `destroy` removes all listeners and cancels pending timers.

### Component metadata (registry)

```yaml
s-menu:
  version: 1.0.0
  type: section
  dependencies:
    - c-button
  files:
    - from: components/s-menu/s-menu.liquid
      to: sections/s-menu.liquid
      checksum:
        algorithm: sha256
        value: ""
    - from: components/s-menu/s-menu.js
      to: scripts/sections/s-menu.js
      checksum:
        algorithm: sha256
        value: ""
```

---

## Success behavior

- `nazare list` shows `s-menu` as available after registry update.
- `nazare add s-menu` installs `sections/s-menu.liquid`, `scripts/sections/s-menu.js`, and transitively installs `c-button`.
- Header is sticky at the top of the viewport.
- Logo image renders at configured width; falls back to shop.name text when blank.
- Nav links without mega_tab blocks render as plain anchor links.
- Nav links with at least one matching mega_tab block render as buttons.
- Slot matching is case/space insensitive: `"shop by need"` matches a nav link titled `"Shop By Need"`.
- Hovering a trigger opens the corresponding panel after ~100 ms.
- Moving the cursor off the header closes the panel after ~150 ms.
- Moving cursor from one trigger to another switches panels without flicker.
- Clicking a trigger opens the panel; clicking again closes it.
- Pressing Escape closes any open panel.
- Clicking outside the header closes any open panel.
- Clicking a tab pill activates it (underlined) and shows its content; other tabs in the same slot become inactive.
- First tab in each slot is active by default when its panel opens.
- Product cards render with title and price on the same line.
- `compare_at_price > price` renders strikethrough compare price and blue sale price.
- Editorial card renders in column 4 when `editorial_image` is set on the block.
- `product_4` renders in column 4 when `editorial_image` is blank.
- CTA button renders below the grid when both `cta_label` and `cta_url` are set.
- CTA absent when either `cta_label` or `cta_url` is blank.
- Component source checksums match registry metadata.

---

## Failure behavior

- Blank `mega_slot_N_title` settings do not accidentally activate any nav link as a trigger.
- Nav links with no matching blocks render as plain links without errors.
- Blocks with a `nav_slot` value that doesn't match any configured slot title are silently skipped (panel div is never opened).
- Empty product slots render nothing without broken markup or empty grid columns.
- Missing `editorial_image` falls back to `product_4` without broken markup.
- Missing both `editorial_image` and `product_4` leaves column 4 empty without layout breakage.
- Invalid registry metadata or checksum mismatch fails existing component validation tests.

---

## Verification

- [ ] component source files exist at registry paths
- [ ] registry contains `s-menu` metadata with c-button dependency
- [ ] registry checksums match component source bytes
- [ ] component metadata validates with registry parser
- [ ] `nazare add s-menu` smoke installs both files and c-button
- [ ] header is sticky at top of viewport on scroll
- [ ] logo image renders at configured max-width
- [ ] logo falls back to shop.name text when image is blank
- [ ] nav link without matching blocks renders as `<a>`
- [ ] nav link with matching blocks renders as `<button data-menu-trigger>`
- [ ] slot matching succeeds with mismatched casing in section setting
- [ ] hovering trigger opens panel after ~100 ms debounce
- [ ] cursor leaving header closes panel after ~150 ms
- [ ] cursor re-entering header cancels the close timer
- [ ] clicking trigger opens panel; clicking again closes it
- [ ] Escape closes open panel
- [ ] outside click closes open panel
- [ ] clicking tab pill activates it and shows its content
- [ ] other tabs in the slot become inactive on tab switch
- [ ] first tab in slot is active when panel first opens
- [ ] product title and price render on the same row
- [ ] sale price renders blue with strikethrough compare price
- [ ] editorial card renders in column 4 when editorial_image is set
- [ ] product_4 renders in column 4 when editorial_image is blank
- [ ] column 4 is empty without layout breakage when both are blank
- [ ] CTA renders when both cta_label and cta_url are set
- [ ] CTA absent when either is blank
- [ ] `destroy` removes all document-level event listeners

---

## Architecture notes

**Slot-based mega panel connection** — the section defines up to 3 named slots via section settings (`mega_slot_1_title`, etc.). Blocks reference slots by number (1/2/3) via a select, so the merchant types the nav link title once (in section settings) rather than in every block. If the nav item is renamed, only one setting needs updating. Matching uses `handleize` on both sides to absorb case/spacing differences.

**Two-pass Liquid rendering** — the nav bar and the mega panels are rendered in two separate loops over `linklists[main_menu].links`. The first pass builds the nav bar (checking whether each link has matching blocks). The second pass renders the hidden panel divs. Within each panel, blocks are iterated twice more: once for tab pill buttons, once for tab content panels. This is the same double-pass pattern established in `s-editorial.liquid`.

**Inline product cards** — mega panel product cards are rendered inline rather than via `c-product-card` because the layout contract differs (title + price on same row, no add-to-cart, no swatches, no ratings). Adding a `layout: compact` mode to `c-product-card` is a natural future extension but is out of scope here.

**JS module pattern** — `s-menu.js` follows the `init(root)` / `destroy(root)` export contract used by all nazare JS modules. It attaches via `data-nazare-use="sections/s-menu"` on the `<header>` element and is loaded by the theme's dynamic module loader. All document-level listeners (`keydown`, `click`) are tracked in the mount map and removed on `destroy`.
