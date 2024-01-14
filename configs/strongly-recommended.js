/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "npm run update"
 */
/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  ...require('./essential'),
  {
    rules: /** @type {any} */ (
      require('../lib/configs/vue3-strongly-recommended').rules
    )
  }
]
