// src/content/config.ts
import { defineCollection, z } from 'astro:content';

// blogコレクションのデータ構造（スキーマ）を定義
const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.string(),
    date: z.string().optional(), // 日付はあってもなくてもOK
  }),
});

// 定義したコレクションをAstroに登録
export const collections = {
  'blog': blogCollection,
};