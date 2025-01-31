**Step-by-Step Plan to Prevent Infinite Loops with Real-Time “Resolved” Status Changes**

Below is a high-level, technical plan designed for a junior developer. Where a snippet of logic is required, use pseudocode (no real code or line numbers). By following these atomic tasks, you will minimize repeated triggers (the infinite loop) when updating a ticket’s “summary” after its status changes to “resolved.”

---

## 1. Confirm Database Table Settings

• Objective: Ensure the “requests” table differentiates status updates from other column changes.  

**Atomic Steps:**  
1. Open the Supabase Dashboard, navigate to the “requests” table, and verify that the “status” column exists.  
2. Check the “summary” column is present and can be updated by your service role.  
3. Configure “REPLICA IDENTITY” to FULL (if you need full old record data for each “UPDATE”):  
   - In the SQL Editor, run an “ALTER TABLE requests REPLICA IDENTITY FULL;” statement.  
4. Confirm Row-Level Security (RLS) policies allow returning the old row to the user or role that’s receiving the real-time subscription.  

**Critical File(s):**  
• Database / Supabase schema (managed in the Dashboard or SQL scripts).  

---

## 2. Adjust Real-Time Channel Filter

• Objective: Filter out irrelevant or repeated updates.  

**Atomic Steps:**  
1. If you don’t need real-time notifications for all columns, set a column filter in your Supabase subscription so it’s triggered only when “status” is set to “resolved.”  
2. If your environment supports advanced filters, use a combination filter (e.g., old.status != resolved AND new.status = resolved).  

**Pseudocode Example (not actual code):**  
```
supabase
  .channel('resolved-tickets')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'requests',
    filter: 'status=eq.resolved'
  }, (payload) => {
    // handle resolved
  })
  .subscribe()
```

**Critical File(s):**  
• app/admin-dashboard/components/resolved-tickets-realtime.tsx (where the subscription is currently established).  

---

## 3. Strengthen Your Old vs. New Status Check

• Objective: Prevent triggers when only the “summary” column changes.  

**Atomic Steps:**  
1. In your subscription handler, verify that old.status exists and that it differs from new.status.  
2. Explicitly check that `old.status !== 'resolved'` and `new.status === 'resolved'` before calling `onTicketResolved()`.  
3. If old.status is missing (null or undefined) in the payload, treat it as invalid and skip.  

**Pseudocode Example:**  
```
if (
  eventType === 'UPDATE'
  && old.status !== new.status
  && old.status !== 'resolved'
  && new.status === 'resolved'
) {
  // Safe to handle resolved event
}
```

**Critical File(s):**  
• app/admin-dashboard/components/resolved-tickets-realtime.tsx  

---

## 4. Update “ResolvedTicketsNotifier” to Clarify Summarization Calls

• Objective: Ensure that summarization is only triggered once.  

**Atomic Steps:**  
1. In your `ResolvedTicketsNotifier` (or similar file), confirm you’re not calling the summarization route multiple times for the same ticket.  
2. Add logging or console statements to confirm each ticket ID only runs once.  
3. If you see multiple calls for the same ticket ID, log them carefully to see if your checks are repeated or if the subscription is firing multiple times.  

**Critical File(s):**  
• app/admin-dashboard/resolved-tickets.tsx (the file housing your `handleTicketResolved` logic).  

---

## 5. Avoid Summarization Changes Triggering Another Status Update

• Objective: Don’t let the “summary” column update appear as if the ticket was freshly resolved.  

**Atomic Steps:**  
1. Ensure that the “summary” update does not modify the “status” field again; it should only update “requests.summary.”  
2. If your real-time subscription triggers on any column update, use a strict column filter or ensure the new subscription checks for an actual status transition.  

**Pseudocode Approach:**  
```
supabase
  .from('requests')
  .update({ summary: refinedSummary })
  .eq('id', ticketId)
  // Make sure status is unchanged
```

**Critical File(s):**  
• app/api/tickets/[id]/summarize/route.ts (the route that updates the ticket record).

---

## 6. Confirm Auth or RLS Doesn’t Omit old.status

• Objective: Guarantee the “old” row is fully returned in the payload for accurate comparisons.  

**Atomic Steps:**  
1. Double-check your RLS policy on “requests” so that old rows are visible to that user or role.  
2. Try disabling RLS temporarily (for testing only) to see if old.status is still missing.  
3. If you rely on “REPLICA IDENTITY FULL,” confirm that your Postgres configuration is correct.  

**Critical File(s):**  
• Database / Supabase settings, including RLS policies.

---

## 7. Thoroughly Test Locally

• Objective: Catch any infinite loops before going live.  

**Atomic Steps:**  
1. Launch your app locally with “npm run dev” or the equivalent.  
2. Resolve a ticket from “open” to “resolved” (or from “in_progress” to “resolved”).  
3. Observe console logs in both the browser and the terminal.  
4. Verify the Summarization route is only called once per ticket resolution.  
5. Check the “requests” table to confirm the “summary” column updated successfully without repeated updates.  

**Critical File(s):**  
• Local environment configuration (.env.local).  
• Real-time subscription code in resolved-tickets-realtime.tsx.  

---

## 8. Deploy and Monitor

• Objective: Ensure the final changes work in production.  

**Atomic Steps:**  
1. Push your latest code to your hosting platform (Vercel, Netlify, or similar).  
2. Monitor your logs or Supabase’s project logs to confirm only one summarization call per resolved ticket.  
3. Check real-time events in the Supabase Dashboard to ensure the correct old/new values appear.  
4. Repeat the resolution process with real tickets to verify no infinite loop.  

**Critical File(s):**  
• Deployment pipeline or CI/CD config.  

---

### Conclusion

By following these steps, a junior developer can systematically address infinite-loop issues arising from real-time “resolved” events. The core strategies involve carefully filtering subscription updates, ensuring old row data is available, and preventing subsequent “summary” updates from masquerading as fresh “resolved” triggers.
