import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatFileSize, formatUploadedAt } from "../../domain"
import type { DocxFile } from "@/lib/types"

interface DocxFilePanelProps {
  file: DocxFile | null | undefined
  uploading: boolean
  onUploadClick: () => void
}

export function DocxFilePanel({ file, uploading, onUploadClick }: DocxFilePanelProps) {
  return (
    <div className="mb-6 rounded-md border border-dashed px-4 py-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium">DOCX file</p>
          {file ? (
            <p className="text-xs text-muted-foreground">
              {file.filename} · {formatFileSize(file.size)} · Uploaded {formatUploadedAt(file.uploadedAt)}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">No DOCX file uploaded yet.</p>
          )}
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={onUploadClick} disabled={uploading}>
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : file ? "Replace DOCX" : "Upload DOCX"}
        </Button>
      </div>
    </div>
  )
}
