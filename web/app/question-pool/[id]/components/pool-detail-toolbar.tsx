import { Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PoolDetailToolbarProps {
  importing: boolean
  onBatchImportClick: () => void
  onToggleAddForm: () => void
}

export function PoolDetailToolbar({ importing, onBatchImportClick, onToggleAddForm }: PoolDetailToolbarProps) {
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
    </div>
  )
}
