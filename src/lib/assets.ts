export function getAssetPath(path: string): string {
  if (!path.startsWith("/")) {
    path = "/" + path;
  }
  
  if (process.env.NODE_ENV === "production") {
    return "/rockworld" + path;
  }
  
  return path;
}
