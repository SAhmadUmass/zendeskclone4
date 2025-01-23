# API Documentation

## Overview

This API provides endpoints for managing support tickets. All endpoints require authentication via Supabase Auth, and access is controlled through Row Level Security (RLS) policies.

## Base URL
```
/api/tickets
```

## Authentication

All requests must include a valid Supabase session cookie. Unauthorized requests will receive a 401 response.

## Common Response Formats

### Success Response
```json
{
  "data": T,          // Response data (type varies by endpoint)
  "message": string,  // Optional success message
  "pagination": {     // Optional pagination info
    "page": number,
    "limit": number,
    "total": number
  }
}
```

### Error Response
```json
{
  "error": string,    // Error message
  "status": number    // HTTP status code
}
```

## Endpoints

### List Tickets
```http
GET /api/tickets
```

Returns a list of tickets accessible to the authenticated user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status ('open', 'in_progress', 'resolved')
- `priority` (optional): Filter by priority ('low', 'medium', 'high')

**Response Format:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "status": "open" | "in_progress" | "resolved",
      "priority": "low" | "medium" | "high",
      "customer_id": "uuid",
      "agent_id": "uuid",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Internal Server Error

---

### Create Ticket
```http
POST /api/tickets
```

Creates a new ticket for the authenticated user.

**Request Body:**
```json
{
  "title": "string",       // Required, 3-100 characters
  "description": "string", // Required
  "priority": "low" | "medium" | "high"  // Required
}
```

**Response Format:**
```json
{
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "status": "open",  // Always set to 'open' for new tickets
    "priority": "low" | "medium" | "high",
    "customer_id": "uuid",  // Set to authenticated user's ID
    "created_at": "timestamp",
    "updated_at": "timestamp"
  },
  "message": "Ticket created successfully"
}
```

**Error Responses:**
- `400` - Bad Request (invalid input)
- `401` - Unauthorized
- `500` - Internal Server Error

**Validation Rules:**
- Title: Required, string, 3-100 characters
- Description: Required, string
- Priority: Required, must be one of: 'low', 'medium', 'high'

---

### Get Single Ticket
```http
GET /api/tickets/{id}
```

Returns details of a specific ticket.

**Parameters:**
- `id` (path parameter) - UUID of the ticket

