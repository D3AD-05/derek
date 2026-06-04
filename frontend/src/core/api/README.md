# API Helper Functions - Design Documentation

## Overview

All API helper functions (`get`, `post`, `put`, `patch`, `del`) now return the **full API response** structure for maximum flexibility and scalability.

## Response Structure

```typescript
interface ApiResponse<T> {
  status: string    // e.g., "success", "error"
  code: number      // HTTP status code: 200, 201, 400, 404, etc.
  message: string   // Server message (useful for toast notifications)
  data: T           // The actual response data
}
```

## Why This Approach?

### ✅ Advantages

1. **Single Source of Truth**
   - One function per HTTP method (no duplicate `get` vs `getFullResponse`)
   - Less code to maintain

2. **Flexible Error Handling**
   - Access HTTP status codes for conditional logic
   - Use server messages directly in toast notifications
   - Better debugging with full response context

3. **Scalable**
   - Consumer decides what to extract (data only, or full response)
   - Easy to add new response fields in the future

4. **Better UX**
   - Show backend messages directly to users
   - Handle different status codes appropriately

### ❌ Previous Issues

- Had to maintain both `get` and `getFullResponse`
- Couldn't access status codes when using simple helpers
- Had to decide upfront which helper to use

## Usage Examples

### Example 1: Extract Only Data

```typescript
const loadBanks = async () => {
  try {
    const response = await QBListApi(null)
    
    // Access just the data
    banks.value = response.data.items
  } catch (err) {
    toast.error('Failed to load banks')
  }
}
```

### Example 2: Use Status Code for Logic

```typescript
const createBank = async (data: CreateBankDto) => {
  try {
    const response = await CreateQBApi(data)
    
    // Conditional logic based on status code
    if (response.code === 201) {
      toast.success('Bank created!')
      router.push('/banks')
    } else if (response.code === 200) {
      toast.info('Bank updated')
    }
  } catch (err) {
    toast.error('Failed to create bank')
  }
}
```

### Example 3: Show Server Messages

```typescript
const deleteBank = async (id: number) => {
  try {
    const response = await DeleteQBApi(id)
    
    // Use server's message directly
    toast.success(response.message || 'Bank deleted')
  } catch (err) {
    toast.error('Failed to delete bank')
  }
}
```

### Example 4: Store in Pinia with Full Context

```typescript
// In store
async QBList() {
  this.loading = true
  this.error = null
  
  try {
    const response = await QBListApi(null)
    
    // Log full response for debugging
    console.log('API Response:', response)
    console.log('Status:', response.status)
    console.log('Code:', response.code)
    console.log('Message:', response.message)
    
    // Store the data
    this.questionBanks = response.data
    
    // Return data or full response based on consumer need
    return response.data
  } catch (error: any) {
    this.error = error?.message
    throw error
  } finally {
    this.loading = false
  }
}
```

## Migration Guide

### Before (Old Approach)

```typescript
// service.ts
export async function QBListApi(params) {
  const data = get<QBListResponse>('question-bank', params)
  return data  // Returns only data
}

// component
const loadBanks = async () => {
  const data = await QBListApi(null)
  banks.value = data.items  // Direct access
}
```

### After (New Approach)

```typescript
// service.ts
export async function QBListApi(
  params: Record<string, any> | null
): Promise<ApiResponse<QBListResponse>> {
  return get<QBListResponse>('question-bank', params)
}

// component
const loadBanks = async () => {
  const response = await QBListApi(null)
  
  // Access via response.data
  banks.value = response.data.items
  
  // Can also check status, show message, etc.
  if (response.code === 200) {
    console.log(response.message)
  }
}
```

## API Helper Functions

### Authenticated Requests

```typescript
// GET request
const response = await get<MyType>('/endpoint', { page: 1 })

// POST request
const response = await post<MyType>('/endpoint', { name: 'Test' })

// PUT request
const response = await put<MyType>('/endpoint/1', { name: 'Updated' })

// PATCH request
const response = await patch<MyType>('/endpoint/1', { status: 'active' })

// DELETE request
const response = await del<void>('/endpoint/1')
```

### Public Requests (No Auth)

```typescript
// Public GET
const response = await publicGet<MyType>('/public-endpoint')

// Public POST
const response = await publicPost<MyType>('/public-endpoint', data)
```

## Best Practices

### ✅ Do

```typescript
// Check status codes
if (response.code === 200) { /* success */ }

// Use server messages in toasts
toast.success(response.message || 'Operation successful')

// Extract data cleanly
const { data, code, message } = response

// Handle multiple status codes
if (code === 201) { /* created */ }
else if (code === 200) { /* updated */ }
```

### ❌ Don't

```typescript
// Don't ignore the response structure
const data = await get('endpoint')  // ❌ Assumes direct data
banks.value = data.items            // ❌ Will fail

// Instead, use response.data
const response = await get('endpoint')  // ✅
banks.value = response.data.items       // ✅
```

## Type Safety

All helpers are fully typed:

```typescript
// Type-safe response
const response: ApiResponse<QBListResponse> = await QBListApi(null)

// TypeScript knows the structure
response.status  // string
response.code    // number
response.message // string
response.data    // QBListResponse (typed)
```

## Summary

This approach provides:
- ✅ Single function per HTTP method
- ✅ Access to full response context
- ✅ Flexible data extraction
- ✅ Better error handling
- ✅ Server message integration
- ✅ Type safety throughout

All without sacrificing simplicity for common use cases!
