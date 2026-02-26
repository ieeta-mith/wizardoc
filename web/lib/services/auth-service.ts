import type { CurrentUser } from "@/lib/types"
import { API_BASE_URL } from "./api-base-url"

export class AuthService {
  static async getCurrentUser(): Promise<CurrentUser | null> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      cache: "no-store",
      credentials: "include",
    })

    if (response.status === 401 || response.status === 403) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch current user: ${response.statusText}`)
    }

    return response.json()
  }
}
