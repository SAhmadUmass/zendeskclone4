"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Ticket, Users, AlertTriangle } from "lucide-react"

const menuItems = [
  { id: 1, label: "Ticket Assignment", icon: Ticket, link: "/admin-dashboard/tickets" },
  { id: 2, label: "User Management", icon: Users, link: "/admin-dashboard/users" },
  { id: 3, label: "Ticket Priorities", icon: AlertTriangle, link: "/admin-dashboard/priorities" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className={`bg-gray-800 text-white ${isOpen ? "w-64" : "w-20"} transition-all duration-300 ease-in-out`}>
      <div className="flex items-center justify-between p-4">
        <Link href="/admin-dashboard" className={`text-2xl font-semibold hover:text-gray-300 ${isOpen ? "block" : "hidden"}`}>
          Admin Panel
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          {isOpen ? "←" : "→"}
        </button>
      </div>
      <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.link}
                className={`flex items-center p-4 hover:bg-gray-700 ${pathname === item.link ? "bg-gray-700" : ""}`}
              >
                <item.icon className="h-6 w-6 mr-4" />
                {isOpen && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

