import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

/**
 * Tab title order: `SASI docs · Page`, name first, matching the site title.
 * Starlight builds `Page | SACDA docs` and offers only the delimiter, not the
 * order.
 */
export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  const title = route.head.find((tag) => tag.tag === 'title');
  if (title) title.content = `SASI docs · ${route.entry.data.title}`;
});
