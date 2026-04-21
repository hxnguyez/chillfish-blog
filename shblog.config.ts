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
    // THÊM ĐOẠN NÀY ĐỂ FIX LỖI ẢNH NOT FOUND
    other: {
      about: {
        title: "About Me",
        subTitle: "Something about chillfish",
        heroImage: "/assets/blog-placeholder-about.jpg" // Dùng ảnh placeholder có sẵn trong src/assets
      },
      search: {
        title: "Search Results",
        subTitle: "Find my research papers and writeups",
        heroImage: "/assets/blog-placeholder-1.jpg"
      }
    }
  },

  author: {
    // ... giữ nguyên ...
  },
  
  // ... các phần còn lại giữ nguyên ...
});

export default config;