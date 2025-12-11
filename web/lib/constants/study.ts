export const STUDY_PHASES = [
  { value: "phase-1", label: "Phase I" },
  { value: "phase-2", label: "Phase II" },
  { value: "phase-3", label: "Phase III" },
  { value: "phase-4", label: "Phase IV" },
  { value: "observational", label: "Observational" },
] as const

export type StudyPhaseValue = (typeof STUDY_PHASES)[number]["value"]
