import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AssessmentAnswerRow } from "../domain"

interface AssessmentAnswersTableProps {
  rows: AssessmentAnswerRow[]
}

export function AssessmentAnswersTable({ rows }: AssessmentAnswersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Question ID</TableHead>
            <TableHead>Identifier</TableHead>
            <TableHead>Question</TableHead>
            <TableHead>Answer</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Risk Type</TableHead>
            <TableHead>ISO Reference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-mono text-sm">{row.id}</TableCell>
              <TableCell className="font-mono text-sm">{row.question?.identifier ?? "—"}</TableCell>
              <TableCell className="max-w-md">{row.question?.text ?? "—"}</TableCell>
              <TableCell className="whitespace-pre-wrap">{row.answer || "—"}</TableCell>
              <TableCell>{row.question?.domain ?? "—"}</TableCell>
              <TableCell>{row.question?.riskType ?? "—"}</TableCell>
              <TableCell className="font-mono text-sm">{row.question?.isoReference ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
