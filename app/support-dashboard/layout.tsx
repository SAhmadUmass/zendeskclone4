import type { Metadata } from "next"
import { Sidebar } from "@/components/support-dashboard/sidebar"

export const metadata: Metadata = {
  title: "CRM Dashboard",
  description: "A Zendesk-like CRM dashboard built with Next.js and Supabase",
}

export default function SupportDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}

