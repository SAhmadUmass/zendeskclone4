'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function CreateRequestForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
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
      // Close dialog after 1.5 seconds on success
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
      }, 1500)
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create request')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" variant="default">
          <Plus className="h-4 w-4" />
          Create Support Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="text-center">
          <DialogTitle>Create New Support Request</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new support request. We'll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>
        
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
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
                className="min-h-[150px]"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Your ticket has been created successfully!</span>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Request'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 