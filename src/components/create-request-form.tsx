'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export function CreateRequestForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!title || !description) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('Please sign in to create a request')

      // Create the request
      const { error: insertError } = await supabase
        .from('requests')
        .insert([
          {
            title,
            description,
            customer_id: user.id,
          }
        ])

      if (insertError) throw insertError

      // Reset the form and show success
      form.reset()
      setSuccess(true)
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create request')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="Brief description of your issue"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          placeholder="Detailed explanation of your issue"
          disabled={isLoading}
          className="min-h-[100px]"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      {success && (
        <p className="text-sm text-green-500">Your ticket has been created successfully!</p>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Request
      </Button>
    </form>
  )
} 