import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// 1. Định nghĩa Base Schema một lần duy nhất (Chuẩn DRY)
// Giữ nguyên Schema này để đồng bộ dữ liệu giữa Blog, Lab, Research và WIP
const baseSchema = z.object({
  title: z.string(),
  description: z.string().optional(), // Sửa chút: Cho phép WIP không cần description lúc đầu
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  heroImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.union([z.string(), z.array(z.string())]).optional(),
  draft: z.boolean().optional(),
});

// 2. Định nghĩa các Collection
const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: baseSchema,
});

const lab = defineCollection({
  loader: glob({ base: "./src/content/lab", pattern: "**/*.{md,mdx}" }),
  schema: baseSchema,
});

const research = defineCollection({
  loader: glob({ base: "./src/content/research", pattern: "**/*.{md,mdx}" }),
  schema: baseSchema,
});

// THÊM MỚI: Định nghĩa WIP Collection
const wip = defineCollection({
  loader: glob({ base: "./src/content/wip", pattern: "**/*.{md,mdx}" }),
  schema: baseSchema,
});

// 3. Export collections
// CHÚ Ý: Phải export 'wip' ra thì Astro mới nhận diện được
export const collections = { blog, lab, research, wip };