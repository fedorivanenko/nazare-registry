# Nazare Registry

Component registry for Nazare Shopify themes.

Registry stores component source and metadata. Themes pull from this repo, then generate theme-local build entries and compiled Shopify assets.

## Contract

- Registry is source of truth for components.
- Theme config points to registry repo/ref/manifest.
- CLI resolves dependencies, copies source files, generates CSS entries, then theme build compiles assets.

## Files

```txt
nazare.registry.yml     # component manifest
sections/               # section Liquid source
snippets/               # snippet Liquid source
scripts/                # script source
```

No `assets/` here. Shopify `assets/` are compiled theme output.

No `styles/` here by default. Section CSS entry files are generated in theme from manifest `css.sources`.

## Manifest

Each component declares files it owns and optional dependencies.

```yaml
components:
  s-hero:
    kind: section
    dependencies:
      - core
      - c-button
      - c-video
    css:
      mode: generated
      entry: styles/s-hero.css
      output: assets/s-hero.css
      sources:
        - sections/s-hero.liquid
        - snippets/c-button.liquid
        - snippets/c-video.liquid
    files:
      - sections/s-hero.liquid
```

## Install flow

Expected CLI behavior:

1. Read theme `nazare.config.yml`.
2. Fetch `registry.repo` at `registry.ref`.
3. Read `registry.manifest`.
4. Resolve requested components plus dependencies.
5. Copy `files` into theme.
6. Generate `css.entry` files in theme for `css.mode: generated`.
7. Run theme build so Vite emits `css.output` into `assets/`.
8. Update theme lockfile.

## Components

Current components:

- `core`
- `c-button`
- `c-video`
- `c-marquee`
- `s-hero`
- `s-social-video-gallery`
