import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import starlightLlmsTxt from 'starlight-llms-txt';
import starlightMdTxt from 'starlight-md-txt';
import starlightSidebarTopics from 'starlight-sidebar-topics';

// Static output for GitHub Pages, served as a project site under /docs.
// Only src/content/docs is published. Internal links in Markdown are written as
// absolute /docs/... paths, so they must change if `base` ever does.
const REPO = 'https://github.com/south-asian-canadian-digital-archive/docs';

export default defineConfig({
  site: 'https://south-asian-canadian-digital-archive.github.io',
  base: '/docs',
  trailingSlash: 'ignore',
  integrations: [
    // Must come before Starlight so ```mermaid blocks skip Expressive Code.
    // Diagrams render in the browser; the .md and llms.txt copies keep the
    // Mermaid source, which agents can read.
    mermaid({ theme: 'neutral', autoTheme: true }),
    starlight({
      title: 'SASI docs',
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
            href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap',
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
        starlightSidebarTopics(
          [
            {
              label: 'SACDA / Islandora',
              link: '/islandora/',
              icon: 'open-book',
              items: [
              { label: 'Start here', items: ['islandora', { autogenerate: { directory: 'islandora/start' } }] },
              { label: 'Editing content', items: [{ autogenerate: { directory: 'islandora/editors' } }] },
              { label: 'Operations', items: [{ autogenerate: { directory: 'islandora/operations' } }] },
              { label: 'Exhibits', items: [{ autogenerate: { directory: 'islandora/exhibits' } }] },
              { label: 'Workbench', items: [{ autogenerate: { directory: 'islandora/workbench' } }] },
              { label: 'Ingest', items: [{ autogenerate: { directory: 'islandora/ingest' } }] },
              { label: 'Development', items: [{ autogenerate: { directory: 'islandora/development' } }] },
              { label: 'Research and roadmap', items: [{ autogenerate: { directory: 'islandora/research' } }] },
              { label: 'Reference', items: [{ autogenerate: { directory: 'islandora/reference' } }] },
              ],
            },
            { label: 'CollectiveAccess migration', link: '/migration/', icon: 'random', items: [{ autogenerate: { directory: 'migration' } }] },
            { label: 'Digitization and metadata', link: '/digitization/', icon: 'document', items: [{ autogenerate: { directory: 'digitization' } }] },
            { label: 'South Asian Canadian Heritage', link: '/sach/', icon: 'external', items: [{ autogenerate: { directory: 'sach' } }] },
            { label: 'Canadian Sikh Heritage', link: '/csh/', icon: 'external', items: [{ autogenerate: { directory: 'csh' } }] },
            { label: 'SACLP', link: '/saclp/', icon: 'external', items: [{ autogenerate: { directory: 'saclp' } }] },
            {
              id: 'about',
              label: 'About these docs',
              link: '/about/',
              icon: 'information',
              items: [{ autogenerate: { directory: 'about' } }, { label: 'Tags', link: '/tags/' }],
            },
          ],
          { exclude: ['/'], topics: { about: ['/tags', '/tags/**'] } },
        ),
        starlightLlmsTxt({
          projectName: 'SASI docs',
          description:
            'Documentation for the South Asian Studies Institute (UFV): the SACDA Islandora archive at sacda.ufv.ca, its exhibits and ingest tooling, the CollectiveAccess migration, metadata practice, and the heritage websites.',
          customSets: [
            { label: 'SACDA / Islandora', paths: ['islandora/**', 'islandora'], description: 'sacda.ufv.ca: architecture, operations, exhibits, Workbench, ingest, development and research' },
            { label: 'CollectiveAccess migration', paths: ['migration/**', 'migration'], description: 'archive of the 2026 move from CollectiveAccess to Islandora' },
            { label: 'Digitization and metadata', paths: ['digitization/**', 'digitization'], description: 'the SACDA metadata manual and digitization practice' },
            { label: 'Heritage websites', paths: ['sach/**', 'sach', 'csh/**', 'csh', 'saclp/**', 'saclp'], description: 'southasiancanadianheritage.ca, canadiansikhheritage.ca and saclp' },
          ],
        }),
        starlightMdTxt(),
      ],
    }),
  ],
});
