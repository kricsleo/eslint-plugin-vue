/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "npm run update"
 */
/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: /** @type {any} */ (require('vue-eslint-parser')),
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    processor: require('../lib/processor')
  },
  {
    plugins: { vue: /** @type {any} */ (require('../lib/index')) },
    rules: {
      'vue/comment-directive': 'error',
      'vue/jsx-uses-vars': 'error'
    }
  }
]
