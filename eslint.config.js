import modern from "@peggyjs/eslint-config/modern.js";
import module from "@peggyjs/eslint-config/module.js";

export default [
  {
    ignores: [
      "**/*.d.ts",
      "node_modules/**",
      "vendor/**",
      "test/repeat.peggy",
      "test/number.js",
    ],
  },
  ...module,
  ...modern,
];
