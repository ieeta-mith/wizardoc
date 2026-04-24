import type { ShareableUser } from "@/lib/types"
import { API_BASE_URL } from "./api-base-url"

export class UserService {
  static async search(q: string): Promise<ShareableUser[]> {
    if (q.length < 2) return []
    const response = await fetch(`${API_BASE_URL}/users/search?q=${encodeURIComponent(q)}`)
    if (!response.ok) return []
    return response.json()
  }
}
