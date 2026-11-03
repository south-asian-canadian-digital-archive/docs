import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// `tags` lists the tools and languages a page is about (svelte, rust, php...).
// They show under the page title and are collected at /docs/tags/. Keep them
// lowercase and reuse existing ones; the list is in src/tags.ts.
export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({ extend: z.object({ tags: z.array(z.string()).optional() }) }),
  }),
};
