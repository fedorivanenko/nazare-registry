export type JsonSchema = Record<string, unknown>;

export type Intent = {
  title: string;
  description: string;
  aliases?: string[];
};

export type OperationDefinition = {
  description: string;
  input?: JsonSchema;
  output?: JsonSchema;
  mutates?: string[];
  requires?: string[];
};

export type Binding = {
  provider: string;
  adapter: string;
  requires?: string[];
};

export type Verification = {
  verifier: string;
  config?: Record<string, unknown>;
  required?: boolean;
};

export type CapabilityManifest = {
  kind: "capability";
  capability: string;
  intent: Intent;
  state?: JsonSchema;
  operations: Record<string, OperationDefinition>;
  bindings?: Binding[];
  invariants?: string[];
  verify?: Verification[];
};

export type ProviderManifest = {
  kind: "provider";
  provider: string;
  intent: Intent;
  surfaces: string[];
  observes?: Record<string, JsonSchema>;
  operations?: Record<string, OperationDefinition>;
};

export type VerifierManifest = {
  kind: "verifier";
  verifier: string;
  intent: Intent;
  accepts: string[];
  entrypoint: string;
};

export type CarcassManifest = {
  kind: "carcass";
  part: string;
  intent: Intent;
  slots?: Record<string, JsonSchema>;
  exposes?: string[];
};

export type ComponentManifest = {
  kind: "component";
  component: string;
  intent: Intent;
  props?: JsonSchema;
  entrypoint?: string;
};

export type RegistryManifest =
  | CapabilityManifest
  | ProviderManifest
  | VerifierManifest
  | CarcassManifest
  | ComponentManifest;
