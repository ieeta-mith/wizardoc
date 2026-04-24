export type JsonRow = Record<string, unknown>

export const parseJsonQuestions = (text: string): JsonRow[] => {
  const data: unknown = JSON.parse(text)
  if (!Array.isArray(data)) throw new Error("JSON must be an array of questions.")
  return data.filter(
    (row): row is JsonRow =>
      typeof row === "object" &&
      row !== null &&
      typeof (row as JsonRow).identifier === "string" &&
      typeof (row as JsonRow).text === "string"
  )
}
