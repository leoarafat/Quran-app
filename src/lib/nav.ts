/** Is the nav item `href` the active section for `pathname`? */
export function isActivePath(href: string, pathname: string): boolean {
  const clean = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);
  const target = clean(href);
  const path = clean(pathname);
  if (target === "/") return path === "/";
  return path === target || path.startsWith(`${target}/`);
}

/** A surah page, where the reader takes the whole phone screen. */
export function isReaderPath(pathname: string): boolean {
  return /^\/quran\/\d+\/?$/.test(pathname);
}
