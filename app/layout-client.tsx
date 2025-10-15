"use client"

import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export function LayoutClient() {
  useQuery({
    queryKey: ["csrf-init"],
    queryFn: async () => {
      await api.system.getCsrfToken()
      return true
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  })

  return null
}
