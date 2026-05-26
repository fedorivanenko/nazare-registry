# Testing Policy

## Goals

Tests must be fast by default, deterministic, and proportional to the change risk. Expensive integration tests should not block unrelated bug fixes during local release work.

## Test tiers

### Targeted tests

Run targeted tests for the files or behavior changed.

Examples:

```sh
npx vitest run test/theme-update.test.js -t "preserves component lockfile metadata"
npx vitest run test/theme-pull.test.js -t "preserves component lockfile metadata"
```

Use targeted tests during implementation loops and for narrow bug fixes.

### Unit/CLI behavior tests

Run affected CLI behavior test files before PR or release when CLI code changes.

Examples:

```sh
npx vitest run test/component-add.test.js
npx vitest run test/theme-update.test.js
```

### Formatting and static checks

Use globally installed `biome` for changed code files.

Example:

```sh
biome check bin/nazare.js test/theme-update.test.js test/theme-pull.test.js
```

Markdown files may be ignored by Biome config; do not treat “No files were processed” for Markdown-only paths as a code-format failure.

### Slow integration tests

Tests that run real package installs, network access, generated production builds, or other environment-sensitive flows are slow integration tests.

Do not require slow integration tests for unrelated local bugfix release work. Run them when the changed paths can affect install/build behavior, including:

- `install.sh`
- `theme/default/package.json`
- `theme/default/vite.config.js`
- `theme/default/nazare/vite-plugin.js`
- build pipeline code
- package manager or dependency metadata

Slow integration tests should be isolated by filename, test name, script, or CI job so they can run manually or in release/nightly workflows without slowing normal PR validation.

## Release validation

For CLI bugfix releases, minimum local validation is:

```sh
biome check <changed-code-files>
npx vitest run <affected-test-files>
```

If the fix touches multiple CLI surfaces, run each affected test file. If it touches install/build behavior, also run the relevant slow integration test.

## CI expectations

PR CI should prefer fast deterministic checks:

- formatting/static checks for code paths
- affected CLI behavior tests
- targeted regression tests for the changed behavior

Slow integration tests should be optional, manual, scheduled, or path-gated unless the PR changes install/build-sensitive files.

## Regression tests

Every bug fix should add or update a regression test that fails without the fix when practical. Prefer the smallest deterministic test that covers the bug.

## Flaky or slow tests

When a test times out because of external work such as `npm install`, do not assume product failure. Record it as a slow integration timeout, run targeted regression coverage, and only block release if the changed code can affect that integration path.
