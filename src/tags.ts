import { getCollection } from 'astro:content';

// Display names and one-line descriptions. A tag used in frontmatter but not
// listed here still works; it just shows its raw name.
export const TAGS: Record<string, { label: string; about: string }> = {
  drupal: { label: 'Drupal', about: 'The CMS behind sacda.ufv.ca' },
  islandora: { label: 'Islandora', about: 'Drupal modules and microservices for repositories' },
  php: { label: 'PHP', about: 'Drupal modules, theme preprocess code, two legacy exhibits' },
  twig: { label: 'Twig', about: 'Drupal templates in the theme and modules' },
  svelte: { label: 'Svelte', about: 'Fast search, ingest audit, exhibits and their shared library' },
  sveltekit: { label: 'SvelteKit', about: 'The static exhibit sites' },
  typescript: { label: 'TypeScript', about: 'Theme behaviours and the Svelte apps' },
  tailwind: { label: 'Tailwind CSS', about: 'Styling in the theme and exhibits' },
  bun: { label: 'Bun', about: 'Builds the theme, Svelte apps and these docs' },
  rust: { label: 'Rust', about: 'organise (sheet preprocessor) and the Workbench GUI' },
  python: { label: 'Python', about: 'Islandora Workbench and the migration and OCR scripts' },
  docker: { label: 'Docker', about: 'The isle Compose stack' },
  traefik: { label: 'Traefik', about: 'Routing, TLS inside the stack, rate limits' },
  nginx: { label: 'nginx', about: 'Serves exhibits, /static and the /search shell' },
  solr: { label: 'Solr', about: 'Search index' },
  fedora: { label: 'Fedora', about: 'Repository storage for binaries and RDF' },
  iiif: { label: 'IIIF', about: 'Cantaloupe image server and viewer manifests' },
  java: { label: 'Java', about: 'Fedora, Cantaloupe, Alpaca, ActiveMQ, Blazegraph, FITS' },
  'github-actions': { label: 'GitHub Actions', about: 'CI builds and deploy triggers' },
  make: { label: 'Make and shell', about: 'Deploy recipes and ops scripts' },
  wordpress: { label: 'WordPress', about: 'The three heritage websites' },
  astro: { label: 'Astro', about: 'These docs (Starlight)' },
  mermaid: { label: 'Mermaid', about: 'Diagrams in these docs' },
  networking: { label: 'Networking', about: 'Proxies, ports, hostnames, firewall' },
  security: { label: 'Security', about: 'Bot protection, secrets, access' },
};

export const tagLabel = (t: string) => TAGS[t]?.label ?? t;

export async function pagesByTag() {
  const docs = await getCollection('docs');
  const map = new Map<string, { title: string; href: string; description?: string }[]>();
  for (const d of docs) {
    for (const t of d.data.tags ?? []) {
      if (!map.has(t)) map.set(t, []);
      map.get(t)!.push({
        title: d.data.title,
        description: d.data.description,
        href: `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${d.id.replace(/\/index$/, '').replace(/^index$/, '')}/`,
      });
    }
  }
  for (const list of map.values()) list.sort((a, b) => a.title.localeCompare(b.title));
  return map;
}
