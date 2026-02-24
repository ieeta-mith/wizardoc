const LOCAL_DEV_API_BASE_URL = "http://localhost:8000/api"
const PLUGIN_API_BASE_URL = "/wizardoc/api"

const trimTrailingSlash = (value: string) => (value.endsWith("/") ? value.slice(0, -1) : value)

const resolveApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return trimTrailingSlash(process.env.NEXT_PUBLIC_API_URL)
  }

  if (process.env.NODE_ENV === "development") {
    return LOCAL_DEV_API_BASE_URL
  }

  return PLUGIN_API_BASE_URL
}

export const API_BASE_URL = resolveApiBaseUrl()
