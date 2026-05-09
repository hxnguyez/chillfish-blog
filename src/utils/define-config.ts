import { Newspaper, Home, Info, Beaker } from "lucide-react";
import { Github } from "simple-icons-astro";
import type { ShBlogConfig } from "../types/shblog.config.d";

const defaultConfig: ShBlogConfig = {
  title: "chillfish Blog",
  description: "Learn to Hack, not Hack to Learn。A digital space for CTF write-ups and security research.",
  lang: "en",
  siteLang: "en",
  favicon: "/avatar.png",

  pages: {
    home: {
      title: "When you dive into the deep sea,\nyou don't look for the light; you become it。",
      heroImage: "/assets/layouts/homepage/theme2.jpg",
      greetings: [
        { begin: 0, finish: 5, text: "sleeping..." },
        { begin: 5, finish: 12, text: "have a good day!" },
        { begin: 12, finish: 13, text: "lunch time!" },
        { begin: 13, finish: 18, text: "do something interesting!" },
        { begin: 18, finish: 22, text: "working is a part of life" },
        { begin: 22, finish: 24, text: "the abyss is calling。don't dive too late" },
        { text: "Hi, welcome to my digital abyss!" },
      ],
    },
    blog: { title: "Archives", subTitle: "Every thought, every love and effort。", heroImage: "/assets/layouts/homepage/theme2.jpg" },
    other: {
        search: { title: "Blog Searching", subTitle: "", heroImage: "/assets/layouts/homepage/theme2.jpg" },
        friends: { title: "Network Nodes", subTitle: "Connecting with fellow researchers and friends.", heroImage: "/assets/layouts/homepage/theme2.jpg" },
        about: { title: "About me", subTitle: "The architecture behind this digital space。", heroImage: "/assets/layouts/homepage/theme2.jpg" },
        lab: { 
            title: "My study Lab", 
            subTitle: "A showcase of somethings important with me。", 
            heroImage: "/assets/layouts/homepage/theme2.jpg" 
        },
    }
  },

  style: {
    heroImage: { from: 60, to: 100, src: "/assets/layouts/homepage/theme2.jpg", method: "overlay" },
    defaultPostImage: "/assets/layouts/homepage/theme2.jpg",
    postsPerPage: 10,
    titleSeparator: "|",
    enableTransitions: true, 
    enableRecentPosts: true,
  },

  author: {
    name: "HungNguyen",
    bio: "FPT University Student | Security Researcher | CTF Enthusiast",
    email: "hungby2447@gmail.com",
    avatarUrl: "https://github.com/hxnguyez.png",
    links: [
      { icon: "Github", to: "https://github.com/hxnguyez", label: "GitHub" },
    ],
  },

  navBar: {
    links: [
      { title: "Home", href: "/", icon: Home },
      { title: "Blog", href: "/blog", icon: Newspaper },
      { title: "Lab", href: "/lab", icon: Beaker }, 
      { title: "About", href: "/about", icon: Info },
    ],
  },

  friendLinks: [],

  // ĐÃ LOẠI BỎ COMMENT, GTM, VÀ CÁC THỨ KHÔNG CẦN THIẾT
  behavior: {
    enable404EasterEgg: true,
    tableOfContents: { enable: true, minDepth: 2, maxDepth: 4 },
    rss: { enable: true, protectContent: true, enableStylesheet: true },
  },

  footer: {
    description: "Built with passion and deep dives. Credits to the community and open source explorers.",
    links: [{ socialMedia: Github as any, url: "https://github.com/hxnguyez" }],
    copyright: {
      text: "CC BY-NC 4.0",
      url: "https://creativecommons.org/licenses/by-nc/4.0/",
      yearUpdateStrategy: "auto",
    },
    countryEmoji: "🇻🇳",
  },
};

type DeepPartial<T> = T extends (...args: any[]) => any ? T : T extends readonly (infer U)[] ? readonly DeepPartial<U>[] : T extends (infer U)[] ? DeepPartial<U>[] : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;
function isPlainObject(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function mergeDeep<T>(base: T, override?: DeepPartial<T>): T {
  if (override === undefined) return base;
  if (Array.isArray(base) || !isPlainObject(base) || !isPlainObject(override)) return (override as T) ?? base;
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(override)) {
    const overrideValue = (override as any)[key];
    if (overrideValue === undefined) continue;
    result[key] = mergeDeep((base as any)[key], overrideValue);
  }
  return result as T;
}
export function defineConfig(config: DeepPartial<ShBlogConfig> = {}): ShBlogConfig { return mergeDeep<ShBlogConfig>(defaultConfig, config); }