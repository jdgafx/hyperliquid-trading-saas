import type { DictionaryType } from "@/lib/get-dictionary"

import {
  Auth,
  AuthDescription,
  AuthForm,
  AuthHeader,
  AuthTitle,
} from "./auth-layout"
import { RegisterForm } from "./register-form"

export function Register({ dictionary }: { dictionary: DictionaryType }) {
  return (
    <Auth
      imgSrc="/images/illustrations/misc/welcome.svg"
      dictionary={dictionary}
    >
      <AuthHeader>
        <AuthTitle>Get Started</AuthTitle>
        <AuthDescription>
          Set up your trading account in 3 quick steps
        </AuthDescription>
      </AuthHeader>
      <AuthForm>
        <RegisterForm />
      </AuthForm>
    </Auth>
  )
}
