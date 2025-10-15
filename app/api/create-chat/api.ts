import { Database } from "@/app/types/database.types"
import { validateUserIdentity } from "@/lib/server/api"
import { checkUsageByModel } from "@/lib/usage"
import { logger } from "@/lib/logger"

type CreateChatInput = {
  userId: string
  title?: string
  model: string
  isAuthenticated: boolean
  projectId?: string
}

export async function createChatInDb({
  userId,
  title,
  model,
  isAuthenticated,
  projectId,
}: CreateChatInput) {
  const supabase = await validateUserIdentity(userId, isAuthenticated)
  if (!supabase) {
    return {
      id: crypto.randomUUID(),
      user_id: userId,
      title,
      model,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  await checkUsageByModel(supabase, userId, model, isAuthenticated)

  const insertData: Database["public"]["Tables"]["chats"]["Insert"] = {
    user_id: userId,
    title: title || "New Chat",
    model,
    project_id: projectId,
  }

  const { data, error } = await supabase
    .from("chats")
    .insert(insertData)
    .select("*")
    .single()

  if (error || !data) {
    logger.error({ error, userId }, "Error creating chat")
    return null
  }

  return data
}
