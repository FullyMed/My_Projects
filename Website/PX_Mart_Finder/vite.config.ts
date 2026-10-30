import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

// data.ts fetches products.json as a separate file. This plugin minifies that file (the source is
// pretty-printed, about 15% bigger) and adds a preload tag for it, because the browser would only
// start the fetch after the main chunk has run. `crossorigin` makes the preload's credentials mode
// match fetch()'s default, or the browser downloads the file twice.
function isProductsJson(fileName: string): boolean {
  return fileName.startsWith("assets/products-") && fileName.endsWith(".json");
}

function productsJsonFile(): Plugin {
  return {
    name: "products-json-file",
    apply: "build",
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === "asset" && isProductsJson(file.fileName)) {
          file.source = JSON.stringify(JSON.parse(file.source.toString()));
        }
      }
    },
    transformIndexHtml: {
      order: "post",
      handler(_html, ctx) {
        const asset = Object.values(ctx.bundle ?? {}).find((a) => a.type === "asset" && isProductsJson(a.fileName));
        if (!asset) return [];
        return [{ tag: "link", attrs: { rel: "preload", as: "fetch", crossorigin: true, href: `/${asset.fileName}` }, injectTo: "head" }];
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
    productsJsonFile(),
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
    // Routes are lazy-loaded (App.tsx) and products.json is fetched as a separate file (data.ts),
    // so the main chunk is only app code, about 480KB, and doesn't grow with the catalog.
    chunkSizeWarningLimit: 500,
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