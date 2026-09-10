import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { PackageMetadata, PublishResult, RegistryClient, RegistryPackage } from "./contracts.js";
import { validatePackage } from "./validation.js";

function encodeId(id: string): string {
  return id.replace(/^@/, "").replace("/", "__");
}

export class FileSystemRegistry implements RegistryClient {
  constructor(private readonly root: string) {}

  async fetchMetadata(id: string): Promise<PackageMetadata | undefined> {
    try {
      return JSON.parse(await readFile(join(this.root, encodeId(id), "metadata.json"), "utf8")) as PackageMetadata;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
      throw error;
    }
  }

  async fetchPackage(id: string, version: string): Promise<RegistryPackage | undefined> {
    const resolved = version === "latest" ? (await this.fetchMetadata(id))?.latest : version;
    if (!resolved) return undefined;
    try {
      return JSON.parse(await readFile(join(this.root, encodeId(id), `${resolved}.json`), "utf8")) as RegistryPackage;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
      throw error;
    }
  }

  async publish(pkg: RegistryPackage): Promise<PublishResult> {
    const validationError = validatePackage(pkg);
    if (validationError) return { ok: false, code: "MALFORMED_PACKAGE", message: validationError };
    if (await this.fetchPackage(pkg.id, pkg.version)) {
      return { ok: false, code: "VERSION_EXISTS", message: `${pkg.id}@${pkg.version} already exists` };
    }

    const dir = join(this.root, encodeId(pkg.id));
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, `${pkg.version}.json`), JSON.stringify(pkg, null, 2));

    const previous = await this.fetchMetadata(pkg.id);
    const versions = [...new Set([...(previous?.versions ?? []), pkg.version])].sort(compareVersions);
    const metadata: PackageMetadata = { id: pkg.id, kind: pkg.kind, latest: versions.at(-1)!, versions };
    await writeFile(join(dir, "metadata.json"), JSON.stringify(metadata, null, 2));
    return { ok: true, id: pkg.id, version: pkg.version };
  }
}

export class HttpRegistry implements RegistryClient {
  constructor(private readonly baseUrl: string) {}

  async fetchMetadata(id: string): Promise<PackageMetadata | undefined> {
    const response = await fetch(`${this.baseUrl}/packages/${encodeURIComponent(id)}`);
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error(`registry request failed: ${response.status}`);
    return response.json() as Promise<PackageMetadata>;
  }

  async fetchPackage(id: string, version: string): Promise<RegistryPackage | undefined> {
    const response = await fetch(`${this.baseUrl}/packages/${encodeURIComponent(id)}/${encodeURIComponent(version)}`);
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error(`registry request failed: ${response.status}`);
    return response.json() as Promise<RegistryPackage>;
  }

  async publish(pkg: RegistryPackage, token?: string): Promise<PublishResult> {
    const response = await fetch(`${this.baseUrl}/packages/${encodeURIComponent(pkg.id)}/${encodeURIComponent(pkg.version)}`, {
      method: "PUT",
      headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(pkg),
    });
    if (!response.ok && response.status >= 500) throw new Error(`registry request failed: ${response.status}`);
    return response.json() as Promise<PublishResult>;
  }
}

export function registryFromEnv(value = process.env.NAZARE_REGISTRY): RegistryClient {
  if (!value) throw new Error("NAZARE_REGISTRY is not configured");
  if (value.startsWith("file:")) return new FileSystemRegistry(value.slice("file:".length));
  return new HttpRegistry(value.replace(/\/$/, ""));
}

function compareVersions(a: string, b: string): number {
  const left = a.split(".").map(Number);
  const right = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (left[i] !== right[i]) return left[i]! - right[i]!;
  return 0;
}
