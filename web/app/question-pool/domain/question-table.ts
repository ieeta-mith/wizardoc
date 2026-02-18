import { normalizeHeaderToken, toColumnLabel } from "./headers"

export interface TableColumn {
  key: string
  label: string
}

export const getQuestionCellClassName = (key: string) => {
  const normalized = normalizeHeaderToken(key)
  if (normalized === "id" || normalized === "identifier" || normalized.includes("reference")) {
    return "font-mono text-sm"
  }
  if (normalized === "text" || normalized.includes("question")) {
    return "max-w-md"
  }
  return undefined
}

export const formatQuestionCellValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  if (value instanceof Date) return value.toLocaleString()

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export const getObjectValue = <T extends object>(item: T, key: string): unknown =>
  (item as Record<string, unknown>)[key]

export const buildQuestionTableColumns = <T extends object>(
  questions: T[],
  headers: unknown
): TableColumn[] => {
  const orderedKeys: string[] = []
  const seenKeys = new Set<string>()

  for (const question of questions) {
    for (const key of Object.keys(question)) {
      if (seenKeys.has(key)) continue
      seenKeys.add(key)
      orderedKeys.push(key)
    }
  }

  if (Array.isArray(headers)) {
    const columns: TableColumn[] = []
    const usedKeys = new Set<string>()

    for (const header of headers) {
      if (typeof header !== "string") continue
      const label = header.trim()
      if (!label) continue

      const matchedKey =
        orderedKeys.find((key) => key === label) ??
        orderedKeys.find((key) => normalizeHeaderToken(key) === normalizeHeaderToken(label)) ??
        label

      if (usedKeys.has(matchedKey)) continue
      usedKeys.add(matchedKey)
      columns.push({ key: matchedKey, label })
    }

    if (columns.length > 0) return columns
  }

  return orderedKeys.map((key) => ({ key, label: toColumnLabel(key) }))
}
