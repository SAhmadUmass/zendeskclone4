import { NextRequest } from 'next/server'

export interface RouteParams<T> {
  params: T
  searchParams: { [key: string]: string | string[] | undefined }
}

export type RouteHandler<TParams = any, TResponse = any> = (
  req: NextRequest,
  params: RouteParams<TParams>
) => Promise<TResponse>

export type TicketRouteParams = {
  id: string
} 