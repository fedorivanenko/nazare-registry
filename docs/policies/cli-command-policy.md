# CLI Command Policy

Nazare commands should stay short, predictable, and unambiguous.

Use flat top-level verbs for registry component workflows:

- `nazare list`
- `nazare add <component>`
- `nazare update <component>`
- `nazare remove <component>`

Flat verbs operate on components by default.

Use namespaces for non-component lifecycle areas:

- `nazare theme <verb>` for scaffold/theme files
- `nazare self <verb>` for CLI install lifecycle

Rules:

- Keep global utility flags top-level: `nazare --help`, `nazare --version`.
- Keep theme behavior under `nazare theme`, even when names overlap with component verbs.
- Keep CLI self-update behavior under `nazare self`.
- Do not add `nazare component <verb>` unless flat verbs become ambiguous.
- Do not add bare `nazare update` until its scope is explicitly defined.
- Prefer required operands for destructive or broad operations.
- Do not add aliases by default; add them only for proven user friction.
