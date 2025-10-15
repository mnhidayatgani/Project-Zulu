import { Database } from "@/app/types/database.types"
import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { chatId, model } = await request.json()

    if (!chatId || !model) {
      return new Response(
        JSON.stringify({ error: "Missing chatId or model" }),
        { status: 400 }
      )
    }

    // If Supabase is not available, we still return success
    if (!supabase) {
      logger.info("Supabase not enabled, skipping DB update")
      return new Response(JSON.stringify({ success: true }), { status: 200 })
    }

    const updateData: Database["public"]["Tables"]["chats"]["Update"] = { model }
    
    const { error } = await supabase
      .from("chats")
      .update(updateData)
      .eq("id", chatId)

    if (error) {
      logger.error({ error }, "Error updating chat model")
      return new Response(
        JSON.stringify({
          error: "Failed to update chat model",
          details: error.message,
        }),
        { status: 500 }
      )
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    })
  } catch (err: unknown) {
    logger.error({ err }, "Error in update-chat-model endpoint")
    return new Response(
      JSON.stringify({ error: (err as Error).message || "Internal server error" }),
      { status: 500 }
    )
  }
}
