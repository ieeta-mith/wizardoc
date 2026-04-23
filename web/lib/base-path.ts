const APP_BASE_PATH = "/wizardoc"

export function withBasePath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return normalizedPath.startsWith(APP_BASE_PATH)
    ? normalizedPath
    : `${APP_BASE_PATH}${normalizedPath}`
}

