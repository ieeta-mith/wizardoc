export const RISK_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const

export type RiskLevel = (typeof RISK_LEVELS)[keyof typeof RISK_LEVELS]

export const RISK_LEVEL_STYLES: Record<RiskLevel, string> = {
  [RISK_LEVELS.LOW]: "bg-success text-success-foreground",
  [RISK_LEVELS.MEDIUM]: "bg-warning text-warning-foreground",
  [RISK_LEVELS.HIGH]: "bg-destructive text-destructive-foreground",
}
