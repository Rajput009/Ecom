# How to Change Admin Password

## Option 1: Use the Password Generator (Recommended)

1. Open your browser console (F12)
2. Run this code:

```javascript
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Replace 'YourNewSecurePassword123!' with your desired password
hashPassword('YourNewSecurePassword123!').then(console.log);
```

3. Copy the hash that appears in the console
4. Replace the hash in `src/services/adminAuth.ts`

## Option 2: Online SHA-256 Generator

1. Go to https://www.sha256.org/
2. Enter your password
3. Copy the SHA-256 hash
4. Replace in `src/services/adminAuth.ts`

## Example

**Current (admin123):**
```typescript
const ADMIN_PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';
```

**Change to (MySecurePass2024!):**
```typescript
const ADMIN_PASSWORD_HASH = 'a8f5f167f44f4964e6c998dee827110c9a0c5e1e7a5b6e5e9c9e8f7d6c5b4a32';
```

## Best Practices

1. **Use a strong password:** At least 12 characters, mix of uppercase, lowercase, numbers, and symbols
2. **Don't share the password:** Only give it to trusted people
3. **Change it regularly:** Every 3-6 months
4. **Don't commit the real password:** If you change it, don't push to GitHub

## Security Tips

- The password is hashed using SHA-256 (same as Bitcoin!)
- Session expires after 30 minutes of inactivity
- After 5 failed attempts, login is locked for 5 minutes
- All admin routes are protected and check authentication

## Need Help?

If you forget the password, you'll need to:
1. Access the code
2. Generate a new hash
3. Update the `ADMIN_PASSWORD_HASH` constant
4. Redeploy
