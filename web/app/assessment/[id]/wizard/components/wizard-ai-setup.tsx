"use client"

import { useRef, useState } from "react"
import { Bot, Loader2, Paperclip, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AiService } from "@/lib/services/ai-service"

interface WizardAiSetupProps {
  onConfirm: (sessionId: string | null) => void
}

export function WizardAiSetup({ onConfirm }: WizardAiSetupProps) {
  const [enabled, setEnabled] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []).slice(0, 2)
    setFiles(selected)
    e.target.value = ""
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleStart = async () => {
    if (!enabled) {
      onConfirm(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const sessionId = await AiService.createSession()
      for (const file of files) {
        await AiService.uploadDocument(sessionId, file)
      }
      onConfirm(sessionId)
    } catch {
      setError("Could not connect to AI service. You can continue without AI assistance.")
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Assistance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Enable AI assistance to get contextual answer suggestions as you fill in the wizard.
            Suggestions are advisory — you must review and accept them before they are recorded.
          </p>

          {/* Toggle */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={() => setEnabled((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                enabled ? "bg-primary" : "bg-input"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm font-medium">
              {enabled ? "AI assistance enabled" : "AI assistance disabled"}
            </span>
          </div>

          {/* File upload (only when enabled) */}
          {enabled && (
            <div className="space-y-3">
              <p className="text-sm font-medium">
                Reference documents{" "}
                <span className="font-normal text-muted-foreground">(optional, max 2)</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Upload 1–2 documents the AI should use as context when suggesting answers. Supports
                PDF, DOCX, and plain text.
              </p>

              {files.length < 2 && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                    Browse files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </>
              )}

              {files.length > 0 && (
                <ul className="space-y-2">
                  {files.map((file, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                    >
                      <span className="truncate max-w-xs">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFile(i)}
                        aria-label="Remove file"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3">
            <Button onClick={handleStart} disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Setting up…
                </>
              ) : (
                "Start Wizard"
              )}
            </Button>
            {error && (
              <Button variant="outline" onClick={() => onConfirm(null)}>
                Continue without AI
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
