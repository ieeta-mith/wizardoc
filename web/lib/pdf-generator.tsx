import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import type { Assessment, Study, QuestionPool } from "./types"

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2 solid #000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    fontWeight: "bold",
    width: 120,
  },
  infoValue: {
    flex: 1,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: 8,
    fontWeight: "bold",
    borderBottom: "1 solid #000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #e0e0e0",
    padding: 8,
    minHeight: 30,
  },
  tableRowAlt: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderBottom: "1 solid #e0e0e0",
    padding: 8,
    minHeight: 30,
  },
  colQuestion: {
    width: "40%",
    paddingRight: 5,
  },
  colDomain: {
    width: "15%",
    paddingRight: 5,
  },
  colRiskType: {
    width: "15%",
    paddingRight: 5,
  },
  colISO: {
    width: "10%",
    paddingRight: 5,
  },
  colAnswer: {
    width: "20%",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#888",
    fontSize: 8,
    borderTop: "1 solid #e0e0e0",
    paddingTop: 10,
  },
})

interface PDFDocumentProps {
  assessment: Assessment
  study: Study | null
  questionPools: QuestionPool[]
}

export const AssessmentPDFDocument = ({ assessment, study, questionPools }: PDFDocumentProps) => {
  // Get question details for each answer
  const getQuestionDetails = (questionId: string) => {
    for (const pool of questionPools) {
      const question = pool.questions.find((q) => q.id === questionId)
      if (question) return question
    }
    return null
  }

  const answersArray = Object.entries(assessment.answers).map(([qId, answer]) => ({
    questionId: qId,
    answer,
    question: getQuestionDetails(qId),
  }))

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Document Report</Text>
          <Text style={styles.subtitle}>{study?.name || "N/A"}</Text>
        </View>

        {/* Assessment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Document Name:</Text>
            <Text style={styles.infoValue}>{assessment.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={styles.infoValue}>{assessment.status}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Progress:</Text>
            <Text style={styles.infoValue}>{assessment.progress}%</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Questions Answered:</Text>
            <Text style={styles.infoValue}>
              {assessment.answeredQuestions} / {assessment.totalQuestions}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created:</Text>
            <Text style={styles.infoValue}>{assessment.createdAt.toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Updated:</Text>
            <Text style={styles.infoValue}>{assessment.updatedAt.toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Generated:</Text>
            <Text style={styles.infoValue}>{new Date().toLocaleString()}</Text>
          </View>
        </View>

        {/* Project Information */}
        {study && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phase:</Text>
              <Text style={styles.infoValue}>{study.phase}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Therapeutic Area:</Text>
              <Text style={styles.infoValue}>{study.therapeuticArea}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Project Objective:</Text>
              <Text style={styles.infoValue}>{study.studyQuestion}</Text>
            </View>
          </View>
        )}

        {/* Document Details Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Details</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.colQuestion}>Question</Text>
              <Text style={styles.colDomain}>Domain</Text>
              <Text style={styles.colRiskType}>Risk Type</Text>
              <Text style={styles.colISO}>ISO Ref</Text>
              <Text style={styles.colAnswer}>Answer</Text>
            </View>

            {/* Table Rows */}
            {answersArray.map((item, index) => (
              <View key={item.questionId} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={styles.colQuestion}>{item.question?.text || item.questionId}</Text>
                <Text style={styles.colDomain}>{item.question?.domain || "N/A"}</Text>
                <Text style={styles.colRiskType}>{item.question?.riskType || "N/A"}</Text>
                <Text style={styles.colISO}>{item.question?.isoReference || "N/A"}</Text>
                <Text style={styles.colAnswer}>{item.answer}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Generated with WizarDoc | {new Date().toLocaleDateString()} | Page 1
          </Text>
        </View>
      </Page>
    </Document>
  )
}
