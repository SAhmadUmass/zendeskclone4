"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Mock data for users
const initialUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Customer" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Support Staff" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "Customer" },
]

export default function Page() {
  const [users, setUsers] = useState(initialUsers)
  const [newStaffEmail, setNewStaffEmail] = useState("")

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter((user) => user.id !== userId))
  }

  const handleConvertToStaff = () => {
    const userToConvert = users.find((user) => user.email === newStaffEmail)
    if (userToConvert) {
      setUsers(users.map((user) => (user.id === userToConvert.id ? { ...user, role: "Support Staff" } : user)))
      setNewStaffEmail("")
    } else {
      alert("User not found")
    }
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
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Button variant="destructive" onClick={() => handleDeleteUser(user.id)}>
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

