/**
 * Converts a Livepeer AI Runner OpenAPI spec into PlaygroundConfig objects
 * that the studio playground UI can render automatically.
 *
 * The AI runner container exposes its spec at /openapi.yaml (or .json).
 * Each POST endpoint (e.g. /text-to-image, /image-to-video) maps to one
 * pipeline card with auto-generated form fields.
 *
 * Usage:
 *   const spec = await fetchOpenAPISpec("https://dream-gateway.livepeer.cloud/openapi.json");
 *   const pipelines = parseOpenAPISpec(spec);
 *   // → [{ id: "text-to-image", name: "Text To Image", playgroundConfig: { fields: [...], outputType: "image" } }, ...]
 */

// ---------------------------------------------------------------------------
// Playground types (compatible with lib/studio/types.ts on feat/studio)
// ---------------------------------------------------------------------------

export type PlaygroundFieldType =
  | "text"
  | "textarea"
  | "number"
  | "range"
  | "file"
  | "select"
  | "boolean";

export type PlaygroundOutputType = "image" | "text" | "video" | "audio" | "json";

export interface PlaygroundField {
  name: string;
  label: string;
  type: PlaygroundFieldType;
  description?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

export interface PlaygroundConfig {
  fields: PlaygroundField[];
  outputType: PlaygroundOutputType;
}

// ---------------------------------------------------------------------------
// OpenAPI types (minimal subset needed for parsing)
// ---------------------------------------------------------------------------

export interface OpenAPISpec {
  openapi: string;
  info: { title: string; version: string; description?: string };
  servers?: Array<{ url: string; description?: string }>;
  paths: Record<string, OpenAPIPathItem>;
  components?: { schemas?: Record<string, JSONSchema> };
}

interface OpenAPIPathItem {
  post?: OpenAPIOperation;
}

interface OpenAPIOperation {
  summary?: string;
  description?: string;
  operationId?: string;
  requestBody?: {
    content: Record<string, { schema: JSONSchema }>;
    required?: boolean;
  };
  responses?: Record<string, {
    description?: string;
    content?: Record<string, { schema: JSONSchema }>;
  }>;
}

interface JSONSchema {
  $ref?: string;
  type?: string;
  format?: string;
  title?: string;
  description?: string;
  default?: unknown;
  enum?: string[];
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema;
  additionalProperties?: JSONSchema | boolean;
  minimum?: number;
  maximum?: number;
}

// ---------------------------------------------------------------------------
// Output: one entry per pipeline endpoint
// ---------------------------------------------------------------------------

export interface PipelineInfo {
  id: string;
  name: string;
  description: string;
  operationId?: string;
  playgroundConfig: PlaygroundConfig;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

const SKIP_PATHS = new Set(["/health", "/hardware/info", "/hardware/stats", "/version"]);

const HIDDEN_FIELDS = new Set([
  "model_id",
  "metadata",
  "gateway_request_id",
  "manifest_id",
  "stream_id",
]);

const TEXTAREA_FIELDS = new Set(["prompt", "negative_prompt", "text", "description"]);

const RANGE_FIELDS: Record<string, { min: number; max: number; step: number }> = {
  strength: { min: 0, max: 1, step: 0.05 },
  noise_aug_strength: { min: 0, max: 1, step: 0.01 },
  guidance_scale: { min: 0, max: 20, step: 0.5 },
  image_guidance_scale: { min: 0, max: 5, step: 0.1 },
};

const RESPONSE_SCHEMA_TO_OUTPUT: Record<string, PlaygroundOutputType> = {
  ImageResponse: "image",
  VideoResponse: "video",
  AudioResponse: "audio",
  TextResponse: "text",
  LLMResponse: "text",
  ImageToTextResponse: "text",
  MasksResponse: "json",
  LiveVideoToVideoResponse: "json",
};

function resolveRef(spec: OpenAPISpec, ref: string): JSONSchema {
  const parts = ref.replace("#/", "").split("/");
  let cur: unknown = spec;
  for (const p of parts) cur = (cur as Record<string, unknown>)?.[p];
  return (cur ?? {}) as JSONSchema;
}

function resolveSchema(spec: OpenAPISpec, schema: JSONSchema): JSONSchema {
  return schema.$ref ? resolveRef(spec, schema.$ref) : schema;
}

function inferFieldType(name: string, prop: JSONSchema): PlaygroundFieldType {
  if (prop.enum) return "select";
  if (prop.format === "binary") return "file";
  if (TEXTAREA_FIELDS.has(name)) return "textarea";
  if (name in RANGE_FIELDS) return "range";
  switch (prop.type) {
    case "boolean":
      return "boolean";
    case "integer":
    case "number":
      return "number";
    default:
      return "text";
  }
}

function toLabel(name: string, prop: JSONSchema): string {
  if (prop.title && prop.title !== "Model Id") return prop.title;
  return name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function propertyToField(
  name: string,
  prop: JSONSchema,
  isRequired: boolean,
): PlaygroundField | null {
  if (HIDDEN_FIELDS.has(name)) return null;
  if (prop.type === "object" || prop.type === "array") return null;
  if (prop.$ref) return null;

  const type = inferFieldType(name, prop);
  const field: PlaygroundField = {
    name,
    label: toLabel(name, prop),
    type,
    required: isRequired,
  };

  if (prop.description) field.description = prop.description;
  if (prop.default !== undefined && prop.default !== "" && prop.default !== "{}") {
    field.defaultValue = prop.default as string | number | boolean;
  }
  if (prop.enum) field.options = prop.enum;

  if (type === "range") {
    const range = RANGE_FIELDS[name];
    if (range) {
      field.min = range.min;
      field.max = range.max;
      field.step = range.step;
    } else {
      field.min = prop.minimum ?? 0;
      field.max = prop.maximum ?? 1;
      field.step = 0.01;
    }
  }

  return field;
}

function getOutputType(spec: OpenAPISpec, op: OpenAPIOperation): PlaygroundOutputType {
  const content = op.responses?.["200"]?.content?.["application/json"];
  if (!content?.schema) return "json";
  const ref = content.schema.$ref;
  if (ref) {
    const schemaName = ref.split("/").pop()!;
    return RESPONSE_SCHEMA_TO_OUTPUT[schemaName] ?? "json";
  }
  return "json";
}

export function parseOpenAPISpec(spec: OpenAPISpec): PipelineInfo[] {
  const pipelines: PipelineInfo[] = [];

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    if (SKIP_PATHS.has(path)) continue;
    const op = pathItem.post;
    if (!op?.requestBody?.content) continue;

    const contentType = Object.keys(op.requestBody.content)[0];
    const rawSchema = op.requestBody.content[contentType]?.schema;
    if (!rawSchema) continue;

    const schema = resolveSchema(spec, rawSchema);
    if (!schema.properties) continue;

    const requiredSet = new Set(schema.required ?? []);
    const fields: PlaygroundField[] = [];

    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const field = propertyToField(propName, propSchema, requiredSet.has(propName));
      if (field) fields.push(field);
    }

    // Required fields first, then alphabetical
    fields.sort((a, b) => {
      if (a.required && !b.required) return -1;
      if (!a.required && b.required) return 1;
      return a.name.localeCompare(b.name);
    });

    pipelines.push({
      id: path.replace(/^\//, ""),
      name: op.summary || path.replace(/^\//, "").replace(/-/g, " "),
      description: op.description || "",
      operationId: op.operationId,
      playgroundConfig: { fields, outputType: getOutputType(spec, op) },
    });
  }

  return pipelines;
}

export async function fetchAndParseSpec(url: string): Promise<PipelineInfo[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch OpenAPI spec: ${res.status} ${res.statusText}`);
  const spec: OpenAPISpec = await res.json();
  return parseOpenAPISpec(spec);
}
