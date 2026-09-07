import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'artifacts/**', 'inputs/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['apps/web-client/*.js'], languageOptions: { globals: globals.browser } },
  {
    files: ['**/*.ts'],
    languageOptions: { globals: globals.node },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  }
);
