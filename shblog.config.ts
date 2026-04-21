import pkg from "lucide-react";
const { Newspaper, Home, Info, FolderCode, Handshake, FlaskConical } = pkg;
import { Github } from "simple-icons-astro";
import { defineConfig } from "@/utils/define-config";

const config = defineConfig({
  title: "chillfish Blog",
  description: "Cybersecurity projects, CTF Writeups, and my journey at FPT University。",

  // THÊM PHẦN STYLE NÀY ĐỂ FIX LỖI ẢNH MẶC ĐỊNH CỦA THEME
  style: {
    heroImage: {
      src: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1920&auto=format&fit=crop", 
      method: "overlay",
      from: 0,
      to: 100,
    },
  },

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
    // Bổ sung các trang khác để tránh theme gọi về ảnh SamHacker cũ
    other: {
      about: {
        title: "About Me",
        subTitle: "Something about chillfish",
        heroImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1920&auto=format&fit=crop"
      },
      search: {
        title: "Search Results",
        subTitle: "Find my research papers and writeups",
        heroImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1920&auto=format&fit=crop"
      }
    }
  },

  author: {
    name: "HungNguyen",
    bio: "FPT University Student | Cybersecurity & CTF Enthusiast。",
    avatarUrl: "/avatar.png", 
    links: [
      { 
        icon: "Github",
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
        repoId: "R_kgDN9m03Yg", // Bạn điền Repo ID của bạn vào đây
        category: "Announcements", 
        categoryId: "DIC_kwDON9m03s4Ck_u-", // Bạn điền Category ID của bạn vào đây
        mapping: "og:title", strict: "0", reactionsEnabled: "1", emitMetadata: "1", inputPosition: "top", theme: "transparent_dark", lang: "en",
      },
    },
  },

  footer: {
    description: "When you dive into the deep sea,\n you don't look for the light; you become it。\n--- chillfish ---",
    links: [
      { 
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