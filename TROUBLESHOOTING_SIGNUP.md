# Troubleshooting Account Creation Issues

## Common Issues and Solutions

### 1. "Failed to create an account" Error

This generic error can have several causes. The updated code now shows more specific error messages.

#### Check Browser Console
Open your browser's Developer Tools (F12) and check the Console tab for detailed error messages.

---

### 2. Firebase Authentication Not Enabled

**Symptom:** Error code `auth/operation-not-allowed`

**Solution:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Sign-in method**
4. Enable **Email/Password** provider
5. Click **Save**

---

### 3. Firestore Security Rules Not Deployed

**Symptom:** Error when creating user document in Firestore

**Solution:**
1. Go to Firebase Console
2. Navigate to **Firestore Database** → **Rules**
3. Make sure your rules include:
   ```javascript
   match /users/{userId} {
     allow read, write: if request.auth != null && request.auth.uid == userId;
   }
   ```
4. Click **Publish**

**OR** use Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

### 4. Email Already Exists

**Symptom:** Error message: "This email is already registered"

**Solution:**
- Use a different email address, OR
- Go to Login page and sign in with existing account

---

### 5. Weak Password

**Symptom:** Error message: "Password is too weak"

**Solution:**
- Password must be at least 6 characters
- Use a combination of letters, numbers, and special characters

---

### 6. Invalid Email Format

**Symptom:** Error message: "Please enter a valid email address"

**Solution:**
- Check email format (e.g., `user@example.com`)
- Make sure there are no spaces

---

### 7. Network Issues

**Symptom:** Error message: "Network error"

**Solution:**
- Check your internet connection
- Try again after a few moments
- Check if Firebase services are accessible

---

### 8. Firebase Configuration Issues

**Symptom:** Errors related to Firebase initialization

**Check:**
1. Verify `.env` file exists with all required variables:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

2. Restart your development server after changing `.env`:
   ```bash
   npm run dev
   ```

---

### 9. Firestore Database Not Created

**Symptom:** Errors when trying to write to Firestore

**Solution:**
1. Go to Firebase Console
2. Navigate to **Firestore Database**
3. If you see "Get started", click it
4. Choose **Start in test mode** (for development)
5. Select a location for your database
6. Click **Enable**

**Note:** After creating the database, make sure to update the security rules!

---

## Step-by-Step Debugging

### Step 1: Check Browser Console
1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Try to create an account
4. Look for error messages
5. Note the error code (e.g., `auth/email-already-in-use`)

### Step 2: Verify Firebase Setup
1. Check Firebase Console → Authentication → Users
2. See if the user was created (even if signup failed)
3. Check Firestore Database → users collection
4. See if user document exists

### Step 3: Test Firebase Connection
Open browser console and run:
```javascript
// Check if Firebase is initialized
console.log(window.firebase || 'Firebase not found');
```

### Step 4: Check Network Tab
1. Open Developer Tools → **Network** tab
2. Try to create account
3. Look for failed requests (red)
4. Check the response for error details

---

## Quick Fixes

### Fix 1: Clear Browser Cache
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Clear cache and cookies
3. Refresh the page
4. Try again

### Fix 2: Restart Development Server
```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### Fix 3: Verify Environment Variables
Make sure your `.env` file is in the root directory and contains all Firebase config values.

### Fix 4: Check Firebase Project Status
1. Go to Firebase Console
2. Check if your project is active
3. Verify billing is set up (if required)
4. Check for any service outages

---

## Testing Account Creation

### Test with a Simple Account
1. Use a test email: `test@example.com`
2. Use a simple password: `test123456` (at least 6 characters)
3. Try creating the account
4. Check browser console for errors

### Verify Success
After successful signup:
1. You should be redirected to Dashboard (`/`)
2. Check Firebase Console → Authentication → Users (should see new user)
3. Check Firestore Database → users collection (should see user document)

---

## Still Having Issues?

1. **Check the exact error message** in browser console
2. **Verify Firebase services are enabled:**
   - Authentication (Email/Password)
   - Firestore Database
3. **Check Firestore rules are deployed**
4. **Verify environment variables are correct**
5. **Try in incognito/private browsing mode** (to rule out cache issues)

---

## Common Error Codes

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `auth/email-already-in-use` | Email exists | Use different email or sign in |
| `auth/invalid-email` | Bad email format | Check email format |
| `auth/weak-password` | Password too weak | Use stronger password |
| `auth/operation-not-allowed` | Auth method disabled | Enable Email/Password in Firebase |
| `auth/network-request-failed` | Network issue | Check internet connection |
| `permission-denied` | Firestore rules blocking | Update/deploy Firestore rules |

---

**Need more help?** Check the browser console for the specific error code and message, then refer to this guide or Firebase documentation.

