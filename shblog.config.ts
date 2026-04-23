import { Newspaper, Home, Info, FlaskConical } from "lucide-react";
import { Github } from "simple-icons-astro";
import { defineConfig } from "@/utils/define-config";

const config = defineConfig({
  title: "chillfish Blog",
  description: "Cybersecurity projects, CTF Writeups, and my journey at FPT University。",

  style: {
    heroImage: {
      src: "/assets/layouts/homepage/homepage.webp", 
      method: "overlay",
      from: 50,
      to: 80,
    },
    // Không khai báo defaultPostImage ở đây nữa
    postsPerPage: 10,
    titleSeparator: "|",
    enableTransitions: true,
    enableRecentPosts: true,
  },

  pages: {
    home: {
      title: "@hxnguyez。",
      heroImage: "/assets/layouts/homepage/homepage.webp",
      greetings: [
        { begin: 0, finish: 6, text: "sleeping..." },
        { begin: 6, finish: 12, text: "have a good day!" },
        { begin: 12, finish: 18, text: "lunch time!" },
        { begin: 18, finish: 24, text: "let's work tonight!" },
        { text: "Connection established" },
      ],
    },
    other: {
      about: { title: "About Me", subTitle: "Something about chillfish", heroImage: "/assets/layouts/homepage/homepage.webp" },
      search: { title: "Search Results", subTitle: "Find my research", heroImage: "/assets/layouts/homepage/homepage.webp" },
      lab: { title: "My study Lab", subTitle: "Showcase", heroImage: "/assets/layouts/homepage/homepage.webp" }
    }
  },

  author: {
    name: "HungNguyen",
    bio: "FPT University Student | Cybersecurity & CTF Enthusiast。",
    avatarUrl: "/avatar.png", 
    links: [{ icon: "Github", to: "https://github.com/hxnguyez", label: "GitHub" }],
  },

  navBar: {
    links: [
      { title: "Home", href: "/", icon: Home },
      { title: "Blog", href: "/blog", icon: Newspaper },
      { title: "Lab", href: "/lab", icon: FlaskConical },
      { title: "About", href: "/about", icon: Info },
    ],
  },

  behavior: {
    commentConfig: {
      enableComment: "Giscus",
      giscusConfig: {
        repo: "hxnguyez/chillfish-blog",
        repoId: "R_kgDN9m03Yg", 
        category: "Announcements", 
        categoryId: "DIC_kwDON9m03s4Ck_u-", 
        mapping: "og:title", strict: "0", reactionsEnabled: "1", emitMetadata: "1", inputPosition: "top", theme: "transparent_dark", lang: "en",
      },
    },
  },

  footer: {
    description: "When you dive into the deep sea,\n you don't look for the light; you become it。\n--- chillfish ---",
    links: [{ socialMedia: Github as any, url: "https://github.com/hxnguyez" }],
    copyright: { text: "CC BY-NC 4.0", url: "https://creativecommons.org/licenses/by-nc/4.0/", yearUpdateStrategy: "auto" },
    countryEmoji: "🇻🇳",
  },
});

export default config;