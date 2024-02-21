import cjs from "@peggyjs/eslint-config/flat/cjs.js";
import modern from "@peggyjs/eslint-config/flat/modern.js";
import module from "@peggyjs/eslint-config/flat/module.js";

export default [
  {
    ignores: [
      "**/*.d.ts",
      "node_modules/**",
      "vendor/**",
    ],
  },
  {
    ...module,
    ...modern,
  },
  cjs,
];
