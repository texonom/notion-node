module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  parserOptions: { parser: '@babel/eslint-parser', requireConfigFile: false },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:import/typescript',
    'plugin:import/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/typescript'
  ],
  settings: { react: { version: 'detect' } },
  env: { browser: true, node: true },
  rules: {
    '@typescript-eslint/no-non-null-assertion': 0,
    'react/prop-types': 0,

    // React
    'react-hooks/rules-of-hooks': 'off',
    'react/no-unknown-property': 'off',

    // Import Rules
    'import/no-cycle': ['warn', { maxDepth: Infinity }],
    'import/no-unresolved': 'off',
    'import/export': 'off',

    // TS Rules
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/method-signature-style': 'error',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/naming-convention': [
      'error',
      { selector: 'variableLike', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
      {
        selector: 'memberLike',
        format: ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'],
        filter: {
          regex: '/.*|@.*|[a-z|-|~|@].*',
          match: false
        }
      },
      { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE', 'snake_case'] },
      { selector: 'parameter', format: ['camelCase', 'PascalCase'], leadingUnderscore: 'allow' },
      { selector: 'typeLike', format: ['PascalCase'] }
    ],

    // Common Rules
    'no-self-assign': 'off',
    'no-constant-condition': 'off',
    'no-unused-vars': 'warn',
    curly: ['error', 'multi', 'consistent'],
    'no-console': ['error', { allow: ['warn', 'error', 'debug', 'info', 'groupCollapsed', 'groupEnd'] }]
  }
}
