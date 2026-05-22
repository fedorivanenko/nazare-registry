# Nazare Theme Spec

## Purpose

Minimal Shopify Liquid theme scaffold for Nazare registry components.

The theme is section-oriented. Each section is treated as a component with:

- a `.liquid` section file in `sections/`
- static Liquid snippet dependencies via `{% render 'snippet-name' %}`
- Tailwind utility classes in Liquid markup
- optional JS modules declared through `nazare-js-uses` directives

Minimal section example:

```liquid
{% comment %}
  nazare-css-load: preload
  nazare-js-uses: sections/s-hero
{% endcomment %}

<section class="px-6 py-12" data-nazare-section="s-hero">
  <h1 class="text-4xl font-bold">{{ section.settings.heading }}</h1>
  {% render 'c-button', label: section.settings.button_label %}
</section>
```

This example defines `sections/s-hero.liquid`, uses Tailwind utilities in markup, statically depends on `snippets/c-button.liquid`, declares `scripts/sections/s-hero.js` through `nazare-js-uses`, and declares the section CSS chunk load mode as `preload`.

### Build Time Behavior

Tailwind & Comment directives & `render` = build-time

This example outputs:
- CSS output: `assets/s-hero.css`, which includes Tailwind utilities used by `sections/s-hero.liquid` and its static snippet dependency `snippets/c-button.liquid`
- JS output: lazy-loaded section chunk `assets/s-hero.js`, referenced by global runtime `assets/theme.js`
- The Vite plugin generates `snippets/section-css.liquid` and `snippets/section-css-preloads.liquid` to bridge compiled section CSS chunks into Liquid runtime rendering.

To do this, the Nazare Vite plugin scans local `.liquid` files and follows static `{% render %}` references to discover component usage. It also extracts `nazare-js-uses` and `nazare-css-load` directives.

Caveat:
- dynamic render, for example `{% render snippet_name %}`, cannot be statically analyzed and is avoided in registry components

### Runtime Behavior

`data-nazare` is the runtime mount marker.

At runtime, `assets/theme.js` scans for `[data-nazare]`, lazy-loads the matching JS module once, and calls its `init(node)` export once for every matching section or snippet instance.

```js
const modulePromises = new Map();
const mounted = new WeakMap();

async function initNazare(root = document) {
  for (const node of root.querySelectorAll("[data-nazare]")) {
    const key = node.dataset.nazare;

    if (mounted.get(node) === key) continue;
    mounted.set(node, key);

    if (!modulePromises.has(key)) {
      modulePromises.set(key, importModule(key));
    }

    const module = await modulePromises.get(key);
    module.init?.(node);
  }
}
```

Component modules are singleton-loaded, but component state is per DOM node. Modules use scoped queries such as `node.querySelector(...)` and avoid shared mutable state unless intentional.
