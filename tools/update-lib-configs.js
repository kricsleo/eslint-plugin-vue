/**
 * @author Toru Nagashima
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
'use strict'

/*
This script updates `lib/configs/*.js` files from rule's meta data.
*/

const fs = require('fs')
const path = require('path')
const { FlatESLint } = require('eslint/use-at-your-own-risk')
const categories = require('./lib/categories')

const errorCategories = new Set(['base', 'essential', 'vue3-essential'])

const extendsCategories = {
  base: null,
  essential: 'base',
  'vue3-essential': 'base',
  'strongly-recommended': 'essential',
  'vue3-strongly-recommended': 'vue3-essential',
  recommended: 'strongly-recommended',
  'vue3-recommended': 'vue3-strongly-recommended',
  'use-with-caution': 'recommended',
  'vue3-use-with-caution': 'vue3-recommended'
}

const flatConfigCategories = {
  base: null,
  essential: 'vue2-essential',
  'strongly-recommended': 'vue2-strongly-recommended',
  recommended: 'vue2-recommended',
  'vue3-essential': 'essential',
  'vue3-strongly-recommended': 'strongly-recommended',
  'vue3-recommended': 'recommended'
}

function formatRules(rules, categoryId) {
  const obj = Object.fromEntries(
    rules.map((rule) => {
      let options = errorCategories.has(categoryId) ? 'error' : 'warn'
      const defaultOptions =
        rule.meta && rule.meta.docs && rule.meta.docs.defaultOptions
      if (defaultOptions) {
        const v = categoryId.startsWith('vue3') ? 3 : 2
        const defaultOption = defaultOptions[`vue${v}`]
        if (defaultOption) {
          options = [options, ...defaultOption]
        }
      }
      return [rule.ruleId, options]
    })
  )
  return JSON.stringify(obj, null, 2)
}

function formatCategory(category) {
  const extendsCategoryId = extendsCategories[category.categoryId]
  if (extendsCategoryId == null) {
    return [
      `/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "npm run update"
 */
/** @type {import('eslint').Linter.Config} */
module.exports = {
  parser: require.resolve('vue-eslint-parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  env: {
    browser: true,
    es6: true
  },
  plugins: [
    'vue'
  ],
  rules: ${formatRules(category.rules, category.categoryId)}
}
`,
      `/*
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
      sourceType: 'module',
    },
    processor: require('../lib/processor'),
  },
  {
    plugins: { vue: /** @type {any} */ (require('../lib/index')) },
    rules: ${formatRules(category.rules, category.categoryId)},
  }
]
`
    ]
  }
  if (!flatConfigCategories[category.categoryId]) {
    return [
      `/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "npm run update"
 */
/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: require.resolve('./${extendsCategoryId}'),
  rules: ${formatRules(category.rules, category.categoryId)}
}`
    ]
  }
  return [
    `/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "npm run update"
 */
/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: require.resolve('./${extendsCategoryId}'),
  rules: ${formatRules(category.rules, category.categoryId)}
}
`,
    `/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "npm run update"
 */
/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  ...require('./${
    flatConfigCategories[extendsCategoryId] || extendsCategoryId
  }'),
  {
    rules: /** @type {any} */ (
      require('../lib/configs/${category.categoryId}').rules
    )
  }
]
`
  ]
}

// Update files.
const ROOT = path.resolve(__dirname, '../lib/configs/')
const FLAT_CONFIG_ROOT = path.resolve(__dirname, '../configs/')
for (const category of categories) {
  const filePath = path.join(ROOT, `${category.categoryId}.js`)
  const [content, flatContent] = formatCategory(category)

  fs.writeFileSync(filePath, content)
  if (flatContent) {
    fs.writeFileSync(
      path.join(
        FLAT_CONFIG_ROOT,
        `${flatConfigCategories[category.categoryId] || category.categoryId}.js`
      ),
      flatContent
    )
  }
}

// Format files.
async function format() {
  const linter = new FlatESLint({ fix: true })
  const report = await linter.lintFiles([ROOT, FLAT_CONFIG_ROOT])
  FlatESLint.outputFixes(report)
}

format()
