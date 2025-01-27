'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResetLoading, setIsResetLoading] = useState(false)
  const router = useRouter()

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsResetLoading(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get('resetEmail') as string
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setSuccess("Check your email - we've sent you a password reset link.")
      e.currentTarget.reset()
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setIsResetLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    const supabase = createClient()

    try {
      if (isSignUp) {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            throw new Error('This email is already registered. Please sign in instead.')
          }
          throw signUpError
        }

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: authData.user.id,
                email,
                full_name: fullName,
                role: 'customer'
              }
            ])

          if (profileError) throw profileError
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please try again.')
          }
          throw signInError
        }
      }

      router.push('/customer-dashboard')
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Support Desk
          </h1>
          <p className="mt-2 text-lg text-gray-600">Your customer support solution</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/50 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-gray-600">
              {isSignUp 
                ? 'Start your journey with us today'
                : 'Sign in to manage your support tickets'}
            </p>
          </div>

          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 text-sm text-green-600 bg-green-50 rounded-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-700">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {isSignUp && (
                <div>
                  <Label htmlFor="fullName" className="text-gray-700">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    disabled={isLoading}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={isLoading}
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </Button>

              {!isSignUp && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={isLoading}
                    >
                      Forgot password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white/95 backdrop-blur-sm">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Reset Password
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                      <div>
                        <Label htmlFor="resetEmail" className="text-gray-700">Email address</Label>
                        <Input
                          id="resetEmail"
                          name="resetEmail"
                          type="email"
                          placeholder="Enter your email"
                          required
                          disabled={isResetLoading}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        disabled={isResetLoading}
                      >
                        {isResetLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            <span>Please wait...</span>
                          </>
                        ) : (
                          'Send Reset Link'
                        )}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </form>
        </div>

        {/* Return to Home Link */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            ← Return to Home
          </a>
        </div>
      </div>
    </div>
  )
} 