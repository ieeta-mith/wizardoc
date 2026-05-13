"use client"

import { useEffect, useRef, useState } from "react"
import { AssessmentService } from "@/lib/services/assessment-service"

export type LockState =
  | { status: "acquiring" }
  | { status: "acquired" }
  | { status: "denied"; lockedBy: string }
  | { status: "error" }

const HEARTBEAT_INTERVAL_MS = 120_000

export function useAssessmentLock(assessmentId: string) {
  const [lockState, setLockState] = useState<LockState>({ status: "acquiring" })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let cancelled = false

    const acquire = async () => {
      try {
        const result = await AssessmentService.acquireLock(assessmentId)
        if (cancelled) return

        if (result.acquired) {
          setLockState({ status: "acquired" })
          intervalRef.current = setInterval(() => {
            void AssessmentService.renewLock(assessmentId)
          }, HEARTBEAT_INTERVAL_MS)
        } else {
          setLockState({
            status: "denied",
            lockedBy: result.lock_owner_name ?? result.lock_owner_id ?? "Another user",
          })
        }
      } catch {
        if (!cancelled) setLockState({ status: "error" })
      }
    }

    void acquire()

    return () => {
      cancelled = true
      if (intervalRef.current) clearInterval(intervalRef.current)
      void AssessmentService.releaseLock(assessmentId)
    }
  }, [assessmentId])

  return { lockState }
}
