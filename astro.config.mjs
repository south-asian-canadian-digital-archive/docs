import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';
import starlightMdTxt from 'starlight-md-txt';

// Static output for GitHub Pages, served as a project site under /docs.
// Only src/content/docs is published. Internal links in Markdown are written as
// absolute /docs/... paths, so they must change if `base` ever does.
const REPO = 'https://github.com/south-asian-canadian-digital-archive/docs';

export default defineConfig({
  site: 'https://south-asian-canadian-digital-archive.github.io',
  base: '/docs',
  trailingSlash: 'ignore',
  integrations: [
    starlight({
      title: 'SACDA docs',
      description:
        'How the South Asian Canadian Digital Archive (sacda.ufv.ca) is built, run, ingested into and extended.',
      customCss: ['./src/styles/sacda-docs.css'],
      head: [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true } },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap',
          },
        },
      ],
      social: [{ icon: 'github', label: 'GitHub', href: REPO }],
      components: {
        SocialIcons: './src/components/DocsNavLinks.astro',
        SiteTitle: './src/components/DocsSiteTitle.astro',
        PageTitle: './src/components/DocsPageTitle.astro',
        Pagination: './src/components/DocsPagination.astro',
      },
      routeMiddleware: './src/docsRouteData.ts',
      editLink: { baseUrl: `${REPO}/edit/main/` },
      lastUpdated: true,
      sidebar: [
        { label: 'Start here', autogenerate: { directory: 'start' } },
        { label: 'Editing content', autogenerate: { directory: 'editors' } },
        { label: 'Operations', autogenerate: { directory: 'operations' } },
        { label: 'Development', autogenerate: { directory: 'development' } },
        { label: 'Ingest', autogenerate: { directory: 'ingest' } },
        { label: 'Research and roadmap', autogenerate: { directory: 'research' } },
        { label: 'Reference', autogenerate: { directory: 'reference' } },
      ],
      expressiveCode: {
        themes: [
          {
            name: 'sacda',
            type: 'dark',
            settings: [
              { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#8a9099' } },
              { scope: ['keyword', 'storage', 'storage.type', 'keyword.control'], settings: { foreground: '#b6a4e0' } },
              { scope: ['string', 'string.quoted', 'constant.character'], settings: { foreground: '#9cc2a4' } },
              { scope: ['entity.name.function', 'support.function', 'constant.numeric'], settings: { foreground: '#8db6dc' } },
              { scope: ['variable', 'meta.definition.variable'], settings: { foreground: '#ecedee' } },
            ],
            colors: {
              'editor.background': '#1b1e22',
              'editor.foreground': '#ecedee',
              'editorLineNumber.foreground': '#8a9099',
            },
          },
        ],
        styleOverrides: {
          borderRadius: '0',
          borderColor: 'var(--sl-color-hairline)',
          frames: { shadowColor: 'transparent' },
        },
      },
      plugins: [
        starlightLlmsTxt({
          projectName: 'SACDA docs',
          description:
            'Operator, developer and editor documentation for the South Asian Canadian Digital Archive, an Islandora 2 (Drupal) repository at sacda.ufv.ca.',
        }),
        starlightMdTxt(),
      ],
    }),
  ],
});
