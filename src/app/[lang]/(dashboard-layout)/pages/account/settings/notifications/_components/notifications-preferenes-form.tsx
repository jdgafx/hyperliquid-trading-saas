"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import type { FieldPath, UseFormReturn } from "react-hook-form"
import type { NotificationPreferencesFormType } from "../../../types"

import { NotificationPreferencesSchema } from "../_schemas/notifications-preferenes-schema"

import { Button, ButtonLoading } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"

export function NotificationPreferencesForm() {
  const form = useForm<NotificationPreferencesFormType>({
    resolver: zodResolver(NotificationPreferencesSchema),
    defaultValues: {
      security: {
        email: true,
        browser: false,
        sms: false,
      },
      communication: {
        email: true,
        browser: false,
        sms: false,
      },
      meetups: {
        email: true,
        browser: false,
        sms: false,
      },
    },
  })

  const { isSubmitting, isDirty } = form.formState
  const isDisabled = isSubmitting || !isDirty // Disable button if form is unchanged or submitting

  function onSubmit(_data: NotificationPreferencesFormType) {}

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-y-3">
        <FormField
          control={form.control}
          name="security"
          render={({ field }) => (
            <FormItem className="flex justify-between items-center gap-8">
              <div>
                <FormLabel>Trade Alerts</FormLabel>
                <FormDescription>
                  Get notified when strategies open or close positions,
                  including entry/exit prices and P&L.
                </FormDescription>
              </div>
              <FormControl>
                <ChangeButton form={form} field={field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="communication"
          render={({ field }) => (
            <FormItem className="flex justify-between items-center gap-8">
              <div>
                <FormLabel>Strategy Status</FormLabel>
                <FormDescription>
                  Receive updates when strategies start, stop, or encounter
                  errors.
                </FormDescription>
              </div>
              <FormControl>
                <ChangeButton form={form} field={field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="meetups"
          render={({ field }) => (
            <FormItem className="flex justify-between items-center gap-8">
              <div>
                <FormLabel>Risk & Drawdown Warnings</FormLabel>
                <FormDescription>
                  Alert when drawdown exceeds thresholds or unusual market
                  conditions are detected.
                </FormDescription>
              </div>
              <FormControl>
                <ChangeButton form={form} field={field} />
              </FormControl>
            </FormItem>
          )}
        />

        <ButtonLoading
          isLoading={isSubmitting}
          disabled={isDisabled}
          className="mt-2 w-fit"
        >
          Save
        </ButtonLoading>
      </form>
    </Form>
  )
}

interface ChangeButtonProps {
  form: UseFormReturn<NotificationPreferencesFormType>
  field: {
    name: FieldPath<NotificationPreferencesFormType>
    value: { email: boolean; browser: boolean; sms: boolean }
  }
}

function ChangeButton({ form, field }: ChangeButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Change</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem
          checked={field.value.email}
          onCheckedChange={() =>
            form.setValue(
              field.name,
              {
                ...field.value,
                email: !field.value.email,
              },
              { shouldDirty: true }
            )
          }
        >
          Email
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={field.value.browser}
          onCheckedChange={() =>
            form.setValue(
              field.name,
              {
                ...field.value,
                browser: !field.value.browser,
              },
              { shouldDirty: true }
            )
          }
        >
          Browser
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={field.value.sms}
          onCheckedChange={() =>
            form.setValue(
              field.name,
              {
                ...field.value,
                sms: !field.value.sms,
              },
              { shouldDirty: true }
            )
          }
        >
          SMS
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
