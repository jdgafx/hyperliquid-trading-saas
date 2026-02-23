import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { NotificationPreferencesForm } from "./notifications-preferenes-form"

export function NotificationPreferences() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Configure alerts for trading activity, strategy updates, and risk
          management.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <NotificationPreferencesForm />
      </CardContent>
    </Card>
  )
}
