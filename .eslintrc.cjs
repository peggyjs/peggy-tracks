"use strict";

module.exports = {
  root: true,
  extends: "@peggyjs",
  ignorePatterns: [
    "node_modules/",
    "vendor/",
  ],
  overrides: [
    {
      files: ["*.js"],
      parserOptions: {
        sourceType: "module",
        ecmaVersion: 2020,
      },
    },
  ],
};
