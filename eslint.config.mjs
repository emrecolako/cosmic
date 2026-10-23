import { globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  // These effects hydrate browser session state and clear dependent UI state.
  { rules: { "react-hooks/set-state-in-effect": "off" } },
];

export default config;
