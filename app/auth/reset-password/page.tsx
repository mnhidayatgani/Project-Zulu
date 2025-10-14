"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useState } from "react"
import { HeaderGoBack } from "../../components/header-go-back"

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState("")

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    if (!supabase) {
      setError("Supabase is not configured")
      return
    }

    if (!email) {
      setError("Please enter your email address")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      await resetPassword(supabase, email)
      setSuccess(true)
    } catch (err: unknown) {
      console.error("Error resetting password:", err)
      setError(
        (err as Error).message ||
          "Failed to send reset email. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-background flex h-dvh w-full flex-col">
      <HeaderGoBack href="/auth" />

      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl">
              Reset Password
            </h1>
            <p className="text-muted-foreground mt-3">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="bg-green-500/10 text-green-600 dark:text-green-400 rounded-md p-4 text-sm">
                <p className="font-medium">Check your email!</p>
                <p className="mt-1">
                  We've sent a password reset link to <strong>{email}</strong>.
                  Please check your inbox and follow the instructions.
                </p>
              </div>
              <div className="text-center">
                <Link
                  href="/auth"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              <div className="text-center">
                <Link
                  href="/auth"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
