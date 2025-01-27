## Step-by-Step Plan to Fix Sign-Out Error and Update to `useActionState`

### Overview

You're encountering an error when attempting to sign out from the support dashboard:

```
ReactDOM.useFormState has been renamed to React.useActionState. Please update EmployeeLoginPage to use React.useActionState.
```

Updating `EmployeeLoginPage` to use `useActionState` is causing other parts of your application to break. This guide breaks down the solution into manageable, atomic steps to help a junior developer implement the necessary changes without disrupting existing functionality.

### Critical Files Involved

- `app/login/page.tsx`
- `components/shared/sign-out-button.tsx`
- `app/actions/auth.ts`
- `src/components/support-dashboard/sidebar.tsx`
- `src/components/admin-dashboard/Sidebar.tsx`
- `utils/supabase/client.ts`
- `utils/supabase/server.ts`

### Step 1: Update `EmployeeLoginPage` to Use `useActionState`

**Objective:** Replace `useFormState` with `useActionState` in `EmployeeLoginPage` to align with the latest React hook naming conventions.

**Files to Modify:**
- `app/employee-login/page.tsx`

**Steps:**

1. **Open `app/employee-login/page.tsx`:**

2. **Locate the Import Statement for `useFormState`:**
   - Find the line that imports `useFormState` from `'react-dom'`.

3. **Replace `useFormState` with `useActionState`:**
   - Update the import statement to use `useActionState` and `useActionStatus` if necessary.

4. **Update Hook Usage in the Component:**
   - Replace any instances of `useFormState` with `useActionState`.
   - Ensure that the component correctly handles the new hook's return values.

**Pseudocode Example:**

```typescript:app/employee-login/page.tsx
import { useActionState, useActionStatus } from 'react-dom'
import { login } from './actions'

// Replace useFormState with useActionState
const [state, formAction] = useActionState(login, { error: null })
```

---

### Step 2: Update `SignOutButton` Component to Use `useActionStatus`

**Objective:** Modify the `SignOutButton` to use the updated `useActionStatus` hook instead of `useFormStatus`.

**Files to Modify:**
- `components/shared/sign-out-button.tsx`

**Steps:**

1. **Open `components/shared/sign-out-button.tsx`:**

2. **Locate the Import Statement for `useFormStatus`:**
   - Find the line that imports `useFormStatus` from `'react-dom'`.

3. **Replace `useFormStatus` with `useActionStatus`:**
   - Update the import statement accordingly.

4. **Update Hook Usage in the Component:**
   - Modify the hook initialization to use `useActionStatus`.
   - Ensure the component handles the `pending` state correctly.

**Pseudocode Example:**

```typescript:components/shared/sign-out-button.tsx
import { useActionStatus } from 'react-dom'

function SignOutButton() {
  const { pending } = useActionStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
    >
      {/* SVG Icon */}
      {pending ? 'Signing out...' : 'Sign out'}
    </button>
  )
}

export function SignOutForm() {
  return (
    <form action={signOut}>
      <SignOutButton />
    </form>
  )
}
```

---

### Step 3: Update Sign-Out Action Function

**Objective:** Ensure the sign-out action is correctly implemented using React actions without causing side effects.

**Files to Modify:**
- `app/actions/auth.ts`

**Steps:**

1. **Open `app/actions/auth.ts`:**

2. **Ensure `useActionState` and Related Hooks Are Not Used Here:**
   - Action functions should remain server-side and not rely on client-side hooks.

3. **Verify the `signOut` Function Implementation:**
   - Ensure it correctly signs out using Supabase and redirects the user.

4. **Confirm Proper Error Handling:**
   - Handle any potential errors gracefully to prevent the application from breaking.

**Pseudocode Example:**

```typescript:app/actions/auth.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function signOut() {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()

    revalidatePath('/')
    redirect('/login')
  } catch (error) {
    console.error('Error signing out:', error)
    // Optionally, handle the error (e.g., display a notification)
  }
}
```

---

### Step 4: Update Sidebars to Use the Updated Sign-Out Flow

**Objective:** Ensure that both Support and Admin Dashboard sidebars utilize the updated `SignOutForm` without introducing errors.

**Files to Modify:**
- `src/components/support-dashboard/sidebar.tsx`
- `src/components/admin-dashboard/Sidebar.tsx`

**Steps:**

1. **Open `src/components/support-dashboard/sidebar.tsx`:**

2. **Ensure `SignOutForm` is Imported Correctly:**
   - Verify the import path points to `components/shared/sign-out-button`.

