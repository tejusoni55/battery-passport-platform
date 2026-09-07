const tseslint = require('typescript-eslint')

module.exports = [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '.code-review-graph/**'],
  },
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'prefer-const': 'error',
      eqeqeq: 'error',
      'no-empty': 'error',
      'no-console': ['warn', { allow: ['log', 'warn', 'error'] }],
    },
  },
]
