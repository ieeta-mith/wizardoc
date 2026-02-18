export const normalizeHeaderToken = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "")

export const toColumnLabel = (key: string) => {
  const withSpaces = key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").trim()
  return withSpaces ? withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1) : key
}
