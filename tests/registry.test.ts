import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { FileSystemRegistry, validatePackage, type RegistryPackage } from "../src/index.js";

const tempDirs: string[] = [];
afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

function capability(version = "1.0.0"): RegistryPackage {
  const manifest = {
    kind: "capability",
    capability: "commerce.cart.upsell",
    intent: { title: "Cart upsell", description: "Offer additional products in the cart." },
    operations: {
      setProducts: {
        description: "Replace products offered by the upsell.",
        mutates: ["products"],
      },
    },
    bindings: [{ provider: "@nazare/provider-rebuy", adapter: "providers/rebuy.ts" }],
    verify: [{ verifier: "@nazare/verifier-dom", required: true }],
  };

  return {
    id: "@nazare/capability-cart-upsell",
    version,
    kind: "capability",
    dependencies: {
      "@nazare/provider-rebuy": "1.0.0",
      "@nazare/verifier-dom": "1.0.0",
    },
    manifest: "capability.json",
    files: {
      "capability.json": JSON.stringify(manifest),
      "providers/rebuy.ts": "export default {};",
    },
  };
}

describe("validatePackage", () => {
  it("accepts a capability package whose manifest matches its kind", () => {
    expect(validatePackage(capability())).toBeUndefined();
  });

  it("rejects mismatched package and manifest kinds", () => {
    const pkg = capability();
    pkg.kind = "provider";
    expect(validatePackage(pkg)).toContain("does not match");
  });
});

describe("FileSystemRegistry", () => {
  it("publishes immutable versions and resolves latest semantically", async () => {
    const root = await mkdtemp(join(tmpdir(), "nazare-registry-"));
    tempDirs.push(root);
    const registry = new FileSystemRegistry(root);

    expect(await registry.publish(capability("1.2.0"))).toMatchObject({ ok: true });
    expect(await registry.publish(capability("1.10.0"))).toMatchObject({ ok: true });
    expect(await registry.publish(capability("1.2.0"))).toMatchObject({ ok: false, code: "VERSION_EXISTS" });

    const latest = await registry.fetchPackage("@nazare/capability-cart-upsell", "latest");
    expect(latest?.version).toBe("1.10.0");
  });
});
