import pluginJs from "@eslint/js"
import { FlatCompat } from "@eslint/eslintrc"
import pluginPrettierRecommended from "eslint-plugin-prettier/recommended"
import pluginEslintConfigPrettier from "eslint-config-prettier"
import pluginSonarjs from "eslint-plugin-sonarjs"
import pluginUnicorn from "eslint-plugin-unicorn"
import pluginJsdoc from "eslint-plugin-jsdoc"

const compat = new FlatCompat()

export default [
  ...compat.extends("eslint-config-standard"),
  pluginJs.configs.recommended,
  pluginPrettierRecommended,
  pluginEslintConfigPrettier,
  pluginSonarjs.configs.recommended,
  pluginUnicorn.configs["flat/recommended"],
  pluginJsdoc.configs["flat/recommended"],
  {
    ignores: [
      "**/node_modules/*",
      "**/dist/*",
      "**/assets/*",
      "**/pnpm-lock.yaml"
    ]
  },
  {
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "no-console": [
        "error",
        {
          allow: ["error", "warn"]
        }
      ],
      "sonarjs/no-unused-collection": "off",
      "sonarjs/no-duplicate-string": ["warn", { threshold: 5 }],
      "unicorn/better-regex": "error",
      "unicorn/catch-error-name": "error",
      "unicorn/consistent-destructuring": "error",
      "unicorn/empty-brace-spaces": "error",
      "unicorn/explicit-length-check": "error",
      "unicorn/no-abusive-eslint-disable": "error",
      "unicorn/no-array-for-each": "error",
      "unicorn/no-array-push-push": "error",
      "unicorn/no-await-expression-member": "error",
      "unicorn/no-for-loop": "error",
      "unicorn/no-instanceof-array": "error",
      "unicorn/no-unnecessary-await": "error",
      "unicorn/no-unused-properties": "error",
      "unicorn/no-useless-length-check": "error",
      "unicorn/no-useless-promise-resolve-reject": "error",
      "unicorn/no-useless-spread": "error",
      "unicorn/prefer-array-flat": "error",
      "unicorn/prefer-array-flat-map": "error",
      "unicorn/prefer-includes": "error",
      "unicorn/prefer-prototype-methods": "error",
      "unicorn/prefer-regexp-test": "error",
      "unicorn/prefer-spread": "error",
      "unicorn/throw-new-error": "error",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/prefer-string-slice": "error",
      "unicorn/no-null": "off",
      "unicorn/no-this-assignment": "warn",
      "unicorn/filename-case": "off",
      "unicorn/consistent-function-scoping": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/prefer-query-selector": "off",
      "unicorn/prefer-add-event-listener": "warn",
      "unicorn/prefer-top-level-await": "warn",
      "unicorn/prefer-structured-clone": "off",
      "unicorn/prefer-ternary": ["error", "only-single-line"],
      "unicorn/prefer-code-point": "off",
      "sonarjs/todo-tag": "warn"
    }
  }
]
