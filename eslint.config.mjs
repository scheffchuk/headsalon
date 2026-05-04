import eslintConfigNext from "eslint-config-next";

const eslintConfig = [
  {
    ignores: ["src/components/ai-elements/**", "convex/_generated/**"],
  },
  ...eslintConfigNext,
  {
    files: ["src/components/ui/underline-center.tsx"],
    rules: {
      "react-hooks/static-components": "off",
    },
  },
];

export default eslintConfig;
