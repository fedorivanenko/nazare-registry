# Nazare Registry

Typed, immutable registry packages for Nazare capabilities and their supporting artifacts.

The registry deliberately separates **distribution** from **semantics**:

- `RegistryPackage` handles identity, versioning, dependencies, files, and transport.
- typed manifests describe what a package means to Nazare.
- registry clients stay generic; Shopify-specific reasoning belongs in capability/provider packages.

## Package kinds

`capability`, `provider`, `verifier`, `carcass`, and `component` all share the same immutable package envelope.

```ts
type RegistryPackage = {
  id: string;
  version: string;
  kind: "capability" | "provider" | "verifier" | "carcass" | "component";
  dependencies: Record<string, string>;
  files: Record<string, string>;
  manifest?: string;
};
```

A capability manifest describes durable business intent, observable/configurable state, allowed operations, implementation bindings, invariants, and executable verification.

```json
{
  "kind": "capability",
  "capability": "commerce.cart.upsell",
  "intent": {
    "title": "Cart upsell",
    "description": "Offer additional products to a shopper in the cart."
  },
  "operations": {
    "setProducts": {
      "description": "Replace the products offered by the cart upsell.",
      "mutates": ["products"]
    }
  },
  "bindings": [
    { "provider": "@nazare/provider-rebuy", "adapter": "providers/rebuy.ts" }
  ],
  "verify": [
    { "verifier": "@nazare/verifier-dom", "required": true }
  ]
}
```

See `examples/cart-upsell/capability.json` for a fuller example.

## Clients

```ts
import { FileSystemRegistry, HttpRegistry, registryFromEnv } from "@nazare/registry";

const local = new FileSystemRegistry(".nazare/registry");
const remote = new HttpRegistry("https://registry.nazare.engineering");
```

`registryFromEnv()` reads `NAZARE_REGISTRY`; `file:<dir>` selects the filesystem registry and HTTP(S) URLs select the HTTP client.

Published `(id, version)` pairs are immutable. `latest` resolves to the highest published semantic version.

## Direction

This package is the package/distribution layer for Nazare's machine-readable commercial ontology. Capability libraries, provider adapters, carcass definitions, and verifier families should build on top of this package instead of implementing separate registries.
