"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { UsersRealtime } from '../components/users-realtime'
import type { User } from '@/types/users'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [newStaffEmail, setNewStaffEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin-dashboard/users', {
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }

        const result = await response.json()
        setUsers(result.data || [])
      } catch (err) {
        console.error('Error fetching users:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin-dashboard/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ role: 'user' })
      })

      if (!response.ok) {
        throw new Error('Failed to remove staff access')
      }

      // Update local state
      setUsers(users.filter(user => user.id !== userId))
    } catch (err) {
      console.error('Error removing staff access:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove staff access')
    }
  }

  const handleConvertToStaff = async () => {
    try {
      setError(null)
      
      const response = await fetch('/api/admin-dashboard/users/convert-to-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: newStaffEmail.trim() })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to convert user to staff')
      }

      // Refresh the user list instead of updating local state
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'support')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setUsers(data || [])
      setNewStaffEmail("")
    } catch (err) {
      console.error('Error converting to staff:', err)
      setError(err instanceof Error ? err.message : 'Failed to convert user to staff')
    }
  }

  const handleUserUpdate = (updatedUser: User) => {
    // Toast or notification could be added here
    console.log('User updated:', updatedUser)
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-semibold mb-6">User Management</h1>
        <div className="mb-6 flex items-center space-x-2">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-8 w-[80px]" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">User Management</h1>
      
      {/* Real-time updates handler */}
      <UsersRealtime 
        initialUsers={users} 
        onUserUpdate={handleUserUpdate}
      />

      <div className="mb-6 flex items-center space-x-2">
        <Input
          type="email"
          placeholder="Enter email to convert to support staff"
          value={newStaffEmail}
          onChange={(e) => setNewStaffEmail(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleConvertToStaff}>Convert to Staff</Button>
      </div>
      {users.length === 0 && !loading ? (
        <div className="text-center py-8 text-gray-500">
          No support staff members found
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id.slice(0, 8)}</TableCell>
                <TableCell>{user.full_name || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>Support Staff</TableCell>
                <TableCell>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteUser(user.id)}
                    size="sm"
                  >
                    Remove Access
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

