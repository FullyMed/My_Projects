import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

// data.ts loads products.json with a dynamic import, which the browser would only start after the
// main chunk has run. This preload tag lets it download both at once.
function preloadProductsChunk(): Plugin {
  return {
    name: "preload-products-chunk",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(_html, ctx) {
        const chunk = Object.values(ctx.bundle ?? {}).find(
          (c) => c.type === "chunk" && c.name === "products",
        );
        if (!chunk) return [];
        return [{ tag: "link", attrs: { rel: "modulepreload", crossorigin: true, href: `/${chunk.fileName}` }, injectTo: "head" }];
      },
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    tailwindcss(),
    metaImagesPlugin(),
    preloadProductsChunk(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Routes are lazy-loaded (App.tsx) and products.json is its own chunk (data.ts loads it with a
    // dynamic import), so the main chunk is only app code, about 480KB. The limit is for the
    // products chunk, which is plain data and grows with the catalog.
    chunkSizeWarningLimit: 1600,
  },
  server: {
    host: "0.0.0.0",
    // Wildcard host + DNS-rebinding protection bypass is only needed behind
    // Replit's proxy (which fronts the dev server with its own auth/routing).
    // Outside Replit, keep Vite's default host-header allowlist enabled.
    allowedHosts: process.env.REPL_ID !== undefined ? true : undefined,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});