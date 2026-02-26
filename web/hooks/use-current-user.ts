"use client"

import { useEffect, useState } from "react"
import type { CurrentUser } from "@/lib/types"
import { AuthService } from "@/lib/services/auth-service"

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    AuthService.getCurrentUser()
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return {
    user,
    loading,
    error,
    isAdmin: Boolean(user?.is_admin),
  }
}
