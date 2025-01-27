**Step-by-Step Plan to Ensure Ticket Creation and Display**

Below is a high-level plan, broken into atomic steps, to help a developer confirm that customer-created tickets are properly inserted into the “requests” table and displayed with the correct customer name. Where relevant, specific file names from your codebase are noted. No code is included, only instructions and optional pseudocode for clarity.

---

## 1. Validate Supabase Table Structure

1. **Check the “requests” Table:**  
   - Confirm it has the core columns needed (e.g., `id`, `title`, `description`, `customer_id`, `created_at`, `status`, `priority`).  
   - Ensure the “customer_id” column references the “profiles” table or a similar table storing user info.

2. **Confirm You Have the “profiles” Table:**  
   - Make sure each profile includes fields needed to display the user’s name, such as `full_name`.

3. **Critical Files:**  
   - Supabase schema (most likely configured in the database or via SQL scripts).  

---

## 2. Set Up Row-Level Security (If Required)

1. **Decide on Access Policies:**  
   - If you have RLS enabled, confirm that the policy allows only authorized users (i.e., the ticket’s creator) to insert or view their own requests.  
   - If an admin or support staff also needs access, add policies that permit them to read/update tickets.

2. **Critical Files:**  
   - Supabase security policies (configurable via the Supabase dashboard or SQL).  

---

## 3. Create a “Create Request” Form Component

1. **UI Considerations:**  
   - Have a simple form that captures `title`, `description`, and possibly `priority`.  
   - Ensure the currently authenticated user’s ID can be passed as “customer_id.”

2. **Pseudocode (Optional):**  
   ```
   onSubmit(formValues) {
     supabase.from('requests').insert({
       title: formValues.title,
       description: formValues.description,
       customer_id: user.id,  // from supabase.auth.session()
       created_at: new Date(),
       ...
     })
   }
   ```

3. **Include in the Customer Dashboard:**  
   - For example, place this component or form in “app/customer-dashboard/page.tsx” or “@/components/create-request-form.”

4. **Critical Files:**  
   - app/customer-dashboard/page.tsx  
   - components/create-request-form (already shown in your code snippets)  

---

## 4. Fetch Tickets for Display

1. **Verify Authentication:**  
   - Confirm the user is logged in before fetching.  
   - In your codebase, “app/customer-dashboard/tickets/tickets-client.tsx” actually checks the session.

2. **Query the “requests” Table:**  
   - Use `.eq('customer_id', session.user.id)` to fetch the logged-in user’s tickets.  
   - Join or select the full_name from “profiles” where needed.

3. **Map the Retrieved Data:**  
   - Once the “requests” data is returned, attach the relevant “profile” info if not already joined.  
   - You can do this by either:  
     - Using “customer:profiles!customer_id” in your SELECT statement, or  
     - Performing a separate `.in('id', ...)` call to the “profiles” table.

4. **Critical Files:**  
   - app/customer-dashboard/tickets/tickets-client.tsx  
   - hooks/useTickets.ts (if you want a reusable hook)  

---

## 5. Display the Customer’s Name

1. **Check the Data Structure:**  
   - If your query returns `customer: { full_name }`, display `ticket.customer.full_name`.  
   - If you must do a separate lookup and store the results in `ticket.profiles.full_name`, display that key.

2. **Update Table Cells to Handle “Unknown” Cases:**  
   - If `full_name` is missing, default to “Unknown” so the UI is still consistent.

3. **Critical Files:**  
   - app/customer-dashboard/tickets/columns.tsx (where you define how each column’s data is displayed)  
   - app/admin-dashboard/tickets/page.tsx (for admin views)  

---

## 6. Confirm Behavior in the Admin Dashboard

1. **Check the Admin Routes:**  
   - If you are also displaying or modifying tickets in the admin area (“app/admin-dashboard/tickets/page.tsx” or “app/admin-dashboard/priorities/page.tsx”), confirm that the query joins or selects the customer’s `full_name`.

2. **Ensure Staff or Admin Roles:**  
   - The admin or support staff typically has broader visibility.  
   - Confirm in your RLS or fetch logic that they can see all relevant tickets.

3. **Critical Files:**  
   - app/admin-dashboard/tickets/page.tsx  
   - app/admin-dashboard/priorities/page.tsx  
   - app/api/admin-dashboard/tickets/assign/route.ts (for assignment updates)  

---

## 7. Perform End-to-End Testing

1. **Create a Ticket as a Customer:**  
   - Use your “CreateRequestForm” UI to insert a ticket.  
   - Check that it appears in the “requests” table in your Supabase dashboard.

2. **View the Ticket:**  
   - Log in as the same customer, open the “View Your Tickets” dialog, and confirm the newly created ticket is displayed with the correct “full_name.”

3. **Check in Admin View (Optional):**  
   - If you log in as an admin, see if that same ticket shows up in “app/admin-dashboard/tickets/page.tsx” or “app/admin-dashboard/priorities/page.tsx,” with the correct customer name instead of “Unknown.”

4. **Address Any Permissions Issues:**  
   - If your admin or support staff can’t see the ticket, verify the RLS or your queries are not filtering out the data inadvertently.

---

## 8. Wrap-Up and Deployment

1. **Deployment Prep:**  
   - Verify `.env` files contain correct credentials (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, etc.).  
   - Ensure you have no hard-coded secrets in your repository.

2. **Final Checks:**  
   - Confirm your environment has the right Supabase project link.  
   - Validate that next-auth or any session-based checks are working properly.

3. **Go Live:**  
   - Deploy your Next.js app after testing thoroughly.

---

### Summary

Following these steps should help ensure that tickets created by customers are inserted into the “requests” table and displayed with correct customer names in both the Customer Dashboard and the Admin Dashboard. The most critical files for these operations are:

• app/customer-dashboard/page.tsx (and @/components/create-request-form)  
• app/customer-dashboard/tickets/tickets-client.tsx  
• app/admin-dashboard/tickets/page.tsx and app/admin-dashboard/priorities/page.tsx (for admin views)  
• Database logic in your Supabase project (including RLS policies)

No actual code changes are shown here, only the order of tasks and conceptual references to help a junior developer implement or debug the flow. Feel free to adapt these steps to match your specific environment.
