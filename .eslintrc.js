module.exports = {
    root: true,
    overrides: [
      // Frontend rules
      {
        files: ['frontend/**/*.{js,jsx}'],
        env: {
          browser: true
        },
        extends: [
          'eslint:recommended',
          'plugin:react/recommended',
          'prettier'
        ],
        settings: {
          react: {
            version: '19.0'
          }
        }
      },
      // Backend rules
      {
        files: ['backend/**/*.js'],
        env: {
          node: true
        },
        extends: [
          'eslint:recommended',
          'prettier'
        ]
      }
    ]
  };