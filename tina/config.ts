import { defineConfig } from "tinacms";

const branch =
  process.env.NEXT_PUBLIC_TINA_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID!,
  token: process.env.TINA_TOKEN!,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  media: {
    tina: {
      mediaRoot: "images/blog",
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
    ],
  },
});
