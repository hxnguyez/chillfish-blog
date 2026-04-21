import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({ // Bỏ ({ image }) ở đây vì không dùng image() nữa
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(), // CHUYỂN THÀNH z.string()
    tags: z.array(z.string()).optional(),
    category: z.union([z.string(), z.array(z.string())]).optional(),
    draft: z.boolean().optional(),
  }),
});

const lab = defineCollection({
  loader: glob({ base: "./src/content/lab", pattern: "**/*.{md,mdx}" }),
  schema: z.object({ // Bỏ ({ image }) ở đây luôn
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(), // CHUYỂN THÀNH z.string()
    tags: z.array(z.string()).optional(),
    category: z.union([z.string(), z.array(z.string())]).optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { blog, lab };