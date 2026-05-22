# Nazare CLI Spec

## Purpose

Nazare CLI initiates and facilitates the relationship between a user theme repo and the Nazare registry source.

The CLI copies registry templates and components into the user repo. After copy, the user owns the files. The CLI tracks component origin and last added version, but build/runtime integration is derived from local theme files by the Nazare Vite plugin.

## Registry contents

Registry contains two main pieces:

- Registry template
  Minimal Liquid theme scaffold and required infrastructure to run, build, and extend theme
- Registry components
  Installable snippets, sections, scripts, assets, and other component files

## Actions

### CLI

- Check for CLI updates
- Update the CLI

### Template

- Initialize theme from registry template
- Compare local template files with upstream template
- Explicitly overwrite template files

Template files are user-owned after initialization. The CLI does not silently synchronize template files with upstream changes.

### Components

- List components available in registry
- Add component to theme
- List installed components
- Check for component updates
- Check component dependencies and install them in bulk
- Compare local component files with upstream component version
- Overwrite existing component files explicitly
- Validate component files for supported Nazare attributes

Supported Nazare attributes:

- `data-nazare-js-uses`
- `data-nazare-css-load`

## Component install model

Component install copies local source files into the theme.

Component files may include:

- `sections/*.liquid`
- `snippets/*.liquid`
- `scripts/sections/*.js`
- `scripts/snippets/*.js`
- `assets/*`
- docs/examples if present

After install, copied files are user-owned. Registry updates are not auto-reconciled with local edits.

If target file exists, CLI requires explicit choice:

- skip
- overwrite
- show diff

Default action is skip.

## Build boundary

CLI does not own build/runtime wiring.

CLI does not generate:

- `scripts/theme.js`
- `styles/<section-name>.css`
- `snippets/section-css.liquid`
- `snippets/section-css-preloads.liquid`
- lazy JS chunk mappings

These are owned by the Nazare Vite plugin and derived from local theme files.

## Ownership boundaries

CLI owns:

- repo initialization
- registry fetch
- component copy
- dependency resolution
- install manifest / lockfile
- last added component version
- explicit overwrite and diff flows

Nazare Vite plugin owns:

- scanning local Liquid files
- following static `{% render %}` references
- extracting `data-nazare-js-uses`
- extracting `data-nazare-css-load`
- generating CSS entries
- generating `section-css` Liquid bridge snippets
- producing lazy JS chunks

Theme/user owns:

- copied Liquid files
- copied JS files
- copied assets
- local modifications after install

## Manifest / lockfile role

CLI manifest or lockfile stores install history and registry origin.

It tracks:

- installed component name
- source registry component
- last added version
- copied file list
- dependencies installed by CLI

It does not define build graph truth. Build graph truth comes from local files and Nazare Vite plugin scanning.

## Commands

Suggested v1 commands:

```bash
nazare init [name]
nazare list
nazare add <component>[@version]
nazare diff <component>[@version]
nazare outdated
nazare installed
nazare self update
```

Aliases may exist for compatibility:

```bash
nazare pull <component>
nazare registry list
nazare registry pull <component>
```

## Non-goals

CLI does not provide automatic reconciliation of drifted user files.

CLI avoids words like:

- sync
- reconcile
- update safely
- merge upstream

Preferred words:

- add
- copy
- compare
- overwrite
