import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart as RePieChart, XAxis, YAxis } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Assessment } from "@/lib/types"

const chartConfig = {
  count: {
    label: "Count",
    color: "hsl(var(--chart-1))",
  },
}

interface AnalyticsTabProps {
  assessments: Assessment[]
  domainData: Array<{ domain: string; count: number; fill: string }>
  riskTypeData: Array<{ riskType: string; count: number }>
  stats: {
    total: number
    completedCount: number
    inProgressCount: number
    averageCompletion: number
  }
}

export function AnalyticsTab({ assessments, domainData, riskTypeData, stats }: AnalyticsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Document Overview</CardTitle>
            <CardDescription>Summary of all documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Documents</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-success">{stats.completedCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-warning">{stats.inProgressCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Avg. Completion</p>
                <p className="text-2xl font-bold">{stats.averageCompletion}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions by Domain</CardTitle>
            <CardDescription>Distribution across risk domains</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <RePieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={domainData} dataKey="count" nameKey="domain" cx="50%" cy="50%" outerRadius={80}>
                  {domainData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </RePieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Risk Types Distribution</CardTitle>
          <CardDescription>Breakdown of questions by risk type</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={riskTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="riskType" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Details</CardTitle>
          <CardDescription>Detailed view of all documents</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell className="font-medium">{assessment.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={assessment.status === "completed" ? "default" : "outline"}
                      className={
                        assessment.status === "completed"
                          ? "bg-success text-success-foreground"
                          : "border-warning text-warning"
                      }
                    >
                      {assessment.status === "completed" ? "Completed" : "In Progress"}
                    </Badge>
                  </TableCell>
                  <TableCell>{assessment.progress}%</TableCell>
                  <TableCell>
                    {assessment.answeredQuestions}/{assessment.totalQuestions}
                  </TableCell>
                  <TableCell>{assessment.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>{assessment.updatedAt.toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
