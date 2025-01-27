'use client'

import dynamic from 'next/dynamic'

const Sidebar = dynamic(
  () => import('@/components/support-dashboard/sidebar').then(mod => mod.Sidebar),
  { ssr: false }
)

export function ClientSidebar() {
  return <Sidebar />
} 