import { defineConfig } from "tinacms";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `tina/config.ts: missing ${name}. Set it in .env (see .env.example) or your CI/Vercel environment.`,
    );
  }
  return value;
}

// Branch resolution per Tina's Vercel docs:
// https://tina.io/docs/integration/vercel-branches
// NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF is exposed to the browser so the admin
// UI on preview deploys points at the right branch.
const branch =
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||
  process.env.NEXT_PUBLIC_TINA_BRANCH ||
  "main";

export default defineConfig({
  branch,
  clientId: requireEnv("NEXT_PUBLIC_TINA_CLIENT_ID"),
  token: requireEnv("TINA_TOKEN"),

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  media: {
    tina: {
      // Empty root so the media manager can browse both /images/blog and
      // /ecosystem. Per-field uploadDir steers new uploads to the right folder.
      mediaRoot: "",
      publicFolder: "public",
    },
  },

  schema: {
    collections: [
      {
        name: "post",
        label: "Blog Posts",
        path: "content/blog",
        format: "md",
        ui: {
          filename: {
            slugify: (values) =>
              (values?.title || "")
                .toLowerCase()
                .replace(/['"]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, ""),
          },
        },
        fields: [
          {
            name: "title",
            label: "Title",
            type: "string",
            isTitle: true,
            required: true,
          },
          {
            name: "description",
            label: "Description",
            type: "string",
            ui: { component: "textarea" },
          },
          {
            name: "date",
            label: "Date",
            type: "datetime",
            required: true,
            ui: { dateFormat: "YYYY-MM-DD" },
          },
          {
            name: "author",
            label: "Author",
            type: "object",
            fields: [
              { name: "name", label: "Name", type: "string" },
              { name: "avatar", label: "Avatar URL", type: "string" },
            ],
          },
          {
            name: "category",
            label: "Category",
            type: "string",
            options: ["News", "Network", "Governance", "Ecosystem", "Community"],
          },
          {
            name: "tags",
            label: "Tags",
            type: "string",
            list: true,
          },
          {
            name: "image",
            label: "Hero Image",
            type: "image",
            uploadDir: () => "images/blog",
          },
          {
            name: "imageAlt",
            label: "Hero Image Alt Text",
            type: "string",
          },
          {
            name: "draft",
            label: "Draft",
            type: "boolean",
          },
          {
            name: "body",
            label: "Body",
            type: "rich-text",
            isBody: true,
          },
        ],
      },
      {
        name: "app",
        label: "Ecosystem Apps",
        path: "content/ecosystem",
        format: "md",
        ui: {
          filename: {
            slugify: (values) =>
              (values?.name || "")
                .toLowerCase()
                .replace(/['"]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, ""),
          },
        },
        fields: [
          {
            name: "name",
            label: "Name",
            type: "string",
            isTitle: true,
            required: true,
          },
          {
            name: "url",
            label: "URL",
            type: "string",
            required: true,
          },
          {
            name: "description",
            label: "Description",
            type: "string",
            ui: { component: "textarea" },
          },
          {
            name: "categories",
            label: "Categories",
            type: "string",
            list: true,
            options: [
              "AI Video",
              "API",
              "Agents",
              "Community",
              "Decentralized",
              "Generative",
              "Music",
              "Self-hosted",
              "Streaming",
            ],
          },
          {
            name: "logo",
            label: "Logo",
            type: "image",
            uploadDir: () => "ecosystem",
          },
          {
            name: "order",
            label: "Sort order",
            type: "number",
            description: "Lower numbers appear first on the listing page.",
          },
          {
            name: "madeBy",
            label: "Made by",
            type: "string",
          },
          { name: "twitter", label: "Twitter / X URL", type: "string" },
          { name: "github", label: "GitHub URL", type: "string" },
          { name: "contact", label: "Contact email or URL", type: "string" },
          { name: "docs", label: "Docs URL", type: "string" },
          { name: "support", label: "Support URL", type: "string" },
          { name: "terms", label: "Terms URL", type: "string" },
          { name: "privacy", label: "Privacy URL", type: "string" },
          {
            name: "body",
            label: "Body",
            type: "rich-text",
            isBody: true,
          },
        ],
      },
    ],
  },
});
