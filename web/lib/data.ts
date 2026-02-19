import type { QuestionPool, Study, Assessment } from "./types"

// Mock data for question pools
export const mockQuestionPools: QuestionPool[] = [
  {
    id: "1",
    name: "Pool 1",
    source: "Imported from ISO 10001",
    questionCount: 4,
    questions: [
      {
        id: "q1",
        identifier: "q1",
        text: "What is the primary objective of this study?",
        domain: "Study Design",
        riskType: "Protocol Deviation",
        isoReference: "ISO 10001-3.2",
      },
      {
        id: "q2",
        identifier: "q2",
        text: "How will patient safety be monitored?",
        domain: "Safety",
        riskType: "Patient Safety",
        isoReference: "ISO 10001-4.1",
      },
      {
        id: "q3",
        identifier: "q3",
        text: "What are the inclusion criteria?",
        domain: "Patient Selection",
        riskType: "Eligibility",
        isoReference: "ISO 10001-2.5",
      },
      {
        id: "q4",
        identifier: "q4",
        text: "Describe the data collection methodology",
        domain: "Data Management",
        riskType: "Data Quality",
        isoReference: "ISO 10001-5.3",
      },
    ],
  },
  {
    id: "2",
    name: "Pool 2",
    source: "Imported from ISO 9999",
    questionCount: 2,
    questions: [
      {
        id: "q5",
        identifier: "q5",
        text: "What statistical methods will be used?",
        domain: "Statistics",
        riskType: "Analysis",
        isoReference: "ISO 9999-6.1",
      },
      {
        id: "q6",
        identifier: "q6",
        text: "How will adverse events be reported?",
        domain: "Safety",
        riskType: "Reporting",
        isoReference: "ISO 9999-4.2",
      },
    ],
  },
]

// Mock data for studies
export const mockStudies: Study[] = [
  {
    id: "1",
    name: "Study 1",
    phase: "Phase III",
    category: "Cardiology",
    studyQuestion: "A study about something interesting. Lorem ipsum dolor sit amet, consectetur adipisci.",
    poolId: "1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
  },
]

// Mock data for assessments
export const mockAssessments: Assessment[] = [
  {
    id: "1",
    studyId: "1",
    name: "Assessment 1",
    progress: 100,
    totalQuestions: 4,
    answeredQuestions: 4,
    status: "completed",
    answers: {},
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-18"),
  },
  {
    id: "2",
    studyId: "1",
    name: "Assessment 2 (incomplete)",
    progress: 30,
    totalQuestions: 4,
    answeredQuestions: 1,
    status: "in-progress",
    answers: {},
    createdAt: new Date("2024-01-19"),
    updatedAt: new Date("2024-01-20"),
  },
]
