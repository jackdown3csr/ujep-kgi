// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkCallouts from './src/lib/remark-callouts.mjs';
import rehypeOdkazy from './src/lib/rehype-odkazy.mjs';

// Na Vercelu běží web v kořeni domény. Pro GitHub Pages se nastaví BASE_PATH=/ujep-kgi.
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site: process.env.SITE_URL || 'https://ujep-kgi.vercel.app',
  base,
  trailingSlash: 'ignore',
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath, remarkCallouts],
      rehypePlugins: [rehypeKatex, [rehypeOdkazy, { base }]],
    }),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
