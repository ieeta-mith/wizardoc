import { Plus, Trash2 } from "lucide-react"
import { useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { TableColumn } from "@/lib/types"

interface TableRow {
  _id: string
  [key: string]: string
}

interface WizardTableInputProps {
  columns: TableColumn[]
  value: string
  onChange: (json: string) => void
}

function emptyRow(columns: TableColumn[], id = crypto.randomUUID()): TableRow {
  return columns.reduce<TableRow>((acc, col) => {
    acc[col.key] = ""
    return acc
  }, { _id: id })
}

function parseRows(value: string, columns: TableColumn[], defaultRowId: string): TableRow[] {
  if (!value) return [emptyRow(columns, defaultRowId)]
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Keep keys stable across renders to avoid remounting inputs and losing focus.
      return parsed.map((row: Record<string, string>, index: number) => ({
        _id: row._id ?? `row-${index}`,
        ...row,
      }))
    }
  } catch {
    // fall through
  }
  return [emptyRow(columns, defaultRowId)]
}

export function WizardTableInput({ columns, value, onChange }: WizardTableInputProps) {
  const defaultRowIdRef = useRef<string>(crypto.randomUUID())
  const rows = useMemo(
    () => parseRows(value, columns, defaultRowIdRef.current),
    [columns, value]
  )

  const updateRow = (rowIndex: number, colKey: string, cellValue: string) => {
    const next = rows.map((row, i) =>
      i === rowIndex ? { ...row, [colKey]: cellValue } : row
    )
    onChange(JSON.stringify(next))
  }

  const addRow = () => {
    onChange(JSON.stringify([...rows, emptyRow(columns)]))
  }

  const removeRow = (rowIndex: number) => {
    const next = rows.filter((_, i) => i !== rowIndex)
    onChange(JSON.stringify(next.length > 0 ? next : [emptyRow(columns)]))
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-2 text-left font-medium text-muted-foreground"
                >
                  {col.label}
                </th>
              ))}
              <th className="w-10 px-3 py-2" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row._id} className="border-b last:border-0">
                {columns.map((col) => (
                  <td key={col.key} className="px-2 py-1.5">
                    <Input
                      value={row[col.key] ?? ""}
                      onChange={(e) => updateRow(rowIndex, col.key, e.target.value)}
                      placeholder={col.label}
                      className="h-8 border-0 bg-transparent px-1 shadow-none focus-visible:ring-1"
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5">
                  <button
                    type="button"
                    aria-label="Remove row"
                    onClick={() => removeRow(rowIndex)}
                    disabled={rows.length === 1}
                    className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-2">
        <Plus className="h-3.5 w-3.5" />
        Add row
      </Button>
    </div>
  )
}
