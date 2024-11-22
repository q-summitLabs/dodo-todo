import { GoogleSignInButton } from "@/components/google-sign-in-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-200 to-blue-100 px-4 py-8">
      <Card className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in to Do2Do</CardTitle>
          <CardDescription>Sign in to your account using Google.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <GoogleSignInButton />
        </CardContent>
      </Card>
    </div>
  )
}

