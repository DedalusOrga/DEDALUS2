export function makePageKey(pathname: string) {
  const clean = pathname.replace(/^\/+|\/+$/g, "");
  return clean ? clean.replaceAll("/", ":") : "home";
}
