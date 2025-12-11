"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useQuestionPools } from "@/hooks/use-question-pools"
import { QuestionPoolService } from "@/lib/services/question-pool-service"

export default function QuestionPoolPage() {
  const { pools, loading, error, refresh } = useQuestionPools()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [newPoolName, setNewPoolName] = useState("")
  const [newPoolSource, setNewPoolSource] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)

  const resetCreateForm = () => {
    setNewPoolName("")
    setNewPoolSource("")
    setShowCreateForm(false)
  }

  const handleCreatePool = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setActionError(null)

    if (!newPoolName.trim() || !newPoolSource.trim()) {
      setActionError("Name and source are required to create a pool.")
      return
    }

    setCreating(true)
    try {
      await QuestionPoolService.create({
        name: newPoolName.trim(),
        source: newPoolSource.trim(),
        questionCount: 0,
        questions: [],
      })
      await refresh()
      resetCreateForm()
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    setActionError(null)
    const confirmed = window.confirm("Delete this question pool? This cannot be undone.")
    if (!confirmed) return

    setDeletingId(id)
    try {
      await QuestionPoolService.delete(id)
      await refresh()
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Question Pool Manager</h1>
          <p className="text-muted-foreground mt-2">Loading question pools...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading pools: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Question Pool Manager</h1>
        <p className="text-muted-foreground mt-2">Manage your ISO/ICH question sets for risk assessments</p>
      </div>

      <div className="space-y-4">
        {actionError && (
          <Alert variant="destructive">
            <AlertTitle>Action failed</AlertTitle>
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {pools.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">
                No question pools yet. Create your first pool to begin.
              </CardContent>
            </Card>
          ) : (
            pools.map((pool) => (
              <Card key={pool.id} className="relative">
                <CardHeader>
                  <CardTitle className="text-xl">{pool.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{pool.source}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Badge variant="secondary" className="text-sm">
                      Current Questions: {pool.questionCount}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/question-pool/${pool.id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleDelete(pool.id)}
                      disabled={deletingId === pool.id}
                    >
                      {deletingId === pool.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {showCreateForm ? (
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>Create New Pool</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreatePool}>
                <div className="space-y-2">
                  <Label htmlFor="pool-name">Pool Name</Label>
                  <Input
                    id="pool-name"
                    value={newPoolName}
                    onChange={(e) => setNewPoolName(e.target.value)}
                    placeholder="e.g., ISO 14155:2020 Medical Devices"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pool-source">Source / Standard</Label>
                  <Input
                    id="pool-source"
                    value={newPoolSource}
                    onChange={(e) => setNewPoolSource(e.target.value)}
                    placeholder="e.g., ISO 14155"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={resetCreateForm} disabled={creating}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? "Creating..." : "Create Pool"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="flex justify-center pt-4">
            <Button size="lg" className="gap-2" onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4" />
              Create New Pool
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
