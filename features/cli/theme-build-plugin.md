---
schemaVersion: 1

id: theme-build-plugin
title: Theme Build Plugin
status: in-progress

dependencies:
  - cli-install
  - cli-init
  - theme-scaffold

surfaces:
  storefront:
    - Nazare Vite plugin
    - generated theme runtime
    - generated CSS bridge snippets
    - generated section CSS entries
    - generated theme settings schema
    - generated layout/theme.liquid from layout/theme.source.liquid

invariants:
  - Plugin code is vendored into the theme scaffold and imported by relative path
  - Generated text files must follow docs/policies/generated-files-policy.md
  - Generated files must be trackable in user theme repos
  - Generated files must not be registry scaffold source
  - Generated files must not be listed in theme.files
  - Plugin must produce stable Shopify asset output names when used by theme-build-pipeline
  - Plugin must fail builds for invalid static graph inputs
  - Generated section CSS entries must import only `tailwindcss/utilities`, never `tailwindcss/theme` — theme variable declarations belong in `base.css` only
  - Plugin must isolate runtime component failures so one broken component does not block others
  - Plugin must pick up newly added section/snippet files in watch mode without restarting the build process
  - Plugin must pick up newly added config/*.settings.json files in watch mode without restarting the build process
  - settings_schema.json is fully generated and must never be hand-edited
  - layout/theme.liquid is fully generated from layout/theme.source.liquid and must never be hand-edited
  - nazare:layout directive is valid only in section files and multiple sections per position (header or footer) are allowed

nonGoals:
  - Implementing nazare theme pull
  - Implementing component install behavior
  - Choosing or bundling a JavaScript UI framework
  - Shipping generated files as scaffold source
  - Defining visual design system behavior
  - Replacing Vite or Tailwind

codebaseOwnership:
  owns:
    repo:
      - theme/default/nazare/vite-plugin.js
      - vendored Nazare Vite plugin support modules under theme/default/nazare/
      - generated runtime source template
      - generated CSS entry template
      - generated Liquid bridge snippet templates
      - generated settings schema template
      - test/ theme build plugin scanner/generator/runtime tests
      - docs/policies/generated-files-policy.md integration

  mustNotModify:
    - bin/nazare.js command behavior
    - component registry behavior
    - user theme files outside generated test fixtures
    - install metadata
    - config/theme.settings.json (hand-authored base, owned by theme-scaffold)
---

# Theme Build Plugin

## Goal

Implement the Nazare Vite plugin that turns local Shopify Liquid theme files into generated build inputs, runtime code, and Liquid bridge snippets used by the theme build pipeline.

The plugin is required by `theme-build-pipeline`. A theme using build pipeline hook points is not expected to build or render correctly without this plugin.

---

## Scope

Included:

- internal plugin module in this repo
- Vite plugin entrypoint export for use by scaffold `vite.config.js`
- Liquid section/snippet scanner
- static render graph traversal
- section CSS directive parser
- `data-nazare-use` scanner
- generated section CSS entry files
- generated runtime entry file
- generated CSS bridge snippets
- generated `config/settings_schema.json` from `config/theme.settings.json` + `config/*.settings.json`
- stale generated file cleanup
- stable output naming support with Vite config
- watch mode: directory watching on `sections/`, `snippets/`, and `config/` so new files trigger rebuild
- watch mode: Rollup input updated on every rebuild via `options` hook so new section CSS entries are compiled
- tests for scanner, generator, runtime template, settings schema generator, and generated-file markers

### Vendored plugin location

Plugin code should be vendored into the theme scaffold so pulled themes have no dependency on a published Nazare package or local CLI install path.

Initial expected shape:

```txt
theme/default/nazare/vite-plugin.js
```

If the plugin grows, support modules may live under `theme/default/nazare/`:

```txt
theme/default/nazare/vite-plugin.js
theme/default/nazare/scanner.js
theme/default/nazare/generator.js
theme/default/nazare/runtime-template.js
```

Scaffold `vite.config.js` should import the plugin by relative path:

```js
import { nazareThemePlugin } from "./nazare/vite-plugin.js";
```

Vendored plugin files are scaffold source and become user-owned after `nazare theme pull`. They are not generated files.

---

## Generated files

Generated files must follow [`docs/policies/generated-files-policy.md`](../docs/policies/generated-files-policy.md).

The plugin generates:

- `styles/<section-name>.css`
- `scripts/theme.js`
- `snippets/section-css.liquid`
- `snippets/section-css-preloads.liquid`
- `config/settings_schema.json`
- `config/settings_schema.json.nazare` marker sidecar
- `sections/header-group.json`
- `sections/header-group.json.nazare` marker sidecar
- `sections/footer-group.json`
- `sections/footer-group.json.nazare` marker sidecar
- `layout/theme.liquid`

Each generated text file must include a generated marker near the top containing:

- `Generated by Nazare`
- `Do not edit directly`

Generated files are not registry scaffold source and must not be listed in `theme.files`.

Generated files should be git tracked by default in user theme repos.

---

## Scanner behavior

For each `sections/*.liquid` file, the plugin:

1. reads section source
2. extracts section CSS mode from `{% comment %} nazare:css <mode> {% endcomment %}` if present
3. defaults missing section CSS mode to `normal`
4. extracts layout position from `{% comment %}nazare:layout <position>{% endcomment %}` if present
5. extracts all `data-nazare-use` module keys from the section file
6. extracts static `{% render 'snippet-name' %}` and `{% render "snippet-name" %}` references
7. recursively scans referenced snippets in `snippets/<snippet-name>.liquid`
8. extracts `data-nazare-use` module keys from referenced snippets
9. adds section file and static snippet dependencies as Tailwind scan sources for that section CSS entry
10. detects missing snippets and render cycles
11. warns on dynamic render usage that cannot be followed

## CSS directive rules

Supported directives:

```liquid
{% comment %} nazare:css normal {% endcomment %}
{% comment %} nazare:css preload {% endcomment %}
```

Rules:

- directive is valid only in `sections/*.liquid`
- one directive maximum per section file
- directive must appear before first rendered output
- invalid values are build errors
- missing directive means `normal`

## JavaScript mount rules

Supported mount attribute:

```html
<div data-nazare-use="sections/s-hero"></div>
<div data-nazare-use="snippets/c-video"></div>
<div data-nazare-use="behaviors/scroll-snap"></div>
```

Rules:

- one DOM node uses exactly one module key
- value must be non-empty
- value must not contain whitespace or comma-separated lists
- value must start with `sections/`, `snippets/`, or `behaviors/`
- value must not start with `/`
- value must not end with `.js`
- value must not contain `..`
- matching source module must exist at `scripts/<module-key>.js`

If one UI area needs multiple behaviors, use nested/wrapper nodes or compose those behaviors behind one module key.

## Generated CSS entries

For section `s-hero`, generated `styles/s-hero.css` should look like:

```css
/* Generated by Nazare. Do not edit directly. */
@import "tailwindcss/utilities" source(none);

