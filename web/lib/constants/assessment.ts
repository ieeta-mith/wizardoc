export enum AssessmentStatus {
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
  ARCHIVED = "archived",
}

export const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, string> = {
  [AssessmentStatus.IN_PROGRESS]: "In Progress",
  [AssessmentStatus.COMPLETED]: "Completed",
  [AssessmentStatus.ARCHIVED]: "Archived",
}

export const ASSESSMENT_STATUS_STYLES: Record<AssessmentStatus, string> = {
  [AssessmentStatus.IN_PROGRESS]: "border-warning bg-warning/5",
  [AssessmentStatus.COMPLETED]: "border-success bg-success/5",
  [AssessmentStatus.ARCHIVED]: "border-muted bg-muted/5",
}
