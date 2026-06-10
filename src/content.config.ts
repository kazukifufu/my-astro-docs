// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders'; // 新しいglobローダーをインポート

const blogCollection = defineCollection({
  // Content Layer API用の設定
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    date: z.string().optional(),
  }),
});

export const collections = {
  'blog': blogCollection,
};