---
schemaVersion: 1

id: dev-release-channels
title: Dev Release Channels
status: planned

dependencies:
  - cli-self-update
  - local-registry-dev-server
  - component-update
  - theme-update

surfaces:
  cli:
    - nazare self update latest [--dev]
    - nazare registry use latest [--dev]
    - nazare registry use --repo <repo> --ref <ref>
  devCli:
    - nazare-dev registry serve [--git-refs]

invariants:
  - packages/nazare/package.json.version remains the single CLI version source of truth
  - Stable releases use SemVer tags without prerelease identifiers
  - Dev releases use SemVer prerelease tags with the dev identifier
  - Stable update commands never select dev prerelease tags unless the user opts in
  - Dev channel selection must be explicit and reversible
  - Registry file updates keep existing checksum validation before mutation
  - Failed channel switches must not mutate unrelated user files

nonGoals:
  - Publishing to npm or another package registry
  - Automatic background updates
  - Updating Shopify theme files without an explicit command
  - Replacing SemVer with a custom version format
  - Supporting multiple named channels beyond stable and dev
  - Public network hardening for the local dev server

codebaseOwnership:
  owns:
    repo:
      - packages/nazare/bin/nazare.js self-update and registry source commands
      - packages/nazare-dev/bin/nazare-dev.js git-ref-aware file serving
      - docs/policies/release-policy.md
      - README.md update and local registry instructions
      - test/ CLI and dev CLI release-channel coverage
    install:
      - ~/.nazare install metadata
      - nazare.config.yml registry block when command runs in a consumer repo
      - nazare.lock.yml registry block when command runs in a consumer repo

  mustNotModify:
    - unrelated files under ~/.local/bin
    - unrelated files outside ~/.nazare
    - component or theme source content while only switching registry source
    - user theme files unless the user runs an update/pull command
    - component registry checksum semantics
---

# Dev Release Channels

## Goal

Let users move between stable and dev Nazare builds with one version source of truth.

Stable builds use normal SemVer tags, for example `v0.14.0`. Dev builds use SemVer prerelease tags, for example `v0.14.1-dev.3` or `v0.15.0-dev.0`. Users can opt into dev updates, then downgrade back to the latest stable tag without manually editing installed CLI or registry metadata.

---

## Scope

Included:

- release policy for stable and dev tags
- `nazare self update latest` continues to select the latest stable release/tag
- `nazare self update latest --dev` selects the latest dev prerelease tag
- `nazare registry use latest` switches a consumer repo to the latest stable registry tag
- `nazare registry use latest --dev` switches a consumer repo to the latest dev registry tag
- `nazare registry use --repo <repo> --ref <ref>` switches a consumer repo to an explicit registry source
- local dev server support for serving files from requested Git refs when enabled
- README examples for stable, dev, downgrade, and local-tag testing flows
- Vitest coverage for tag selection, config/lockfile mutation, and safe failure behavior

### Version contract

Allowed stable versions:

```text
0.14.0
14.1.0
```

Allowed dev versions:

```text
0.14.1-dev.0
0.14.1-dev.3
14.2.0-dev.12
```

Tag names must prefix the version with `v`:

```text
v0.14.0
v0.14.1-dev.3
```

`packages/nazare/package.json.version` remains the source for the CLI version embedded in an install. A dev tag must point to a commit whose package version exactly matches the tag without the leading `v`.

### Command contract

Stable CLI update:

```sh
nazare self update latest
```

Dev CLI update:

```sh
nazare self update latest --dev
```

Stable registry source:

```sh
nazare registry use latest
```

Dev registry source:

```sh
nazare registry use latest --dev
```

Explicit registry source:

```sh
nazare registry use --repo github.com/fedorivanenko/nazare --ref v0.14.0
nazare registry use --repo http://127.0.0.1:7331 --ref v0.14.1-dev.3
```

Apply registry file changes after a source switch with existing commands:

```sh
nazare update <component> --force
nazare theme update --yes
```

---

## Success behavior

