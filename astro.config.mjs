import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';
import starlightMdTxt from 'starlight-md-txt';

// Static output for GitHub Pages. The internal notes at the repo root are not part of
// this build: only src/content/docs is.
export default defineConfig({
  site: 'https://south-asian-canadian-digital-archive.github.io',
  base: '/docs',
  integrations: [
    starlight({
      title: 'SACDA Docs',
      description: 'Documentation for the South Asian Canadian Digital Archive.',
      customCss: ['./src/styles/theme.css'],
      components: {
        PageTitle: './src/components/DocsPageTitle.astro',
        Pagination: './src/components/DocsPagination.astro',
      },
      sidebar: [
        { label: 'Start here', items: [{ label: 'Overview', link: '/' }, 'guides/placeholder'] },
        { label: 'Reference', items: ['guides/ai-tools'] },
      ],
      plugins: [starlightLlmsTxt(), starlightMdTxt()],
    }),
  ],
});
