import { NextRequest } from 'next/server'

export type TicketRouteParams = {
  id: string
}

export type RouteContext<T> = {
  params: T
}

export type RouteHandler<T> = (
  request: Request | NextRequest,
  context: RouteContext<T>
) => Promise<Response> 