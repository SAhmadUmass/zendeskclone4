import { toast as sonnerToast } from 'sonner'

interface ToastOptions {
  title: string
  description?: string
  duration?: number
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    sonnerToast(options.title, {
      description: options.description,
      duration: options.duration || 3000,
    })
  }

  return { toast }
} 