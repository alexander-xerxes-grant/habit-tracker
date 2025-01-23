module.exports = {
  root: true,
  env: {
    node: true, // ensure "module" etc. are recognized
    es2021: true,
  },
  parserOptions: { ecmaVersion: 'latest' },
  extends: [
    'eslint:recommended',
    // 'plugin:react/recommended',
    // 'plugin:react-hooks/recommended',
    'prettier',
  ],
  settings: {
    react: { version: '999.999.999' },
  },
  overrides: [
    // Node backend
    {
      files: ['backend/**/*.js'],
      env: { node: true },
      parserOptions: { sourceType: 'script' },
    },
    // React frontend
    {
      files: ['frontend/src/**/*.{js,jsx}'],
      env: { browser: true },
      parserOptions: {
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      rules: {
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
      },
    },
    // Tailwind config (Node)
    {
      files: ['frontend/tailwind.config.js'],
      env: { node: true },
    },
  ],
};
