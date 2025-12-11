"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2 } from "lucide-react"
import { QuestionPoolService } from "@/lib/services/question-pool-service"
import type { QuestionPool } from "@/lib/types"

export function PoolDetailClient({ pool }: { pool: QuestionPool }) {
  const [currentPool, setCurrentPool] = useState(pool)
  const [questions, setQuestions] = useState(pool.questions || [])
  const [showAddForm, setShowAddForm] = useState(false)
  const [questionText, setQuestionText] = useState("")
  const [questionDomain, setQuestionDomain] = useState("")
  const [questionRiskType, setQuestionRiskType] = useState("")
  const [questionIsoRef, setQuestionIsoRef] = useState("")
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    setCurrentPool(pool)
    setQuestions(pool.questions || [])
  }, [pool])

  const resetQuestionForm = () => {
    setQuestionText("")
    setQuestionDomain("")
    setQuestionRiskType("")
    setQuestionIsoRef("")
  }

  const handleDelete = async (questionId: string) => {
    setActionError(null)
    setDeletingId(questionId)
    try {
      const updated = await QuestionPoolService.deleteQuestion(currentPool.id, questionId)
      if (!updated) {
        setActionError("Pool not found on server.")
        return
      }
      setCurrentPool(updated)
      setQuestions(updated.questions)
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleAddQuestion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setActionError(null)
    if (!questionText.trim() || !questionDomain.trim() || !questionRiskType.trim() || !questionIsoRef.trim()) {
      setActionError("All fields are required to add a question.")
      return
    }

    setAdding(true)
    try {
      const updated = await QuestionPoolService.addQuestion(currentPool.id, {
        text: questionText.trim(),
        domain: questionDomain.trim(),
        riskType: questionRiskType.trim(),
        isoReference: questionIsoRef.trim(),
      })
      if (!updated) {
        setActionError("Pool not found on server.")
        return
      }
      setCurrentPool(updated)
      setQuestions(updated.questions)
      resetQuestionForm()
      setShowAddForm(false)
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setAdding(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{currentPool.name}</h1>
          <p className="text-muted-foreground mt-2">{currentPool.source}</p>
        </div>
        <Badge variant="secondary" className="text-base px-4 py-2">
          Current Questions: {currentPool.questionCount}
        </Badge>
      </div>

      {actionError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Action failed</AlertTitle>
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Questions</CardTitle>
          <Button
            onClick={() => {
              setActionError(null)
              setShowAddForm(!showAddForm)
            }}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Manually Add
          </Button>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <Card className="mb-6 bg-muted/50">
              <CardContent className="pt-6">
                <form className="grid gap-4" onSubmit={handleAddQuestion}>
                  <div className="grid gap-2">
                    <Label htmlFor="question-text">Question Text</Label>
                    <Input
                      id="question-text"
                      placeholder="Enter question text"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="domain">Domain</Label>
                      <Input
                        id="domain"
                        placeholder="e.g., Study Design"
                        value={questionDomain}
                        onChange={(e) => setQuestionDomain(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="risk-type">Risk Type</Label>
                      <Input
                        id="risk-type"
                        placeholder="e.g., Protocol Deviation"
                        value={questionRiskType}
                        onChange={(e) => setQuestionRiskType(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="iso-ref">ISO Reference</Label>
                      <Input
                        id="iso-ref"
                        placeholder="e.g., ISO 10001-3.2"
                        value={questionIsoRef}
                        onChange={(e) => setQuestionIsoRef(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetQuestionForm()
                        setShowAddForm(false)
                      }}
                      disabled={adding}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={adding}>
                      {adding ? "Adding..." : "Add Question"}
                    </Button>
                  </div>
                </form>
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
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(question.id)}
                        disabled={deletingId === question.id}
                      >
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
