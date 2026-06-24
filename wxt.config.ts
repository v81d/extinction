import { defineConfig, UserManifest } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  modules: ["@wxt-dev/module-vue"],
  manifest: (): UserManifest => {
    const manifest: UserManifest = {
      name: "Extinction",
      permissions: ["activeTab", "scripting", "storage"],
    };

    if (import.meta.env.FIREFOX)
      manifest.browser_specific_settings = {
        gecko: {
          id: "@extinction.v81d",
          data_collection_permissions: {
            required: ["websiteContent"],
          },
        },
        gecko_android: {},
      };

    return manifest;
  },
});
