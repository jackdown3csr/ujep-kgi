import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const poznamky = defineCollection({
  loader: glob({
    base: './docs',
    pattern: '**/*.md',
    // docs/studium/prehled.md → studium/prehled, docs/semestry/01-semestr/index.md → semestry/01-semestr
    generateId: ({ entry }) => entry.replace(/\.md$/, '').replace(/(^|\/)index$/, '') || 'index',
  }),
  schema: z.object({
    tags: z.array(z.string()).optional(),
    poradi: z.number().optional(),
    nazev: z.string().optional(), // název v menu, když se liší od nadpisu
    zkratka: z.string().optional(),
    kredity: z.union([z.string(), z.number()]).optional(),
  }),
});

export const collections = { poznamky };
