import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  rules: {
    // TypeScript — allow implicit any (project uses noImplicitAny: false)
    // Prisma dynamic access requires any — documented
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/prefer-as-const": "off",
    "@typescript-eslint/no-unused-disable-directive": "off",

    // Report unused vars and imports (with underscore-prefix opt-out)
    "@typescript-eslint/no-unused-vars": ["warn", {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_",
    }],

    // React hooks — warn on missing deps (surfacing real bugs)
    "react-hooks/exhaustive-deps": "warn",
    "react-hooks/purity": "off",

    // React
    "react/no-unescaped-entities": "off",
    "react/display-name": "off",
    "react/prop-types": "off",
    "react-compiler/react-compiler": "off",

    // Next.js — warn on raw <img> (use next/image)
    "@next/next/no-img-element": "warn",
    "@next/next/no-html-link-for-pages": "off",

    // General
    "prefer-const": "warn",
    "no-unused-vars": "off", // handled by @typescript-eslint
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "warn",
    "no-empty": "off",
    "no-irregular-whitespace": "warn",
    "no-case-declarations": "off",
    "no-fallthrough": "warn",
    "no-mixed-spaces-and-tabs": "warn",
    "no-redeclare": "off",
    "no-undef": "off",
    "no-unreachable": "warn",
    "no-useless-escape": "off",
  },
}, {
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts", "examples/**", "skills/**", "tests/**", "mini-services/**", "scripts/**"]
}];

export default eslintConfig;
