import { API_BASE_URL } from "./api-base-url"

const DEFAULT_FILENAME = "populated-assessment.docx"

const parseFilename = (header: string | null) => {
  if (!header) return DEFAULT_FILENAME
  const match = header.match(/filename\*?=(?:UTF-8'')?\"?([^\";]+)/i)
  if (!match) return DEFAULT_FILENAME
  return decodeURIComponent(match[1])
}

export class DocxPopulationService {
  static async populateAssessmentDocx(assessmentId: string): Promise<{ blob: Blob; filename: string }> {
    const response = await fetch(`${API_BASE_URL}/assessments/${assessmentId}/docx`, {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error(`Failed to populate DOCX: ${response.statusText}`)
    }

    const blob = await response.blob()
    const filename = parseFilename(response.headers.get("Content-Disposition"))

    return { blob, filename }
  }
}
