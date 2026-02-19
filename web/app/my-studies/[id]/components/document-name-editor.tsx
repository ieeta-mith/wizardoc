"use client"

import { useEffect, useState } from "react"
import { Check, Pencil, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DocumentNameEditorProps {
  assessmentId: string
  name: string
  isRenaming: boolean
  errorMessage?: string
  onRename: (assessmentId: string, name: string) => Promise<boolean>
}

export function DocumentNameEditor({
  assessmentId,
  name,
  isRenaming,
  errorMessage,
  onRename,
}: DocumentNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState(name)

  useEffect(() => {
    setDraftName(name)
  }, [name])

  const save = async () => {
    const ok = await onRename(assessmentId, draftName)
    if (ok) {
      setIsEditing(false)
    }
  }

  return (
    <div className="mb-1">
      {isEditing ? (
        <div className="flex max-w-md items-center gap-1">
          <Input
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            className="h-8"
            maxLength={120}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                void save()
              }
              if (event.key === "Escape") {
                setDraftName(name)
                setIsEditing(false)
              }
            }}
          />
          <Button type="button" size="icon-sm" onClick={() => void save()} disabled={isRenaming}>
            <Check className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={() => {
              setDraftName(name)
              setIsEditing(false)
            }}
            disabled={isRenaming}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <h4 className="font-semibold">{name}</h4>
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => setIsEditing(true)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
    </div>
  )
}
