import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function PATCH(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient(cookieStore)

    // Verify user is admin/support
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'support'].includes(profile.role)) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized - Insufficient permissions" }),
        { status: 403 }
      )
    }

    // Get request body
    const { ticketId, status } = await request.json()

    if (!ticketId || !status) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      )
    }

    // Update ticket status
    const { data, error } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', ticketId)
      .select()
      .single()

    if (error) {
      console.error('Error updating ticket status:', error)
      return new NextResponse(
        JSON.stringify({ error: "Failed to update ticket status" }),
        { status: 500 }
      )
    }

    return new NextResponse(
      JSON.stringify({ data }),
      { status: 200 }
    )

  } catch (err) {
    console.error('Error in status update:', err)
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    )
  }
} 