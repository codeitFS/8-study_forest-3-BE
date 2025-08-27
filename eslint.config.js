// ESLint Flat Config for Node + ESM
import js from "@eslint/js";
import globals from "globals";
import prettierPlugin from "eslint-plugin-prettier";

export default [
    js.configs.recommended,
    {
        files: ["**/*.js"],
        ignores: ["node_modules/**", "dist/**", "coverage/**"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
            },
        },
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            "prettier/prettier": "warn",
        },
    },
];
