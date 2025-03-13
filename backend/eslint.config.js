// import typescript from '@typescript-eslint/eslint-plugin';
const typescriptParser = require('@typescript-eslint/parser');
// import typescriptParser from '@typescript-eslint/parser';
const typescript = require('@typescript-eslint/eslint-plugin');
const js = require('@eslint/js');
// import js from '@eslint/js';
// import globals from 'globals';
const globals = require('globals')

module.exports = [
  js.configs.recommended,
  {
    ignores: ['src/migrations/**/*.ts'],
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      ...typescript.configs['recommended'].rules,
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_'
      }]
    }
  }
];
