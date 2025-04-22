import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// Determine base URL based on the environment
// Use '/saappi/' if building in GitHub Actions (for GH Pages)
// Use '/' for other environments (like Vercel, local dev)
const viteBase = process.env.GITHUB_ACTIONS === "true" ? "/saappi/" : "/";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: viteBase, // Use the dynamically determined base URL
});
