import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

// eslint-config-next 16 ships flat configs, so they are spread in directly.
// The FlatCompat shim it used to go through cannot serialise v16's config
// (its plugin objects are circular) and threw before linting anything.
const eslintConfig = [
  { ignores: [".next/", "node_modules/", "next-env.d.ts"] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  {
    rules: {
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];

export default eslintConfig;
