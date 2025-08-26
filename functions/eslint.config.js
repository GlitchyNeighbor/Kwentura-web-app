const globals = require("globals");
const js = require("@eslint/js");
const eslintConfigGoogle = require("eslint-config-google");
const pluginJsdoc = require("eslint-plugin-jsdoc");

const googleRules = eslintConfigGoogle.rules || {};
const filteredGoogleRules = Object.fromEntries(
    Object.entries(googleRules).filter(([ruleName]) => {
      return !ruleName.startsWith("filenames/") &&
      !ruleName.startsWith("import/");
    }));

module.exports = [
  {
    files: ["**/*.js"],
    plugins: {
      jsdoc: pluginJsdoc,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.es6,
        ...(eslintConfigGoogle.env&&
        eslintConfigGoogle.env.browser?
        globals.browser:{}),
        ...(eslintConfigGoogle.globals || {}),
      },
      parserOptions: {
        ...(eslintConfigGoogle.parserOptions || {}),
        ecmaVersion: "latest",
        sourceType: "commonjs",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...filteredGoogleRules,
      "require-jsdoc": "off",
      "valid-jsdoc": "off",
      "no-restricted-globals": ["error", "name", "length"],
      "prefer-arrow-callback": "error",
      "quotes": ["error", "double", {"allowTemplateLiterals": true}],
    },
  },
  {
    files: ["**/*.spec.*"],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
    rules: {
    },
  },
  {
    ignores: ["node_modules/"],
  },
];
