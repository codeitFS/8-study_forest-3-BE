import js from '@eslint/js';
import globals from 'globals';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

const baseDir = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: baseDir });

export default [
    {
        ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**'],
    },
    js.configs.recommended,
    ...compat.extends('airbnb-base'),
    ...compat.extends('prettier'),
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: { ...globals.node },
        },
        rules: {
            'no-console': 'warn',
            'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        },
    },
    {
        files: ['eslint.config.js'],
        rules: {
            'import/no-extraneous-dependencies': 'off',
        },
    },
];
