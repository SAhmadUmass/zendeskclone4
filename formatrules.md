### Next.js 15

#### Page Params

Params within server component pages are now Promise types, so you must await them.

```ts
type TicketPageProps = {
  params: Promise<{ id: string }>
}

export default async function TicketPage({ params }: TicketPageProps) {
  const { id } = await params

  return ...
}
```

#### Async Request APIs

```ts
// Always use async versions of runtime APIs
const cookieStore = await cookies()
const headersList = await headers()
const { isEnabled } = await draftMode()

// Handle async params in layouts/pages
const params = await props.params
const searchParams = await props.searchParams
```

#### Data Fetching

- Fetch requests are no longer cached by default
- Use cache: 'force-cache' for specific cached requests
- Implement fetchCache = 'default-cache' for layout/page-level caching
- Use appropriate fetching methods (Server Components, SWR, React Query)

#### Route Handlers

```ts
import { type NextRequest } from "next/server"

// Cached route handler example
export const dynamic = "force-static"

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  // Implementation
}
```

NOT

```ts
export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  ...
}
```

### Supabase

#### createServerClient() function

When calling the createServerClient function, do not write `get` or `set` as they are deprecated. Use `getAll` and `setAll` instead.

```ts
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

NOT

```ts
const cookieStore = await cookies()
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      // Don't use get, use getAll
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  }
)