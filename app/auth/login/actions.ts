"use server"

import { isSupabaseEnabled } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signOut() {
  if (!isSupabaseEnabled) {
    return { error: "Sign out is not supported in this deployment" }
  }

  const supabase = await createClient()

  if (!supabase) {
    return { error: "Sign out is not supported in this deployment" }
  }

  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/auth/login")
}
