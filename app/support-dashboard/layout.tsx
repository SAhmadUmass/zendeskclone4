import type { Metadata } from "next"
import { ClientSidebar } from "./components/client-sidebar"

export const metadata: Metadata = {
  title: "Support Dashboard",
  description: "A Zendesk-like CRM dashboard built with Next.js and Supabase",
}

export default function SupportDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <ClientSidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}

