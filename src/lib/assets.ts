const assetBasePath =
  process.env.NODE_ENV === "production" ? "/rockworld" : "";

export function getAssetPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${assetBasePath}${normalized}`;
}