**Response Format:**
```json
{
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "status": "open" | "in_progress" | "resolved",
    "priority": "low" | "medium" | "high",
    "customer_id": "uuid",
    "agent_id": "uuid",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Ticket not found
- `500` - Internal Server Error

---

### Update Ticket
```http
PUT /api/tickets/{id}
```

Updates an existing ticket.

**Parameters:**
- `id` (path parameter) - UUID of the ticket

**Request Body:**
```json
{
  "title": "string",       // Optional, 3-100 characters
  "description": "string", // Optional
  "status": "open" | "in_progress" | "resolved",  // Optional
  "priority": "low" | "medium" | "high"           // Optional
}
```

**Response Format:**
```json
{
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "status": "string",
    "priority": "string",
    "customer_id": "uuid",
    "agent_id": "uuid",
    "created_at": "timestamp",
    "updated_at": "timestamp"  // Automatically updated
  },
  "message": "Ticket updated successfully"
}
```

**Error Responses:**
- `400` - Bad Request (invalid input)
- `401` - Unauthorized
- `404` - Ticket not found
- `500` - Internal Server Error

**Validation Rules:**
- Title: If provided, must be 3-100 characters
- Status: If provided, must be one of: 'open', 'in_progress', 'resolved'
- Priority: If provided, must be one of: 'low', 'medium', 'high'

---

### Delete Ticket
```http
DELETE /api/tickets/{id}
```

Deletes a specific ticket.

**Parameters:**
- `id` (path parameter) - UUID of the ticket

**Response Format:**
```json
{
  "message": "Ticket deleted successfully"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Ticket not found
- `500` - Internal Server Error

## Authorization

Access to tickets is controlled by Row Level Security (RLS) policies:
- Customers can only access their own tickets
- Support agents can access tickets assigned to them
- Admins can access all tickets

## Rate Limiting

The API implements rate limiting with the following constraints:
- 500 requests per minute per user
- Rate limits are applied per endpoint
- Exceeding the rate limit will result in a 429 (Too Many Requests) response

## Error Codes

| Status Code | Description |
|------------|-------------|
| 400 | Bad Request - Invalid input parameters |
| 401 | Unauthorized - Authentication required |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server-side error |

## Best Practices

1. **Pagination**: Always use pagination for list endpoints to manage large datasets
2. **Error Handling**: Handle all possible error responses
3. **Validation**: Validate input before sending requests
4. **Authentication**: Ensure valid session token is included
5. **Rate Limiting**: Implement exponential backoff when rate limited

## Testing Endpoints

Below are example `curl` commands to test each endpoint locally. Replace `{ticket_id}` with an actual ticket ID.

### Prerequisites
```bash
# Store your base URL
BASE_URL="http://localhost:3000/api/tickets"

# Store a sample ticket for creation/update
TICKET_DATA='{"title":"Test Ticket","description":"Test Description","priority":"high"}'
```

### Test List Tickets
```bash
# Get all tickets
curl -X GET "$BASE_URL" \
  -H "Content-Type: application/json"

# Get tickets with pagination and filters
curl -X GET "$BASE_URL?page=1&limit=10&status=open" \
  -H "Content-Type: application/json"
```

### Test Create Ticket
```bash
# Create a new ticket
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d "$TICKET_DATA"
```

### Test Get Single Ticket
```bash
# Get ticket by ID
curl -X GET "$BASE_URL/{ticket_id}" \
  -H "Content-Type: application/json"
```

### Test Update Ticket
```bash
# Update a ticket
curl -X PUT "$BASE_URL/{ticket_id}" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress","priority":"medium"}'
```

### Test Delete Ticket
```bash
# Delete a ticket
curl -X DELETE "$BASE_URL/{ticket_id}" \
  -H "Content-Type: application/json"
```

### Expected Test Results

1. **List Tickets (GET /api/tickets)**
   - Should return array of tickets
   - Should respect RLS (only show authorized tickets)
   - Should include pagination info

2. **Create Ticket (POST /api/tickets)**
   - Should create ticket with provided data
   - Should set status to 'open'
   - Should set customer_id to current user
   - Should return 201 status

3. **Get Single Ticket (GET /api/tickets/{id})**
   - Should return single ticket if authorized
   - Should return 404 if not found
   - Should return 401 if unauthorized

4. **Update Ticket (PUT /api/tickets/{id})**
   - Should update only provided fields
   - Should maintain existing values for unspecified fields
   - Should return updated ticket data

5. **Delete Ticket (DELETE /api/tickets/{id})**
   - Should remove ticket if authorized
   - Should return success message
   - Should return 404 if already deleted

### Common Test Scenarios

1. **Authentication Tests**
```bash
# Test without auth (should fail)
curl -X GET "$BASE_URL"

# Test with invalid auth (should fail)
curl -X GET "$BASE_URL" \
  -H "Authorization: Bearer invalid_token"
```

2. **Validation Tests**
```bash
# Test invalid priority
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test","priority":"invalid"}'

# Test missing required field
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'
```

3. **RLS Policy Tests**
```bash
# Test accessing another user's ticket (should fail)
curl -X GET "$BASE_URL/{other_user_ticket_id}"

# Test updating another user's ticket (should fail)
curl -X PUT "$BASE_URL/{other_user_ticket_id}" \
  -H "Content-Type: application/json" \
  -d '{"status":"resolved"}'
```

### Troubleshooting Tests

If you encounter issues:

1. Check authentication status
2. Verify request format and content type
3. Confirm all required fields are present
4. Check RLS policies in Supabase dashboard
5. Review server logs for detailed error messages
