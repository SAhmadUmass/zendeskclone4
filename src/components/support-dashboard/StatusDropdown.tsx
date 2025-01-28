import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from '@/utils/supabase/client'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

interface StatusDropdownProps {
  ticketId: string
  initialStatus: string
  onStatusChange?: (newStatus: string) => void
}

export function StatusDropdown({ ticketId, initialStatus, onStatusChange }: StatusDropdownProps) {
  const [status, setStatus] = useState(initialStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true)
      
      const { error } = await supabase
        .from('requests')
        .update({ status: newStatus })
        .eq('id', ticketId)

      if (error) throw error

      setStatus(newStatus)
      onStatusChange?.(newStatus)
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="w-full max-w-xs p-4 border rounded-lg bg-white shadow-sm">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Ticket Status
      </label>
      <Select
        disabled={isUpdating}
        value={status}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-full bg-white border-gray-200 hover:bg-gray-50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="hover:bg-gray-100"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 
