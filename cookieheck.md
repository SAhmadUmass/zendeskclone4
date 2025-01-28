**Part 2: Updating Your Middleware and Route Handlers to Use Async Cookies & “getAll” / “setAll”**  

Below is a step-by-step plan broken into smaller, atomic tasks specifically tailored for a junior developer. This guidance assumes you have already updated your server-side Supabase client in “Part 1” to remove the deprecated “get”, “set”, and “remove” methods.

---

## 1. Locate Middleware and Relevant Handlers

• Goal: Find where Next.js middleware or API route handlers may be using old cookie logic (for example, calling request.cookies.get).  
• Critical Files:  
  – middleware.ts (if present for auth checks or session logic).  
  – app/api/* (any route handlers that might create or manage a Supabase client).

### Action Items
1. Open middleware.ts (or any custom file you’ve designated as middleware).  
2. Look for usage of synchronous cookies, such as request.cookies or similar.  
3. Note any spots where you create a server Supabase client inside the middleware or route handlers.

---

## 2. Convert Synchronous Cookie Calls into Async

• Objective: Ensure that calls like request.cookies or cookies() are awaited correctly.  
• Rationale: Next.js 15 requires cookies() to be fully asynchronous to avoid “cookies() should be awaited” errors.

### Action Items
1. Replace any occurrences of request.cookies with “await cookies()” near the top of your middleware function or route handler.  
2. Store the result in a variable (for example, cookieStore = await cookies()).  
3. Verify that every subsequent cookie manipulation references this cookieStore variable rather than the synchronous request.cookies.

Pseudocode (no line numbers, just a conceptual snippet):

```typescript
const cookieStore = await cookies()

// ... pass cookieStore into your createServerClient call
```

---

## 3. Implement “getAll” and “setAll” in Middleware

• Objective: Ensure that when you create a Supabase client in middleware, the “cookies” property uses “getAll” / “setAll.”  
• Critical File: middleware.ts (if it calls createServerClient).

### Action Items
1. Inside createServerClient’s “cookies” block, replace old references to get(name) or set(name, value) with:
   - getAll(): returns cookieStore.getAll()  
   - setAll(cookiesToSet): loops over each cookie and sets them using cookieStore.set(...)  
2. Remove any leftover code that references “remove” or single “get” calls.

---

## 4. Duplicate Checks in Other Route Handlers

• Objective: Some route handlers (e.g., app/api/*) might also instantiate a server Supabase client.  
• Critical Files:  
  – app/api/admin-dashboard/users/convert-to-staff/route.ts  
  – app/api/tickets/[id]/route.ts  
  – Any custom /api endpoints that require server-level Supabase logic.

### Action Items
1. Search for createServerClient usage across your app/api/ directory.  
2. Confirm that each usage awaits cookies() before passing cookie data to createServerClient.  
3. Replace any get(name)/set(name) logic with getAll() and setAll() to match your updated approach.

Pseudocode (conceptual):

```typescript
const cookieStore = await cookies()
const supabase = createServerClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        // loop and set each cookie
      }
    }
  }
)
```

---

## 5. Confirm Role-Based Checks Remain Functional

• Objective: If you have role-based checks (e.g., only admins can proceed), confirm that these still work after switching to the async cookies approach.  
• Critical Files:
  – middleware.ts or route handlers that validate a user’s role from the database.  
  – Possibly a global “EdgeStorageAdapter,” if you have specialized storage logic.

### Action Items
1. Ensure that after retrieving the Supabase client, you can still call supabase.auth.getUser() without errors.  
2. Perform any role checks (like user.role === 'admin') in the same place, but ensure the cookies remain asynchronous.

---

## 6. Test Locally and Check for “Auth Session Missing!” Errors

• Objective: Confirm that the updated code properly reads cookies to validate sessions.  
• Why Important: Failing to await cookies() leads to missing sessions, resulting in 401 or invalid token errors.

### Action Items
1. Restart your local dev server (npm run dev or yarn dev).  
2. Access protected routes to see if the middleware or route handlers still recognize you as logged in.  
3. Look at your terminal or console logs for any “cookies() should be awaited” or “Auth session missing!” errors.

---

## 7. Validate Edge Cases in Production-Like Environments

• Objective: If you deploy to a provider like Vercel, confirm the same logic works in that context.  
• Critical Files: .env or environment configuration for production.

### Action Items
1. Deploy your changes to a staging environment.  
2. Re-test sign-in flows, protected routes, or any route that interacts with cookies.  
3. Inspect server logs for potential errors around cookie usage or session detection.

---

## 8. Document the Changes

• Objective: Leave clear notes so future developers (or your future self) understand the new approach.  
• Critical Files:
  – README.md or a team wiki.  
  – Comments within middleware.ts or route handler files.

### Action Items
1. Update any docstrings or comments that mentioned earlier “get”/“set” usage.  
2. Outline how to add new routes that require server Supabase clients, referencing the new getAll() / setAll() pattern.  
3. Add a summary of these updates to your commit message or pull request description.

---

## Conclusion

By following these steps, you ensure that your middleware and route handlers comply with Next.js 15’s asynchronous cookie handling requirements and Supabase’s new getAll/setAll approach. This prevents session-related errors and keeps your authentication flow stable.
