import type { RegistryPackage, RegistryPackageKind } from "./contracts.js";
import type { RegistryManifest } from "./manifests.js";

export const VERSION_PATTERN = /^[0-9]+\.[0-9]+\.[0-9]+$/;
export const PACKAGE_ID_PATTERN = /^@[a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9._-]*$/;

export function isSafeRelativePath(path: string): boolean {
  if (!path || path.includes("\0")) return false;
  if (path.startsWith("/") || /^[A-Za-z]:/.test(path)) return false;
  return path.split(/[\\/]/).every((segment) => segment && segment !== "." && segment !== "..");
}

export function validateManifest(manifest: RegistryManifest): string | undefined {
  if (!manifest || typeof manifest !== "object" || !("kind" in manifest)) return "manifest.kind is required";
  const intent = "intent" in manifest ? manifest.intent : undefined;
  if (!intent?.title || !intent?.description) return "manifest.intent title and description are required";
  if (manifest.kind === "capability") {
    if (!manifest.capability) return "capability identifier is required";
    if (!manifest.operations || Object.keys(manifest.operations).length === 0) return "capability operations must not be empty";
  }
  if (manifest.kind === "provider" && !manifest.provider) return "provider identifier is required";
  if (manifest.kind === "verifier" && (!manifest.verifier || !manifest.entrypoint)) return "verifier identifier and entrypoint are required";
  if (manifest.kind === "carcass" && !manifest.part) return "carcass part identifier is required";
  if (manifest.kind === "component" && !manifest.component) return "component identifier is required";
  return undefined;
}

export function validatePackage(pkg: RegistryPackage): string | undefined {
  if (!PACKAGE_ID_PATTERN.test(pkg.id)) return `invalid package id ${pkg.id}`;
  if (!VERSION_PATTERN.test(pkg.version)) return `invalid version ${pkg.version}`;
  if (!(["capability", "provider", "verifier", "carcass", "component"] satisfies RegistryPackageKind[]).includes(pkg.kind)) return `invalid package kind ${pkg.kind}`;

  for (const [id, version] of Object.entries(pkg.dependencies)) {
    if (!PACKAGE_ID_PATTERN.test(id)) return `invalid dependency id ${id}`;
    if (!VERSION_PATTERN.test(version)) return `invalid dependency version ${id}@${version}`;
  }

  if (Object.keys(pkg.files).length === 0) return "files must not be empty";
  for (const path of Object.keys(pkg.files)) if (!isSafeRelativePath(path)) return `unsafe file path ${path}`;

  if (pkg.manifest) {
    const source = pkg.files[pkg.manifest];
    if (!source) return `manifest file ${pkg.manifest} is missing`;
    try {
      const manifest = JSON.parse(source) as RegistryManifest;
      if (manifest.kind !== pkg.kind) return `manifest kind ${manifest.kind} does not match package kind ${pkg.kind}`;
      return validateManifest(manifest);
    } catch {
      return `manifest file ${pkg.manifest} is not valid JSON`;
    }
  }
  return undefined;
}
