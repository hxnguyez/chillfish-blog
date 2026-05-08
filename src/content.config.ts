import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const baseSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  heroImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.union([z.string(), z.array(z.string())]).optional(),
  draft: z.boolean().optional(),
  cveId: z.string().optional(),
  severity: z.string().optional(),
  cvss: z.string().optional(),
  vulnerabilityType: z.string().optional(),
});

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

const wip = defineCollection({
  loader: glob({ base: "./src/content/wip", pattern: "**/*.{md,mdx}" }),
  schema: baseSchema,
});

export const collections = { blog, lab, research, wip };