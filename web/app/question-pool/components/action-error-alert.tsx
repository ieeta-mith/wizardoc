import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ActionErrorAlertProps {
  message: string
}

export function ActionErrorAlert({ message }: ActionErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Action failed</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
