"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

// This type matches our Supabase requests table schema with joined profiles
export type Ticket = {
  id: string
  title: string
  description: string
  status: "new" | "open" | "closed"
  priority: "low" | "medium" | "high"
  created_at: string
  customer_id: string
  profiles: {
    full_name: string
  }
}

export const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "profiles.full_name",
    header: "Customer",
    cell: ({ row }) => row.original.profiles?.full_name || 'Unknown',
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={
          status === "new" ? "default" :
          status === "open" ? "secondary" :
          "outline"
        }>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string
      return (
        <Badge variant={
          priority === "high" ? "destructive" :
          priority === "medium" ? "default" :
          "outline"
        }>
          {priority}
        </Badge>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      return new Date(row.getValue("created_at")).toLocaleDateString()
    },
  }
] 