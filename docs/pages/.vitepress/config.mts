import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "LD Toypad Emulator",
  description: "Documentation for LD Toypad",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  locales: {
    root: {
      label: "English",
      lang: "en",
    },
    /* TODO this needs to be done. the root routes should be copied into a /de subfolder
    de: {
      label: "German",
      lang: "de",
      link: "/de",
    },*/
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: "Home", link: "/" }],

    sidebar: [
      {
        text: "Getting started",
        items: [
          {
            text: "Requirements",
            link: "/getting-started/requirements",
          },
          {
            text: "Installation",
            link: "/getting-started/installation",
          },
          {
            text: "Updating",
            link: "/getting-started/updating",
          },
          {
            text: "Troubleshooting",
            link: "/getting-started/troubleshooting",
          },
        ],
      },
      {
        text: "Configuration",
        items: [
          {
            text: "Adding images",
            link: "/configuration/adding-images",
          },
        ],
      },
      {
        text: "Advanced",
        items: [
          {
            text: "Build yourself",
            link: "/advanced/building-yourself",
          },
        ],
      },
      {
        text: "Development",
        items: [
          {
            text: "Setup",
            link: "/development/setup",
          },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/Berny23/LD-ToyPad-Emulator" },
    ],
  },
});
