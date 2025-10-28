"use client"

import { RegisterForm } from "@/components/register-form"
import { useQueryClient } from "@tanstack/react-query"
import NextTopLoader from "nextjs-toploader"
import { Suspense, useEffect } from "react"
import Link from "next/link"
import { PiggyBank } from "lucide-react"

export default function RegisterPage() {
  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.removeQueries()
  }, [ queryClient ])

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <NextTopLoader color="var(--primary)" />
      <div className="w-full max-w-sm md:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <PiggyBank className="h-8 w-8 text-primary" />
          <span className="font-bold text-2xl">EcoHogar</span>
        </Link>
        <Suspense>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}
