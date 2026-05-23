# Nazare Theme Config Spec

## Purpose

The theme config is a user-owned file stored in the theme repo.

It defines the relationship between the local theme and the Nazare registry origin.

It is used by the CLI to resolve where theme files and components should be pulled from.

It does not define build graph truth.

The Nazare Vite plugin does not use this file for build graph behavior.

## File name

`nazare.config.yml`

## Top-level schema

```yaml
schemaVersion: 1

registry:
  name: nazare
  repo: github.com/fedorivanenko/nazare
  ref: main
  manifest: nazare.registry.yml
```

## Top-level fields

### `schemaVersion`

Required integer.

Purpose:

- config format version
- CLI compatibility gate

CLI must fail on unsupported schema versions.

### `registry`

Required object.

```yaml
registry:
  name: nazare
  repo: github.com/fedorivanenko/nazare
  ref: main
  manifest: nazare.registry.yml
```

Fields:

- `name`: required string
- `repo`: required string identifying registry origin
- `ref`: required string for branch, tag, or commit used for resolution
- `manifest`: required string path to manifest inside registry repo

## Semantics

The theme config is source of truth for registry origin resolution in a local theme repo.

CLI resolves registry origin as snapshot of `registry.repo` at `registry.ref`, then reads `registry.manifest` from that snapshot.

CLI commands such as theme pull, component add, and outdated checks use that resolved snapshot for origin reads.

The lockfile records what was installed from that origin, but does not replace the config as the source of truth for future origin resolution.

## Init behavior

`nazare init` creates `nazare.config.yml`.

`init` does not enforce empty-directory rules. It only checks whether Nazare is already initialized at target location.

If `nazare.lock.yml` already exists at target location, `init` must fail.

Example initial file:

```yaml
schemaVersion: 1

registry:
  name: nazare
  repo: github.com/fedorivanenko/nazare
  ref: main
  manifest: nazare.registry.yml
```

`nazare init` also creates `nazare.lock.yml`, but does not pull theme files automatically.

## Validation rules

CLI must fail validation for:

- missing `schemaVersion`
- unsupported `schemaVersion`
- missing `registry`
- missing `registry.name`
- missing `registry.repo`
- missing `registry.ref`
- missing `registry.manifest`
- invalid field types

## Ownership boundary

Theme config ownership:

- created by CLI during `nazare init`
- read by CLI for origin resolution
- user-editable
- not read by Nazare Vite plugin for build graph decisions

Build graph ownership:

- local theme Liquid files
- local static `{% render %}` graph
- local `data-nazare-use`
- local `nazare:css` section directives
- Nazare Vite plugin scanner and generators
