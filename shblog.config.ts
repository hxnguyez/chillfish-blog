import { Newspaper, Home, Info, FlaskConical } from "lucide-react";
import { Github } from "simple-icons-astro";
import { defineConfig } from "@/utils/define-config";

const config = defineConfig({
  title: "chillfish Blog",
  description: "Cybersecurity projects, CTF Writeups, and my journey at FPT University。",

  style: {
    heroImage: {
      src: "/assets/layouts/homepage/theme2.jpg", 
      method: "overlay",
      from: 50,
      to: 80,
    },
    postsPerPage: 10,
    titleSeparator: "|",
    enableTransitions: true,
    enableRecentPosts: true,
  },

  pages: {
    home: {
      title: "@hxnguyez。",
      heroImage: "/assets/layouts/homepage/theme2.jpg",
      greetings: [
        { begin: 0, finish: 6, text: "sleeping..." },
        { begin: 6, finish: 12, text: "have a good day!" },
        { begin: 12, finish: 18, text: "lunch time!" },
        { begin: 18, finish: 24, text: "let's work tonight!" },
        { text: "Connection established" },
      ],
    },
    other: {
      about: { title: "About Me", subTitle: "Something about chillfish", heroImage: "/assets/layouts/homepage/theme2.jpg" },
      search: { title: "Search Results", subTitle: "Find my research", heroImage: "/assets/layouts/homepage/theme2.jpg" },
      lab: { title: "My study Lab", subTitle: "Showcase", heroImage: "/assets/layouts/homepage/theme2.jpg" }
    }
  },

  author: {
    name: "HungNguyen",
    bio: "FPT University | Cybersecurity student & Noob Researcher。",
    avatarUrl: "/avatar.png", 
    links: [{ icon: "Github", to: "https://github.com/hxnguyez", label: "GitHub" }],
  },

  navBar: {
    links: [
      { title: "Home", href: "/", icon: Home },
      { title: "Lab", href: "/lab", icon: FlaskConical },
      { title: "WIP", href: "/wip", icon: Newspaper },
      { title: "About", href: "/about", icon: Info },
    ],
  },

  behavior: {
    tableOfContents: { enable: true, minDepth: 2, maxDepth: 4 },
    // Cần giữ lại bộ khung này để tránh lỗi crash build
    commentConfig: {
      enableComment: false, 
      giscusConfig: { repo: "", repoId: "", category: "", categoryId: "", mapping: "og:title", strict: "0", reactionsEnabled: "1", emitMetadata: "1", inputPosition: "top", theme: "transparent_dark", lang: "en" },
    },
    gtmConfig: { googleTagManagerId: "" },
  },

  footer: {
    description: "When you dive into the deep sea,\n you don't look for the light; you become it。\n--- chillfish ---",
    links: [{ socialMedia: Github as any, url: "https://github.com/hxnguyez" }],
    copyright: { text: "CC BY-NC 4.0", url: "https://creativecommons.org/licenses/by-nc/4.0/", yearUpdateStrategy: "auto" },
    countryEmoji: "🇻🇳",
  },
});

export default config;