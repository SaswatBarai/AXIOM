/** @type {import("eslint").Linter.Config} */
module.exports = {
  ...require("./index.js"),
  extends: [
    ...require("./index.js").extends,
    "plugin:@next/eslint-plugin-next/core-web-vitals",
  ],
  rules: {
    ...require("./index.js").rules,
    "@next/next/no-html-link-for-pages": "error",
  },
};
