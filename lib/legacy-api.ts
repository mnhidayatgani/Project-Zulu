import { APP_DOMAIN } from "@/lib/config"
import type { UserProfile } from "@/lib/user/types"
import { SupabaseClient } from "@supabase/supabase-js"
import { createClient } from "./supabase/client"
import { api } from "./api"

/**
 * Creates a guest user record on the server
 * @deprecated Use api.user.createGuestUser() instead
 */
export async function createGuestUser(guestId: string) {
  const result = await api.user.createGuestUser(guestId)
  
  if (!result.success) {
    console.error("Error creating guest user:", result.error)
    throw new Error(result.error?.message || "Failed to create guest user")
  }

  return result.data
}

export class UsageLimitError extends Error {
  code: string
  constructor(message: string) {
    super(message)
    this.code = "DAILY_LIMIT_REACHED"
  }
}

/**
 * Checks the user's daily usage and increments both overall and daily counters.
 * Resets the daily counter if a new day (UTC) is detected.
 * Uses the `anonymous` flag from the user record to decide which daily limit applies.
 *
 * @param userId - The ID of the user.
 * @param isAuthenticated - Whether the user is authenticated.
 * @returns The remaining daily limit.
 * @deprecated Use api.user.checkRateLimits() instead
 */
export async function checkRateLimits(
  userId: string,
  isAuthenticated: boolean
) {
  const result = await api.user.checkRateLimits(userId, isAuthenticated)
  
  if (!result.success || !result.data) {
    console.error("Error checking rate limits:", result.error)
    throw new Error(result.error?.message || "Failed to check rate limits")
  }

  return result.data
}

/**
 * Updates the model for an existing chat
 * @deprecated Use api.chat.updateChatModel() instead
 */
export async function updateChatModel(chatId: string, model: string) {
  const result = await api.chat.updateChatModel(chatId, model)

  if (!result.success) {
    console.error("Error updating chat model:", result.error)
    throw new Error(result.error?.message || "Failed to update chat model")
  }

  return result.data
}

/**
 * Signs in user with Google OAuth via Supabase
 */
export async function signInWithGoogle(supabase: SupabaseClient) {
  try {
    const isDev = process.env.NODE_ENV === "development"

    // Get base URL dynamically (will work in both browser and server environments)
    const baseUrl = isDev
      ? "http://localhost:3000"
      : typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_VERCEL_URL
          ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
          : APP_DOMAIN

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${baseUrl}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })

    if (error) {
      throw error
    }

    // Return the provider URL
    return data
  } catch (err) {
    console.error("Error signing in with Google:", err)
    throw err
  }
}

/**
 * Signs in user with email and password
 */
export async function signInWithEmail(
  supabase: SupabaseClient,
  email: string,
  password: string
) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return data
  } catch (err) {
    console.error("Error signing in with email:", err)
    throw err
  }
}

/**
 * Signs up user with email and password
 */
export async function signUpWithEmail(
  supabase: SupabaseClient,
  email: string,
  password: string
) {
  try {
    const isDev = process.env.NODE_ENV === "development"
    const baseUrl = isDev
      ? "http://localhost:3000"
      : typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_VERCEL_URL
          ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
          : APP_DOMAIN

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${baseUrl}/auth/callback`,
      },
    })

    if (error) {
      throw error
    }

    return data
  } catch (err) {
    console.error("Error signing up with email:", err)
    throw err
  }
}

/**
 * Sends password reset email
 */
export async function resetPassword(supabase: SupabaseClient, email: string) {
  try {
    const isDev = process.env.NODE_ENV === "development"
    const baseUrl = isDev
      ? "http://localhost:3000"
      : typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_VERCEL_URL
          ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
          : APP_DOMAIN

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/auth/reset-password`,
    })

    if (error) {
      throw error
    }

    return data
  } catch (err) {
    console.error("Error resetting password:", err)
    throw err
  }
}

export const getOrCreateGuestUserId = async (
  user: UserProfile | null
): Promise<string | null> => {
  if (user?.id) return user.id

  const supabase = createClient()

  if (!supabase) {
    console.warn("Supabase is not available in this deployment.")
    return null
  }

  const existingGuestSessionUser = await supabase.auth.getUser()
  if (
    existingGuestSessionUser.data?.user &&
    existingGuestSessionUser.data.user.is_anonymous
  ) {
    const anonUserId = existingGuestSessionUser.data.user.id

    const profileCreationAttempted = localStorage.getItem(
      `guestProfileAttempted_${anonUserId}`
    )

    if (!profileCreationAttempted) {
      try {
        await createGuestUser(anonUserId)
        localStorage.setItem(`guestProfileAttempted_${anonUserId}`, "true")
      } catch (error) {
        console.error(
          "Failed to ensure guest user profile exists for existing anonymous auth user:",
          error
        )
        return null
      }
    }
    return anonUserId
  }

  try {
    const { data: anonAuthData, error: anonAuthError } =
      await supabase.auth.signInAnonymously()

    if (anonAuthError) {
      console.error("Error during anonymous sign-in:", anonAuthError)
      return null
    }

    if (!anonAuthData || !anonAuthData.user) {
      console.error("Anonymous sign-in did not return a user.")
      return null
    }

    const guestIdFromAuth = anonAuthData.user.id
    await createGuestUser(guestIdFromAuth)
    localStorage.setItem(`guestProfileAttempted_${guestIdFromAuth}`, "true")
    return guestIdFromAuth
  } catch (error) {
    console.error(
      "Error in getOrCreateGuestUserId during anonymous sign-in or profile creation:",
      error
    )
    return null
  }
}