- `nazare self update latest` resolves the newest stable `vMAJOR.MINOR.PATCH` tag and ignores tags containing prerelease identifiers.
- `nazare self update latest --dev` resolves the newest `vMAJOR.MINOR.PATCH-dev.N` tag.
- CLI update verifies the installed version after update matches the selected tag version.
- `nazare registry use latest` updates `nazare.config.yml` and `nazare.lock.yml` registry blocks to the latest stable tag.
- `nazare registry use latest --dev` updates `nazare.config.yml` and `nazare.lock.yml` registry blocks to the latest dev tag.
- `nazare registry use --repo <repo> --ref <ref>` updates only the registry block in config and lock files.
- Registry source switches do not install, update, delete, or overwrite component/theme files by themselves.
- After switching from dev to stable, existing `nazare update <component> --force` and `nazare theme update --yes` can restore files from the stable registry checksums.
- `nazare-dev registry serve --git-refs` serves `GET /raw/<path>?ref=<tag-or-commit>` from the requested Git ref when it exists locally.
- Local server keeps existing working-tree behavior when Git ref serving is not enabled.

---

## Failure behavior

- Invalid version strings or tags exit non-zero with a clear error.
- `latest` stable resolution exits non-zero when no stable tag exists.
- `latest --dev` exits non-zero when no dev prerelease tag exists.
- Tag/package version mismatch exits non-zero before installing or recording metadata.
- `nazare registry use ...` exits non-zero when `nazare.config.yml` or `nazare.lock.yml` is missing or invalid.
- Registry source switch failure must leave both config and lockfile unchanged.
- Local server `--git-refs` returns `404` for missing refs or paths and must not fall back to working tree content for that request.
- Local server rejects unsafe paths before invoking Git.

---

## Verification

Result: planned.

- [ ] Stable tag resolver ignores `v0.14.1-dev.3` when `v0.14.0` is the newest stable tag.
- [ ] Dev tag resolver selects the highest valid `*-dev.N` prerelease tag.
- [ ] `nazare self update latest` stores a stable resolved tag in install metadata.
- [ ] `nazare self update latest --dev` stores a dev resolved tag in install metadata.
- [ ] CLI update rejects a tag whose `packages/nazare/package.json.version` differs from the tag version.
- [ ] `nazare registry use latest` writes stable tag metadata to `nazare.config.yml` and `nazare.lock.yml`.
- [ ] `nazare registry use latest --dev` writes dev tag metadata to `nazare.config.yml` and `nazare.lock.yml`.
- [ ] `nazare registry use --repo <repo> --ref <ref>` mutates only registry blocks.
- [ ] Failed registry source switch leaves config and lockfile bytes unchanged.
- [ ] `nazare-dev registry serve --git-refs` serves manifest and source files from a local stable tag.
- [ ] `nazare-dev registry serve --git-refs` serves manifest and source files from a local dev tag.
- [ ] `nazare update <component> --force` can replace dev component files with stable-tag files after a stable source switch.
- [ ] README documents upgrade to dev and downgrade to stable flows.

---

## Architecture notes

Use SemVer prerelease syntax instead of custom version strings. `0.14.1-dev.3` is valid SemVer; `0.14-dev-3` is not.

Keep update channel selection separate from installed file mutation:

- CLI channel commands update the CLI install under `~/.nazare`.
- Registry source commands update `nazare.config.yml` and `nazare.lock.yml` registry metadata.
- Existing component/theme update commands apply registry file changes.

Tag resolution should use one helper that returns ordered stable or dev tags. Stable filtering must exclude any version with a prerelease segment. Dev filtering must require prerelease identifier `dev` and numeric prerelease counter.

For local dev server Git-ref reads, prefer `git show <ref>:<path>` from the registry root after validating that `<path>` is safe. Do not shell-concatenate user input. Use argument arrays. Preserve existing read-only server behavior.

Config and lockfile updates should be atomic: compute both new file contents first, then write. If either parse or validation step fails, write neither file.

---

## Open questions

- Should dev tag resolution select the latest dev tag globally, or only the latest dev tag for the current stable minor line?
- Should `nazare registry use latest --dev` default to GitHub tags or preserve the current `repo` value and only change `ref`?
