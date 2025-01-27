"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Ticket, Users, BarChart2, Settings } from "lucide-react"
import { SignOutForm } from "@/components/shared/sign-out-button"

const navItems = [
  { name: "Dashboard", href: "/support-dashboard", icon: LayoutDashboard },
  { name: "Tickets", href: "/support-dashboard/tickets", icon: Ticket },
  { name: "Customers", href: "/support-dashboard/customers", icon: Users },
  { name: "Analytics", href: "/support-dashboard/analytics", icon: BarChart2 },
  { name: "Settings", href: "/support-dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="bg-white w-64 h-screen flex flex-col border-r">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">CRM Dashboard</h1>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="p-2 space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center p-2 rounded-lg hover:bg-gray-100 ${
                  pathname === item.href ? "bg-gray-100" : ""
                }`}
              >
                <item.icon className="w-6 h-6 mr-3" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-2">
        <SignOutForm />
      </div>
    </aside>
  )
}

