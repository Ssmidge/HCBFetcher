import js from "@eslint/js";
import tseslint from 'typescript-eslint';


export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'import/extensions': 'off',
      'linebreak-style': 'off',
      '@stylistic/js/linebreak-style': 'off',
      "@typescript-eslint/no-explicit-any": "warn",
      'semi': 'error',
    },
  },
]