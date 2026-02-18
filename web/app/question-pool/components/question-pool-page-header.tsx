interface QuestionPoolPageHeaderProps {
  title: string
  subtitle: string
}

export function QuestionPoolPageHeader({ title, subtitle }: QuestionPoolPageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground mt-2">{subtitle}</p>
    </div>
  )
}
