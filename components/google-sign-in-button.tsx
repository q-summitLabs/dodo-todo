'use client'

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"
import { Loader2 } from "lucide-react"

export function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: '/' })
    } catch (error) {
      console.error('Sign-in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSignIn}
      variant="outline"
      className="w-full"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          <FcGoogle className="mr-2 h-4 w-4" />
          Sign in with Google
        </>
      )}
    </Button>
  )
}

