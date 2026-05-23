# 001 — Update Nazare CLI

Status: planned

## Goal

Let users update the local `nazare` CLI before running registry/theme actions.

## Scope

Provide a clear update path for the CLI package used by a theme repo.

## Behavior

### Success

User can update the CLI package from the registry source:

```sh
npm update nazare-registry
npx nazare --help
```

If installed from GitHub, user can reinstall the desired ref:

```sh
npm install github:fedorivanenko/nazare#main
npx nazare --help
```

For local registry development, user can relink:

```sh
npm link
nazare --help
```

### Failure

Update fails clearly when:

- package install fails
- updated package has no valid `bin.nazare`
- `bin/cli.js` is missing
- runtime Node.js version is unsupported

## Acceptance criteria

- Document CLI update command
- Document GitHub ref update command
- Document local development relink flow
- `nazare --help` works after update
- `npx nazare --help` works after update
- update docs mention expected Node.js version

## Related specs

- [`docs/cli.spec.md`](../docs/cli.spec.md)
