/** Slug FE/BE dùng chung — alias URL → slug canonical trong DB. */
export const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  hosting: 'web-hosting',
  domain: 'ten-mien',
  vps: 'cloud-vps',
  'vps-custom': 'cloud-vps',
};

export function resolveCategorySlug(slug: string): string {
  return CATEGORY_SLUG_ALIASES[slug] ?? slug;
}
