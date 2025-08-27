// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/KEDEHUMMap/",   // 반드시 레포 이름과 동일하게!
});