@source "../sections/s-hero.liquid";
@source "../snippets/c-button.liquid";
```

`tailwindcss/theme` must not be imported in section CSS entries. It emits unlayered `:root`/`:host` variable declarations that override the same declarations from `base.css` whenever the section stylesheet loads after it — resetting design tokens like `--text-base` back to Tailwind defaults. Theme variable declarations belong exclusively in `base.css`.

## Layout directive rules

Supported directive:

```liquid
{% comment %}nazare:layout header{% endcomment %}
{% comment %}nazare:layout footer{% endcomment %}
```

Rules:

- directive is valid only in `sections/*.liquid`
- one directive maximum per section file
- directive must appear before first rendered output
- multiple sections may declare the same layout position (`header` or `footer`)
- matching sections are written into Shopify section groups (`sections/header-group.json` or `sections/footer-group.json`) so merchants can reorder them in Shopify admin
- initial order follows sorted section filename order; existing section group `order` is preserved when present
- invalid values are build errors
- missing directive means the section is not a layout section

When `layout/theme.source.liquid` is present, the plugin reads it and replaces each `{%- comment -%}nazare:layout <position>{%- endcomment -%}` placeholder with the matching Shopify section group tag (`{% sections 'header-group' %}` or `{% sections 'footer-group' %}`). The result is written to `layout/theme.liquid` with a generated-file marker prepended.

## Generated layout

`layout/theme.liquid` is generated from `layout/theme.source.liquid`.

`layout/theme.source.liquid` uses comment placeholders to mark injection points:

```liquid
<body>
  {%- comment -%}nazare:layout header{%- endcomment -%}
  {{ content_for_layout }}
  {%- comment -%}nazare:layout footer{%- endcomment -%}
  <script type="module" src="{{ 'theme.js' | asset_url }}"></script>
</body>
```

With layout groups enabled, the generated `layout/theme.liquid` body becomes:

```liquid
<body>
  {% sections 'header-group' %}
  {{ content_for_layout }}
  {% sections 'footer-group' %}
  <script type="module" src="{{ 'theme.js' | asset_url }}"></script>
</body>
```

The plugin also writes Shopify section group JSON files:

```json
{
  "type": "header",
  "name": "Header group",
  "sections": {
    "s-announcement": { "type": "s-announcement", "settings": {} },
    "s-menu": { "type": "s-menu", "settings": {} }
  },
  "order": ["s-announcement", "s-menu"]
}
```

If `sections/header-group.json` or `sections/footer-group.json` already exists, the plugin preserves existing `order` and section settings for matching section types, appending newly installed layout sections at the end.

## Generated settings schema

`config/settings_schema.json` is generated by merging:

1. `config/theme.settings.json` — hand-authored base; defines theme-level settings groups (colors, typography, layout). Read first. If absent, treated as an empty array.
2. `config/*.settings.json` — component-contributed settings files installed by the CLI (e.g. `c-social-links.settings.json`). Read in alphabetical order after the base.

`config/settings_schema.json` is explicitly excluded from the input scan so the plugin never reads its own output.

Each `*.settings.json` file contains a Shopify settings group object or array of group objects:

```json
{
  "name": "Social icons",
  "settings": [
    { "type": "image_picker", "id": "social_icon_instagram", "label": "Instagram icon" }
  ]
}
```

The generated `settings_schema.json` is a JSON array of all merged groups:

```json
[
  { "name": "Social icons", "settings": [ ... ] },
  { "name": "Email", "settings": [ ... ] }
]
```

Because Shopify's `settings_schema.json` is JSON, it cannot safely contain comments or a root ownership object. Instead, a marker comment file `config/settings_schema.json.nazare` is written alongside it to signal ownership.

Rules:
- `config/settings_schema.json` must never be hand-edited
- `config/settings_schema.json` must not be listed in `theme.files`
- `config/theme.settings.json` is scaffold source and is listed in `theme.files`
- Component `*.settings.json` files are installed by CLI and are listed in `theme.files` for their respective components
- Shopify rejects settings groups with empty `settings` arrays — the plugin must error if any merged group has `settings: []`

## Generated Liquid bridge snippets

`snippets/section-css.liquid` maps normal CSS sections to stylesheet tags:

```liquid
{% comment %}
  Generated by Nazare. Do not edit directly.
{% endcomment %}

{% case section_name %}
  {% when 's-main' %}
    {{ 's-main.css' | asset_url | stylesheet_tag }}
{% endcase %}
```

`snippets/section-css-preloads.liquid` emits preload stylesheet tags:

```liquid
{% comment %}
  Generated by Nazare. Do not edit directly.
{% endcomment %}

{{ 's-hero.css' | asset_url | stylesheet_tag: preload: true }}
```

## Generated runtime

`scripts/theme.js` is generated and builds to `assets/theme.js`.

The generated runtime must:

- include generated-file marker
- scan for `[data-nazare-use]`
- lazy-load matching modules with Vite `import.meta.glob`
- call `init(node)` once per DOM node and module key
- call optional `destroy(node)` during cleanup
- isolate import, init, and destroy failures
- handle Shopify theme editor load/unload events

Component modules are source files and are not generated by this plugin.

## Stable Vite output naming

When used by `theme-build-pipeline`, output names must be stable:

- `styles/<section-name>.css` -> `assets/<section-name>.css`
- `scripts/theme.js` -> `assets/theme.js`
- `scripts/sections/<section-name>.js` -> `assets/sections--<section-name>.js`
- `scripts/snippets/<snippet-name>.js` -> `assets/snippets--<snippet-name>.js`
- `scripts/behaviors/<behavior-name>.js` -> `assets/behaviors--<behavior-name>.js`

No content hashes in v1 output names.

---

## Success behavior

- plugin scans sections and static snippet dependencies
- plugin generates section CSS entries with Tailwind sources
- plugin generates runtime entry with lazy module loading
- plugin generates normal and preload CSS bridge snippets
- plugin generates `config/settings_schema.json` from `config/theme.settings.json` + `config/*.settings.json`
- plugin generates `layout/theme.liquid` from `layout/theme.source.liquid` by injecting Shopify section group tags at placeholder positions
- plugin generates `sections/header-group.json` and `sections/footer-group.json`, preserving existing admin order and section settings when present
- plugin validates CSS directives, layout directives, and JS module keys
- plugin reports missing snippets, render cycles, and missing JS modules as build errors
- plugin warns on dynamic renders that cannot be followed
- plugin cleans stale generated files
- all generated text files include generated markers
- in watch mode, adding a new section, snippet, or config settings file triggers a rebuild without restarting
- in watch mode, the new section's CSS entry is included in the next build's Rollup input
- in watch mode, editing layout/theme.source.liquid triggers a rebuild

## Failure behavior

- invalid CSS directive fails build
- duplicate CSS directive fails build
- CSS directive after rendered output fails build
- directive in snippet file fails build
- invalid layout directive value fails build
- duplicate layout directive in a single section fails build
- layout directive after rendered output fails build
- layout directive in snippet file fails build
- missing static snippet fails build
- static render cycle fails build
- invalid `data-nazare-use` value fails build
- missing source JS module for `data-nazare-use` fails build
- settings group with empty `settings` array fails build
- inability to write generated files fails build
- generated text file without required marker fails tests

---

## Verification

Result: implementation present; final feature-doc checklist still needs reconciliation.

- [ ] scans section with no snippets
- [ ] scans section with static snippet dependency
- [ ] scans nested static snippet dependencies
- [ ] warns on dynamic render
- [ ] errors on missing snippet
- [ ] errors on render cycle
- [ ] parses missing CSS directive as `normal`
- [ ] parses `nazare:css preload`
- [ ] errors on duplicate CSS directive
- [ ] errors on invalid CSS directive value
- [ ] errors on CSS directive in snippet file
- [ ] errors on CSS directive after rendered output
- [ ] extracts valid `data-nazare-use` module keys
- [ ] errors when one `data-nazare-use` value contains multiple module keys
- [ ] errors on invalid module keys
- [ ] errors on missing JS modules
- [ ] generates `styles/<section-name>.css` with marker and Tailwind sources
- [x] generates `scripts/theme.js` with marker and runtime behavior
  - Covered by `test/theme-build-plugin.test.js` for generated runtime shape.
  - Covered by `test/theme-runtime.test.js` for runtime initialization, one-time module loading, Shopify section load/unload, destroy cleanup, and failure isolation without Playwright.
- [ ] generates `snippets/section-css.liquid` with marker
- [ ] generates `snippets/section-css-preloads.liquid` with marker
- [ ] generates `config/settings_schema.json` from theme.settings.json + *.settings.json
- [ ] merges theme.settings.json first, then component files alphabetically
- [ ] treats missing theme.settings.json as empty base (no error)
- [ ] errors on settings group with empty settings array
- [ ] excludes settings_schema.json from input scan
- [ ] in watch mode, adding a new config/*.settings.json triggers a rebuild
- [ ] parses missing layout directive as no layout position (section is not a layout section)
- [ ] parses nazare:layout header and nazare:layout footer
- [ ] errors on invalid layout directive value
- [ ] errors on duplicate layout directive in a section
- [ ] errors on layout directive in snippet file
- [ ] errors on layout directive after rendered output
- [ ] allows multiple sections to declare the same layout position
- [ ] generates layout/theme.liquid with generated marker from theme.source.liquid
- [ ] injects {% sections 'header-group' %} and {% sections 'footer-group' %} at header/footer placeholder positions
- [ ] generates sections/header-group.json and sections/footer-group.json
- [ ] preserves existing section group order and settings when regenerating
- [ ] in watch mode, editing layout/theme.source.liquid triggers a rebuild
- [ ] cleans stale generated files
- [ ] preserves stable Vite output naming contract
- [ ] in watch mode, adding a new section file triggers a rebuild
- [ ] in watch mode, the new section's CSS is compiled in the next build

---

## Architecture notes

The plugin is vendored scaffold source first. A public package/export boundary can be introduced later if external registry/theme consumption needs it.

Vendoring avoids external runtime/build dependencies on the Nazare CLI package, npm publication, or machine-specific install paths.

The plugin owns generated source/intermediate files. Vite owns final bundling into `assets/`.

The plugin should be deterministic: same input files produce same generated files.

The plugin should write generated files before Vite resolves build inputs.

In watch mode, the `options` hook (called by Rollup before every rebuild) regenerates theme files and updates the Rollup input so new sections are compiled without a process restart. The `buildStart` hook watches the `sections/`, `snippets/`, `config/`, and `layout/` directories so file additions trigger the next rebuild, and individual liquid, section group JSON, and settings files so edits trigger rebuilds.

Settings schema generation reads `config/theme.settings.json` as the manual base, then all `config/*.settings.json` files alphabetically. `config/settings_schema.json` is explicitly excluded from the scan by filename. Because JSON does not support comments, the generated-file marker for `settings_schema.json` is written to a sidecar comment file `config/settings_schema.json.nazare`.

Section group generation writes `sections/header-group.json` and `sections/footer-group.json` from sections declaring `nazare:layout header` or `nazare:layout footer`. Existing group files are treated as admin state: matching section instances keep their current settings and relative order, while newly installed layout sections append after existing entries. Generated-file markers are written to `.nazare` sidecar files because Shopify section group JSON cannot safely contain comments.

Generated file cleanup must only remove files known to be generated by Nazare and carrying the required generated-file marker.

Section CSS entries import only `tailwindcss/utilities`, not `tailwindcss/theme`. Importing `tailwindcss/theme` in a section CSS file causes Tailwind to emit unlayered `:root`/`:host` variable declarations (e.g. `--text-base: 1rem`) into the compiled section stylesheet. Because section stylesheets load after `base.css` in the browser, those declarations win the cascade and silently reset design tokens to Tailwind defaults. `tailwindcss/theme` is imported once, in `base.css` only.

---

## Open questions

None.
