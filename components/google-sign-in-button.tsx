'use client'

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"

export function GoogleSignInButton() {
  return (
    <Button
      onClick={() => signIn('google', { callbackUrl: '/' })}
      variant="outline"
      className="w-full"
    >
      <FcGoogle className="mr-2 h-4 w-4" />
      Sign in with Google
    </Button>
  )
}