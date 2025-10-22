"use client"

import { LoginForm } from "@/components/login-form"
import { useQueryClient } from "@tanstack/react-query"
import NextTopLoader from "nextjs-toploader"
import { Suspense, useEffect } from "react"

export default function LoginPage() {
  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.removeQueries()
  }, [ queryClient ])

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <NextTopLoader color="var(--primary)" />
      <div className="w-full max-w-sm md:max-w-md">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
