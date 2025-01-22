module.exports = {
  root: true,
  env: { es2021: true },
  overrides: [
    // Backend (Node) override
    {
      files: ['backend/**/*.js'],
      env: { node: true },
      parserOptions: { sourceType: 'script' },
    },
    // Frontend (React) override
    {
      files: ['frontend/src/**/*.{js,jsx}'],
      env: { browser: true },
      extends: ['eslint:recommended', 'plugin:react/recommended'],}
  ],
};