3. **Use the Updated `SignOutForm` in the Sidebar:**
   - Replace any existing sign-out button with the `SignOutForm`.

4. **Repeat the Process for `src/components/admin-dashboard/Sidebar.tsx`:**

**Pseudocode Example:**

```typescript:src/components/support-dashboard/sidebar.tsx
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
```

---

### Step 5: Ensure Supabase Clients Are Correctly Configured

**Objective:** Verify that Supabase clients are correctly set up for both client and server components to prevent authentication and session issues.

**Files to Modify:**
- `utils/supabase/client.ts`
- `utils/supabase/server.ts`

**Steps:**

1. **Open `utils/supabase/client.ts`:**

2. **Verify Client-Side Supabase Client Configuration:**
   - Ensure it uses `createBrowserClient` and correctly initializes with environment variables.

3. **Open `utils/supabase/server.ts`:**

4. **Verify Server-Side Supabase Client Configuration:**
   - Ensure it uses `createServerClient` with `getAll` and `setAll` methods for cookie handling.

5. **Check Environment Variables:**
   - Confirm that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correctly set in `.env.local`.

**Pseudocode Example:**

```typescript:utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

let supabase: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (supabase) return supabase

  supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  )

  return supabase
}
```

```typescript:utils/supabase/server.ts
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

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
            // Handle errors if necessary
          }
        },
      },
    }
  )
}
```

---

### Step 6: Update Middleware to Handle Asynchronous Cookie Handling

**Objective:** Ensure that middleware correctly awaits cookies and uses `getAll` and `setAll` methods to comply with Next.js 15 and Supabase requirements.

**Files to Modify:**
- `middleware.ts`

**Steps:**

1. **Open `middleware.ts`:**

2. **Locate All Uses of `cookies()`:**

3. **Ensure `cookies()` Are Awaited:**
   - Modify any synchronous calls to `cookies()` to be awaited.

4. **Replace `get` and `set` with `getAll` and `setAll`:**
   - Update methods accordingly to comply with Supabase's latest guidelines.

**Pseudocode Example:**

```typescript:middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function middleware(request: NextRequest) {
  const supabase = await createClient()
  
  const { user } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  const isProtectedRoute = ['/admin-dashboard', '/support-dashboard'].some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  console.log('🔒 [Middleware] Route check:', { 
    isAuthRoute, 
    isProtectedRoute,
    needsRedirect: !user && isProtectedRoute
  })

  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

---

### Step 7: Test the Application Thoroughly

**Objective:** Ensure that all changes work as expected without introducing new issues.

**Steps:**

1. **Restart Development Server:**
   - Run `npm run dev` or `yarn dev` to restart the Next.js development server.

2. **Test Sign-In and Sign-Out Flows:**
   - Navigate to the login page and perform a sign-in.
   - Access the support dashboard.
   - Attempt to sign out and verify that no errors occur.
   - Ensure redirection to the login page post sign-out.

3. **Verify Other Functionalities:**
   - Check user management, ticket handling, and other dashboards to ensure they remain functional.
   - Test role-based access to confirm that only authorized users can access specific routes.

4. **Check Browser Console and Network Logs:**
   - Look for any errors or warnings that might indicate unresolved issues.

5. **Run Linting and Type Checks:**
   - Execute `npm run lint` and `npm run type-check` to identify any lingering issues.

---

### Step 8: Final Cleanup and Refactoring

**Objective:** Ensure the codebase is clean, consistent, and free of unused code or imports.

**Steps:**

1. **Run Linters and Formatters:**
   - Execute `npm run lint` and `npm run format` to auto-fix any linting issues.

2. **Remove Unused Imports and Code:**
   - Manually check and delete any unused imports or redundant code snippets introduced during updates.

3. **Verify Naming Conventions:**
   - Ensure consistent naming across components and hooks (`useActionState`, `useActionStatus`, etc.).

4. **Update Documentation:**
   - Reflect changes in any relevant documentation or comments within the codebase.

5. **Commit Changes:**
   - Make sure to commit all changes with clear and descriptive messages for future reference.

---

### Conclusion

By following these atomic steps, a junior developer can systematically update the sign-out flow to use `useActionState`, ensuring compliance with Next.js 15 and Supabase best practices without breaking existing functionalities. This approach emphasizes incremental changes, thorough testing, and adherence to coding standards outlined in `@formatrules.md`.

---

**References:**

- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Next.js Middleware Documentation](https://nextjs.org/docs/advanced-features/middleware)
- [React Server Components](https://reactjs.org/docs/react-api.html#reactservercomponents)
