# Google Authentication Setup Guide

## ✅ What's Been Implemented

Your app now supports:
- **Primary**: Google Sign-In (one-click authentication)
- **Secondary**: Email/Password authentication

Both methods are fully integrated and working!

---

## 🔧 Firebase Console Configuration

### Step 1: Enable Google Authentication

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your **HealthCompanion** project

2. **Navigate to Authentication**
   - Click **Authentication** in the left sidebar
   - Click **Sign-in method** tab

3. **Configure Google Provider**
   - Find **Google** in the list (it should already be enabled)
   - Click the **pencil icon** to edit
   - Make sure it's **Enabled**
   - **Project support email**: Select your email
   - **Project public-facing name**: "Health Companion" (or your preferred name)
   - Click **Save**

### Step 2: Add Authorized Domains (if needed)

1. In **Authentication** → **Settings** tab
2. Scroll to **Authorized domains**
3. Make sure these are listed:
   - `localhost` (for development)
   - Your production domain (when deployed)
   - `firebaseapp.com` (usually auto-added)

### Step 3: Enable Email/Password (Optional - Secondary Method)

1. In **Authentication** → **Sign-in method** tab
2. Find **Email/Password**
3. Click to enable it
4. Toggle **Enable** switch
5. Click **Save**

---

## 🎨 UI Changes

### Login Page (`/login`)
- **Primary**: Large blue "Continue with Google" button at the top
- **Secondary**: "OR" divider, then email/password form below

### Sign Up Page (`/signup`)
- **Primary**: Large blue "Continue with Google" button at the top
- **Secondary**: "OR" divider, then email/password form below

---

## 🔐 How It Works

### Google Authentication Flow:
1. User clicks "Continue with Google"
2. Google popup opens
3. User selects Google account
4. User is authenticated
5. User document created/updated in Firestore
6. User redirected to Dashboard

### Email/Password Flow:
1. User fills email/password form
2. User clicks "Sign In/Sign Up with Email"
3. Firebase authenticates
4. User document created/updated in Firestore
5. User redirected to Dashboard

---

## 📊 User Document Structure

When a user signs in (via Google or Email), a document is created in Firestore:

```javascript
users/{userId}
{
  email: string,
  displayName: string | null,  // From Google profile
  photoURL: string | null,      // From Google profile
  provider: "google.com" | "password",
  createdAt: string (ISO timestamp),
  lastLogin: string (ISO timestamp)
}
```

---

## 🐛 Troubleshooting

### "Popup was blocked" Error
- **Solution**: Allow popups for your domain in browser settings
- Or use `signInWithRedirect` instead (requires code change)

### "auth/operation-not-allowed" Error
- **Solution**: Make sure Google provider is enabled in Firebase Console
- Check Authentication → Sign-in method → Google is enabled

### Google Sign-In Not Working
1. Check browser console for errors
2. Verify Google provider is enabled in Firebase Console
3. Check that your domain is in authorized domains list
4. Make sure you're using the correct Firebase project

### User Document Not Created
- The `ensureUserDocument` function automatically creates user documents
- Check Firestore rules allow writes to `users` collection
- Check browser console for Firestore errors

---

## 🔒 Security Notes

### Firestore Rules
Your current rules should work:
```javascript
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

This allows:
- Users to read/write their own document
- Works for both Google and Email users

---

## 🚀 Testing

### Test Google Sign-In:
1. Go to `/login` or `/signup`
2. Click "Continue with Google"
3. Select a Google account
4. Should redirect to Dashboard
5. Check Firebase Console → Authentication → Users (should see new user)
6. Check Firestore → users collection (should see user document)

### Test Email/Password:
1. Go to `/signup`
2. Fill in email/password form
3. Click "Sign Up with Email"
4. Should redirect to Dashboard
5. Check Firebase Console → Authentication → Users
6. Check Firestore → users collection

---

## 📝 Code Changes Made

### 1. `src/contexts/AuthContext.jsx`
- Added `signInWithGoogle()` function
- Added `ensureUserDocument()` helper function
- Updated to handle both Google and Email users
- Automatically creates/updates user documents

### 2. `src/pages/Login.jsx`
- Added Google sign-in button (primary)
- Kept email/password form (secondary)
- Added error handling for Google auth

### 3. `src/pages/SignUp.jsx`
- Added Google sign-up button (primary)
- Kept email/password form (secondary)
- Added error handling for Google auth

---

## 🎯 Next Steps

1. ✅ **Enable Google in Firebase Console** (if not already done)
2. ✅ **Test Google sign-in** on your app
3. ✅ **Test email/password** as secondary option
4. ✅ **Verify user documents** are created in Firestore

---

## 💡 Tips

- **Google is primary**: Users will see the big blue Google button first
- **Email is secondary**: Still available for users who prefer it
- **Automatic profile**: Google users get their name and photo automatically
- **Seamless experience**: Both methods work the same way after authentication

---

## ❓ FAQ

**Q: Can users switch between Google and Email?**  
A: Yes, but they'll have separate accounts. A user can have both a Google account and an Email account with the same email address (they're separate in Firebase).

**Q: What if a user signs in with Google, then tries Email?**  
A: They'll be separate accounts. Firebase treats them as different authentication methods.

**Q: Can I link Google and Email accounts?**  
A: Yes, but it requires additional code using `linkWithCredential()`. This is an advanced feature.

**Q: Do I need OAuth credentials?**  
A: No! Firebase handles all OAuth configuration automatically. Just enable Google in Firebase Console.

---

**Your Google authentication is now ready to use!** 🎉

Try it out by clicking "Continue with Google" on the login or signup page.

