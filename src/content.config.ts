import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      tags: z.array(z.string()).optional(),
      category: z.union([z.string(), z.array(z.string())]).optional(),
      draft: z.boolean().optional(),
    }),
});

// THÊM COLLECTION LAB VÀO ĐÂY
const lab = defineCollection({
  // Quét các file trong thư mục src/content/lab/
  loader: glob({ base: "./src/content/lab", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      tags: z.array(z.string()).optional(),
      category: z.union([z.string(), z.array(z.string())]).optional(),
      draft: z.boolean().optional(),
    }),
});

// Export cả 2 collection
export const collections = { blog, lab };