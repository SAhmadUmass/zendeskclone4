"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface User {
  id: string
  full_name: string | null
  email: string
  role: string
  created_at: string
}

export default function Page() {
  const [users, setUsers] = useState<User[]>([])
  const [newStaffEmail, setNewStaffEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const supabase = createClient()
        
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        setUsers(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleDeleteUser = async (userId: string) => {
    try {
      const supabase = createClient()
      
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (deleteError) throw deleteError

      // Update local state
      setUsers(users.filter(user => user.id !== userId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
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

      // Update local state
      setUsers(users.map(user => 
        user.email === newStaffEmail ? { ...user, role: 'support' } : user
      ))
      setNewStaffEmail("")
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert user to staff')
    }
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
      <div className="mb-6 flex items-center space-x-2">
        <Input
          type="email"
          placeholder="Enter email to convert to staff"
          value={newStaffEmail}
          onChange={(e) => setNewStaffEmail(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleConvertToStaff}>Convert to Staff</Button>
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
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id.slice(0, 8)}</TableCell>
              <TableCell>{user.full_name || 'N/A'}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={user.role === 'admin'} // Prevent deleting admin users
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

