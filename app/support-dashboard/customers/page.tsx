"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Customer = {
  id: string
  name: string
  email: string
  status: "active" | "inactive"
}

const dummyCustomers: Customer[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", status: "active" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", status: "inactive" },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com", status: "active" },
]

export default function CustomersPage() {
  const [customers, setCustomers] = useState(dummyCustomers)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    setCustomers(customers.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)))
    setSelectedCustomer(null)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Customers</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.status}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => setSelectedCustomer(customer)}>
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Customer</DialogTitle>
                    </DialogHeader>
                    <CustomerForm customer={selectedCustomer} onSubmit={handleUpdateCustomer} />
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function CustomerForm({ customer, onSubmit }: { customer: Customer | null; onSubmit: (customer: Customer) => void }) {
  const [name, setName] = useState(customer?.name || "")
  const [email, setEmail] = useState(customer?.email || "")
  const [status, setStatus] = useState(customer?.status || "active")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customer) {
      onSubmit({ ...customer, name, email, status: status as "active" | "inactive" })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <Button type="submit">Update Customer</Button>
    </form>
  )
}

