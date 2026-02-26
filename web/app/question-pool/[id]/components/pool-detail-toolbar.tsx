import { Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PoolDetailToolbarProps {
  clearingEntries: boolean
  importing: boolean
  canManageTemplates: boolean
  onBatchImportClick: () => void
  onClearEntriesClick: () => void
}

export function PoolDetailToolbar({
  clearingEntries,
  importing,
  canManageTemplates,
  onBatchImportClick,
  onClearEntriesClick,
}: PoolDetailToolbarProps) {
  if (!canManageTemplates) {
    return null
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={onBatchImportClick}
        disabled={importing}
      >
        <Upload className="h-4 w-4" />
        {importing ? "Importing..." : "Batch Import"}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        className="gap-2"
        onClick={onClearEntriesClick}
        disabled={clearingEntries || importing}
      >
        <Trash2 className="h-4 w-4" />
        {clearingEntries ? "Clearing..." : "Clear Questions"}
      </Button>
    </div>
  )
}
