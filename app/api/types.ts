import { NextRequest, NextResponse } from 'next/server'

export interface RouteParams<T> {
  params: T
  searchParams: { [key: string]: string | string[] | undefined }
}

export type RouteHandler<TParams = Record<string, unknown>, TResponse = NextResponse> = (
  req: NextRequest,
  params: RouteParams<TParams>
) => Promise<TResponse>

export type TicketRouteParams = {
  id: string
} 