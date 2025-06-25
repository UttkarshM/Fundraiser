# Supabase Authentication Actions

This directory contains server-side authentication functions for your Supabase backend.

## Features

- **Login**: Email/password authentication with validation
- **Signup**: User registration with profile metadata
- **Logout**: Secure session termination
- **Password Reset**: Email-based password recovery
- **Profile Management**: Update user information
- **Session Management**: Get current user data

## Usage Examples

### 1. Login Function

```typescript
import { loginUser } from '@/lib/actions'

// In a server component or API route
const result = await loginUser({
  email: 'user@example.com',
  password: 'securepassword123'
})

if (result.success) {
  console.log('Login successful:', result.data.user)
} else {
  console.error('Login failed:', result.error)
}
```

### 2. Signup Function

```typescript
import { signupUser } from '@/lib/actions'

const result = await signupUser({
  email: 'newuser@example.com',
  password: 'securepassword123',
  confirmPassword: 'securepassword123',
  firstName: 'John',
  lastName: 'Doe'
})

if (result.success) {
  console.log('Signup successful:', result.data.message)
} else {
  console.error('Signup failed:', result.error)
}
```

### 3. Using with Forms (Server Actions)

```tsx
// In a form component
import { loginAction } from '@/lib/actions'

export function LoginForm() {
  return (
    <form action={loginAction}>
      <input type="email" name="email" required />
      <input type="password" name="password" required />
      <button type="submit">Login</button>
    </form>
  )
}
```

### 4. Client-Side Usage (with useTransition)

```tsx
'use client'
import { useTransition } from 'react'
import { loginUser } from '@/lib/actions'

export function LoginComponent() {
  const [isPending, startTransition] = useTransition()

  const handleLogin = async (formData: FormData) => {
    startTransition(async () => {
      const result = await loginUser({
        email: formData.get('email') as string,
        password: formData.get('password') as string
      })
      
      if (result.success) {
        // Handle success
        console.log('Login successful')
      } else {
        // Handle error
        console.error(result.error)
      }
    })
  }

  return (
    <form action={handleLogin}>
      <input type="email" name="email" required />
      <input type="password" name="password" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

### 5. Password Reset

```typescript
import { resetPassword } from '@/lib/actions'

const result = await resetPassword({
  email: 'user@example.com'
})

if (result.success) {
  console.log(result.data.message)
} else {
  console.error(result.error)
}
```

### 6. Get Current User

```typescript
import { getCurrentUser } from '@/lib/actions'

const result = await getCurrentUser()

if (result.success && result.data.user) {
  console.log('Current user:', result.data.user)
} else {
  console.log('No user logged in')
}
```

### 7. Update Profile

```typescript
import { updateProfile } from '@/lib/actions'

const result = await updateProfile({
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@example.com'
})

if (result.success) {
  console.log(result.data.message)
} else {
  console.error(result.error)
}
```

## Error Handling

All functions return a consistent `AuthResult` interface:

```typescript
interface AuthResult {
  success: boolean
  error?: string
  data?: any
}
```

This makes error handling consistent across your application.

## Environment Variables

Make sure to set the following environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Security Features

- **Input Validation**: Email format and password strength validation
- **Error Handling**: Specific error messages for different scenarios
- **Rate Limiting**: Handles Supabase rate limiting errors
- **Secure Redirects**: Uses Next.js redirect for secure navigation

## Next Steps

1. Set up your Supabase project and configure authentication
2. Create login/signup pages using these functions
3. Implement middleware for protected routes
4. Add email confirmation flow
5. Customize error messages and redirects for your app

## Tips

- Use server actions for forms to get automatic loading states
- Implement client-side loading states with `useTransition`
- Always handle both success and error cases
- Consider implementing rate limiting on your forms
- Use TypeScript for better type safety

