import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Question } from "@/lib/types"
import type { TableColumn } from "../../domain"
import { formatQuestionCellValue, getObjectValue, getQuestionCellClassName } from "../../domain"

interface QuestionsTableCardProps {
  columns: TableColumn[]
  questions: Question[]
  deletingId: string | null
  onDeleteQuestion: (questionId: string) => void
}

export function QuestionsTableCard({ columns, questions, deletingId, onDeleteQuestion }: QuestionsTableCardProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.length === 0 ? (
            <TableRow>
              <TableCell className="text-muted-foreground" colSpan={Math.max(columns.length + 1, 1)}>
                No questions available.
              </TableCell>
            </TableRow>
          ) : (
            questions.map((question) => (
              <TableRow key={question.id}>
                {columns.map((column) => (
                  <TableCell key={`${question.id}-${column.key}`} className={getQuestionCellClassName(column.key)}>
                    {formatQuestionCellValue(getObjectValue(question, column.key))}
                  </TableCell>
                ))}
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteQuestion(question.id)}
                    disabled={deletingId === question.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
