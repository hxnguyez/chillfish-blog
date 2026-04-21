import pkg from "lucide-react";
const { Newspaper, Home, Info, FolderCode, Handshake, FlaskConical } = pkg;

// Import component Github để dùng cho footer
import { Github } from "simple-icons-astro";

import { defineConfig } from "@/utils/define-config";

const config = defineConfig({
  title: "chillfish Blog",
  description: "Cybersecurity projects, CTF Writeups, and my journey at FPT University。",

  pages: {
    home: {
      title: "@hxnguyez。",
      greetings: [
        { begin: 0, finish: 6, text: "sleeping..." },
        { begin: 6, finish: 12, text: "have a good day!" },
        { begin: 12, finish: 18, text: "lunch time!" },
        { begin: 18, finish: 24, text: "let's work tonight!" },
        { text: "Connection established" },
      ],
    },
  },

  author: {
    name: "HungNguyen",
    bio: "FPT University Student | Cybersecurity & CTF Enthusiast。",
    avatarUrl: "/avatar.png", 
    links: [
      { 
        icon: "Github", // Author dùng string vì theme có sẵn icon map
        to: "https://github.com/hxnguyez", 
        label: "GitHub" 
      },
    ],
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
    enableGTM: false,
    gtmConfig: { googleTagManagerId: "" }, 
    commentConfig: {
      enableComment: "Giscus",
      giscusConfig: {
        repo: "hxnguyez/chillfish-blog",
        repoId: "", category: "Announcements", categoryId: "", 
        mapping: "og:title", strict: "0", reactionsEnabled: "1", emitMetadata: "1", inputPosition: "top", theme: "transparent_dark", lang: "en",
      },
    },
  },

  footer: {
    description: "When you dive into the deep sea,\n you don't look for the light; you become it。\n--- chillfish ---",
    links: [
      { 
        // TRUYỀN COMPONENT GITHUB VÀO ĐÂY (Giống author nhưng footer yêu cầu object trực tiếp)
        socialMedia: Github as any, 
        url: "https://github.com/hxnguyez" 
      }
    ],
    copyright: {
      text: "CC BY-NC 4.0",
      url: "https://creativecommons.org/licenses/by-nc/4.0/",
      yearUpdateStrategy: "auto",
    },
    countryEmoji: "⾮🇻🇳",
  },
});

export default config;