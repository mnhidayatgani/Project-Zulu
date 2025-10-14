"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "@/lib/api"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { HeaderGoBack } from "../components/header-go-back"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleSignInWithGoogle() {
    const supabase = createClient()

    if (!supabase) {
      setError("Supabase is not configured")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const data = await signInWithGoogle(supabase)

      // Redirect to the provider URL
      if (data?.url) {
        window.location.href = data.url
      } else {
        setError("Failed to get authentication URL. Please try again.")
      }
    } catch (err: unknown) {
      console.error("Error signing in with Google:", err)
      setError(
        (err as Error).message ||
          "An unexpected error occurred. Please try again."
      )
      setIsLoading(false)
    }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    if (!supabase) {
      setError("Supabase is not configured")
      return
    }

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      await signInWithEmail(supabase, email, password)
      setSuccess("Sign in successful! Redirecting...")
      
      // Redirect to home page
      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 1000)
    } catch (err: unknown) {
      console.error("Error signing in with email:", err)
      const errorMessage = (err as Error).message
      if (errorMessage.includes("Invalid login credentials")) {
        setError("Invalid email or password")
      } else if (errorMessage.includes("Email not confirmed")) {
        setError("Please verify your email address first")
      } else {
        setError(errorMessage || "Failed to sign in. Please try again.")
      }
      setIsLoading(false)
    }
  }

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    if (!supabase) {
      setError("Supabase is not configured")
      return
    }

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      const { user } = await signUpWithEmail(supabase, email, password)
      
      if (user) {
        setSuccess(
          "Account created! Please check your email to verify your account."
        )
        setEmail("")
        setPassword("")
      } else {
        setSuccess(
          "Sign up successful! Please check your email to verify your account."
        )
      }
    } catch (err: unknown) {
      console.error("Error signing up with email:", err)
      const errorMessage = (err as Error).message
      if (errorMessage.includes("already registered")) {
        setError("This email is already registered. Please sign in instead.")
      } else {
        setError(errorMessage || "Failed to create account. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-background flex h-dvh w-full flex-col">
      <HeaderGoBack href="/" />

      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl">
              Welcome to Zola
            </h1>
            <p className="text-muted-foreground mt-3">
              Sign in below to increase your message limits.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 text-green-600 dark:text-green-400 rounded-md p-3 text-sm">
              {success}
            </div>
          )}

          <Tabs defaultValue="oauth" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="oauth">Quick Sign In</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="oauth" className="space-y-4">
              <Button
                variant="secondary"
                className="w-full text-base sm:text-base"
                size="lg"
                onClick={handleSignInWithGoogle}
                disabled={isLoading}
              >
                <Image
                  src="https://www.google.com/favicon.ico"
                  alt="Google logo"
                  width={20}
                  height={20}
                  className="mr-2 size-4"
                />
                <span>
                  {isLoading ? "Connecting..." : "Continue with Google"}
                </span>
              </Button>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleEmailSignIn} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                    <div className="text-center">
                      <Link
                        href="/auth/reset-password"
                        className="text-muted-foreground hover:text-foreground text-sm"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleEmailSignUp} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        required
                        minLength={6}
                      />
                      <p className="text-muted-foreground text-xs">
                        Must be at least 6 characters
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="text-muted-foreground py-6 text-center text-sm">
        {/* @todo */}
        <p>
          By continuing, you agree to our{" "}
          <Link href="/" className="text-foreground hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/" className="text-foreground hover:underline">
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  )
}
