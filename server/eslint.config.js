import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "modelo/prisma/**"]
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node, ...globals.jest }
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
    }
  }
];
