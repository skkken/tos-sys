import { redirect } from "next/navigation"
import { createAuthServerClient } from "@/lib/supabase/auth-server"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage() {
  const supabase = await createAuthServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">ログイン</h1>
          <p className="text-sm text-muted-foreground">
            メールアドレスとパスワードを入力してください
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
