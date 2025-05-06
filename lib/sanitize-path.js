export function sanitizePath(path) {
  return path.replace(/^["'](.+)["']$/, "$1").trim();
}
