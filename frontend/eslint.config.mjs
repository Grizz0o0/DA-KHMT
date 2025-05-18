import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import tanstackQueryPlugin from '@tanstack/eslint-plugin-query';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    // Next.js
    ...compat.extends('next/core-web-vitals', 'next/typescript'),

    // TanStack Query ESLint Plugin
    {
        files: ['**/*.ts', '**/*.tsx'],
        plugins: {
            '@tanstack/query': tanstackQueryPlugin,
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
            ...tanstackQueryPlugin.configs.recommended.rules,
        },
    },
];

export default eslintConfig;
