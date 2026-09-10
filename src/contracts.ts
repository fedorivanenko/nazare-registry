export type RegistryPackageKind =
  | "capability"
  | "provider"
  | "verifier"
  | "carcass"
  | "component";

export type RegistryPackage = {
  id: string;
  version: string;
  kind: RegistryPackageKind;
  dependencies: Record<string, string>;
  files: Record<string, string>;
  manifest?: string;
};

export type PackageMetadata = {
  id: string;
  kind: RegistryPackageKind;
  latest: string;
  versions: string[];
};

export type RegistryErrorCode =
  | "PACKAGE_NOT_FOUND"
  | "VERSION_NOT_FOUND"
  | "VERSION_EXISTS"
  | "UNAUTHORIZED"
  | "MALFORMED_PACKAGE";

export type PublishResult =
  | { ok: true; id: string; version: string }
  | { ok: false; code: RegistryErrorCode; message: string };

export interface RegistryClient {
  fetchMetadata(id: string): Promise<PackageMetadata | undefined>;
  fetchPackage(id: string, version: string): Promise<RegistryPackage | undefined>;
  publish(pkg: RegistryPackage, token?: string): Promise<PublishResult>;
}
