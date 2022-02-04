module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  plugins: ['@typescript-eslint', 'import', 'jest', 'jsx-a11y', 'prettier', 'react', 'react-hooks'],
  extends: [
    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended',
    // This can be an expensive process and may need to removed or run separately for larger projects
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    // Make sure to keep all prettier extensions last to override any earlier settings
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      impliedStrict: true,
      jsx: true,
    },
    project: './tsconfig.json',
  },
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'no-plusplus': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
    'import/no-extraneous-dependencies': ['error', {devDependencies: ['webpack.config.*.ts']}],
    'react/jsx-props-no-spreading': 'off',
    'react/no-unused-prop-types': 'off',
    'react/require-default-props': 'off',
  },
  ignorePatterns: ['node_modules/', 'lib/'],
};
