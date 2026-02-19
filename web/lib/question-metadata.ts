import type { Question } from "./types"

const BASE_QUESTION_KEYS = new Set(["id", "identifier", "text"])

export const toMetadataLabel = (key: string) => {
  const withSpaces = key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").trim()
  return withSpaces ? withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1) : key
}

export const formatMetadataValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export const getQuestionMetadata = (question: Question | null | undefined): Record<string, unknown> => {
  if (!question) return {}

  return Object.entries(question as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [key, value]) => {
    if (BASE_QUESTION_KEYS.has(key)) return acc
    acc[key] = value
    return acc
  }, {})
}

export const getQuestionMetadataKeys = (question: Question | null | undefined): string[] =>
  Object.keys(getQuestionMetadata(question))
