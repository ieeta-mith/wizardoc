"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2 } from "lucide-react"
import type { QuestionPool } from "@/lib/types"

export function PoolDetailClient({ pool }: { pool: QuestionPool }) {
  const [questions, setQuestions] = useState(pool.questions || [])
  const [showAddForm, setShowAddForm] = useState(false)

  const handleDelete = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId))
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{pool.name}</h1>
          <p className="text-muted-foreground mt-2">{pool.source}</p>
        </div>
        <Badge variant="secondary" className="text-base px-4 py-2">
          Current Questions: {pool.questionCount}
        </Badge>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Questions</CardTitle>
          <Button onClick={() => setShowAddForm(!showAddForm)} variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Manually Add
          </Button>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <Card className="mb-6 bg-muted/50">
              <CardContent className="pt-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="question-text">Question Text</Label>
                    <Input id="question-text" placeholder="Enter question text" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="domain">Domain</Label>
                      <Input id="domain" placeholder="e.g., Study Design" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="risk-type">Risk Type</Label>
                      <Input id="risk-type" placeholder="e.g., Protocol Deviation" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="iso-ref">ISO Reference</Label>
                      <Input id="iso-ref" placeholder="e.g., ISO 10001-3.2" />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setShowAddForm(false)}>Add Question</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question ID</TableHead>
                  <TableHead>Text</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Risk Type</TableHead>
                  <TableHead>ISO Reference</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-mono text-sm">{question.id}</TableCell>
                    <TableCell className="max-w-md">{question.text}</TableCell>
                    <TableCell>{question.domain}</TableCell>
                    <TableCell>{question.riskType}</TableCell>
                    <TableCell className="font-mono text-sm">{question.isoReference}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(question.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
