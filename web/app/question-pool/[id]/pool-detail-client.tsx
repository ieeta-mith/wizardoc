"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Upload } from "lucide-react"
import { QuestionPoolService } from "@/lib/services/question-pool-service"
import type { QuestionPool } from "@/lib/types"

export function PoolDetailClient({ pool }: { pool: QuestionPool }) {
  const [currentPool, setCurrentPool] = useState(pool)
  const [questions, setQuestions] = useState(pool.questions || [])
  const [showAddForm, setShowAddForm] = useState(false)
  const [questionIdentifier, setQuestionIdentifier] = useState("")
  const [questionText, setQuestionText] = useState("")
  const [questionDomain, setQuestionDomain] = useState("")
  const [questionRiskType, setQuestionRiskType] = useState("")
  const [questionIsoRef, setQuestionIsoRef] = useState("")
  const [adding, setAdding] = useState(false)
  const [importing, setImporting] = useState(false)
  const [uploadingDocx, setUploadingDocx] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const docxInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setCurrentPool(pool)
    setQuestions(pool.questions || [])
  }, [pool])

  const resetQuestionForm = () => {
    setQuestionIdentifier("")
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
    if (
      !questionIdentifier.trim() ||
      !questionText.trim() ||
      !questionDomain.trim() ||
      !questionRiskType.trim() ||
      !questionIsoRef.trim()
    ) {
      setActionError("All fields are required to add a question.")
      return
    }

    setAdding(true)
    try {
      const updated = await QuestionPoolService.addQuestion(currentPool.id, {
        identifier: questionIdentifier.trim(),
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

  const parseCsvLine = (line: string) => {
    const cells: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === "\"") {
        // Toggle quote unless this is an escaped quote inside a quoted field
        if (inQuotes && line[i + 1] === "\"") {
          current += "\""
          i += 1
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === "," && !inQuotes) {
        cells.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    cells.push(current.trim())
    return cells
  }

  const parseCsvQuestions = (text: string) => {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
    if (lines.length < 2) return []
    const headers = parseCsvLine(lines[0]).map((h) => h.replace(/^\"|\"$/g, "").trim().toLowerCase())
    const colIndex = {
      identifier: headers.indexOf("identifier"),
      text: headers.indexOf("text"),
      domain: headers.indexOf("domain"),
      riskType: headers.indexOf("risktype"),
      isoReference: headers.indexOf("isoreference"),
    }
    if (Object.values(colIndex).some((i) => i === -1)) {
      throw new Error("CSV must include headers: identifier, text, domain, riskType, isoReference")
    }
    return lines.slice(1).map((line) => {
      const cells = parseCsvLine(line).map((c) => c.replace(/^\"|\"$/g, "").trim())
      return {
        identifier: cells[colIndex.identifier],
        text: cells[colIndex.text],
        domain: cells[colIndex.domain],
        riskType: cells[colIndex.riskType],
        isoReference: cells[colIndex.isoReference],
      }
    })
  }

  const formatFileSize = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B"
    const units = ["B", "KB", "MB", "GB"]
    let size = bytes
    let unitIndex = 0
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex += 1
    }
    const precision = size >= 100 ? 0 : size >= 10 ? 1 : 2
    return `${size.toFixed(precision)} ${units[unitIndex]}`
  }

  const formatUploadedAt = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString()
  }

  const handleDocxUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    if (!file.name.toLowerCase().endsWith(".docx")) {
      setActionError("Please select a .docx file.")
      return
    }
    setActionError(null)
    setUploadingDocx(true)
    try {
      const updated = await QuestionPoolService.uploadDocx(currentPool.id, file)
      if (!updated) {
        setActionError("Pool not found on server.")
        return
      }
      setCurrentPool(updated)
      setQuestions(updated.questions)
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setUploadingDocx(false)
    }
  }

  const handleBatchImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setActionError(null)
    setImporting(true)
    try {
      const csvText = await file.text()
      const parsedQuestions = parseCsvQuestions(csvText)
      if (parsedQuestions.length === 0) {
        setActionError("No questions found in CSV.")
        return
      }

      let updatedPool = currentPool
      for (const q of parsedQuestions) {
        if (!q.identifier || !q.text || !q.domain || !q.riskType || !q.isoReference) continue
        const next = await QuestionPoolService.addQuestion(updatedPool.id, q)
        if (!next) {
          setActionError("Pool not found on server.")
          return
        }
        updatedPool = next
      }
      setCurrentPool(updatedPool)
      setQuestions(updatedPool.questions)
      setShowAddForm(false)
      resetQuestionForm()
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setImporting(false)
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
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleBatchImport}
            />
            <input
              ref={docxInputRef}
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={handleDocxUpload}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              <Upload className="h-4 w-4" />
              {importing ? "Importing..." : "Batch Import"}
            </Button>
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 rounded-md border border-dashed px-4 py-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium">DOCX file</p>
                {currentPool.docxFile ? (
                  <p className="text-xs text-muted-foreground">
                    {currentPool.docxFile.filename} · {formatFileSize(currentPool.docxFile.size)} · Uploaded{" "}
                    {formatUploadedAt(currentPool.docxFile.uploadedAt)}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">No DOCX file uploaded yet.</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => docxInputRef.current?.click()}
                disabled={uploadingDocx}
              >
                <Upload className="h-4 w-4" />
                {uploadingDocx ? "Uploading..." : currentPool.docxFile ? "Replace DOCX" : "Upload DOCX"}
              </Button>
            </div>
          </div>
          {showAddForm && (
            <Card className="mb-6 bg-muted/50">
              <CardContent className="pt-6">
                <form className="grid gap-4" onSubmit={handleAddQuestion}>
                  <div className="grid gap-2">
                    <Label htmlFor="identifier">Identifier</Label>
                    <Input
                      id="identifier"
                      placeholder="e.g., Q-001"
                      value={questionIdentifier}
                      onChange={(e) => setQuestionIdentifier(e.target.value)}
                    />
                  </div>
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
                  <TableHead>Identifier</TableHead>
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
                    <TableCell className="font-mono text-sm">{question.identifier}</TableCell>
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
