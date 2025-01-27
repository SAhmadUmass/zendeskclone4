"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Ticket, Users, AlertTriangle } from "lucide-react"
import { SignOutForm } from "@/components/shared/sign-out-button"

const menuItems = [
  { id: 1, label: "Ticket Assignment", icon: Ticket, link: "/admin-dashboard/tickets" },
  { id: 2, label: "User Management", icon: Users, link: "/admin-dashboard/users" },
  { id: 3, label: "Ticket Priorities", icon: AlertTriangle, link: "/admin-dashboard/priorities" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className={`bg-gray-800 text-white ${isOpen ? "w-64" : "w-20"} transition-all duration-300 ease-in-out flex flex-col`}>
      <div className="flex items-center justify-between p-4">
        <Link href="/admin-dashboard" className={`text-2xl font-semibold hover:text-gray-300 ${isOpen ? "block" : "hidden"}`}>
          Admin Panel
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          {isOpen ? "←" : "→"}
        </button>
      </div>
      <nav className="flex-1">
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
      <div className="mt-auto mb-4 px-4">
        <div className={`${isOpen ? 'block' : 'hidden'}`}>
          <SignOutForm />
        </div>
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-full p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 mx-auto"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

