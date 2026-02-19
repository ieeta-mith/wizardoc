import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatMetadataValue, getQuestionMetadata, getQuestionMetadataKeys, toMetadataLabel } from "@/lib/question-metadata"
import type { AssessmentAnswerRow } from "../domain"

interface AssessmentAnswersTableProps {
  rows: AssessmentAnswerRow[]
}

export function AssessmentAnswersTable({ rows }: AssessmentAnswersTableProps) {
  const metadataKeys = Array.from(
    new Set(rows.flatMap((row) => getQuestionMetadataKeys(row.question)))
  )

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Question ID</TableHead>
            <TableHead>Identifier</TableHead>
            <TableHead>Question</TableHead>
            <TableHead>Answer</TableHead>
            {metadataKeys.map((key) => (
              <TableHead key={key}>{toMetadataLabel(key)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const metadata = getQuestionMetadata(row.question)
            return (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-sm">{row.id}</TableCell>
                <TableCell className="font-mono text-sm">{row.question?.identifier ?? "—"}</TableCell>
                <TableCell className="max-w-md">{row.question?.text ?? "—"}</TableCell>
                <TableCell className="whitespace-pre-wrap">{row.answer || "—"}</TableCell>
                {metadataKeys.map((key) => (
                  <TableCell key={`${row.id}-${key}`}>{formatMetadataValue(metadata[key])}</TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
