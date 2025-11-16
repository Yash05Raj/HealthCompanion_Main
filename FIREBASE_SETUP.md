# Firebase Security Rules Setup Guide

## 🔴 IMPORTANT: Fix "Missing or insufficient permissions" Error

The error you're seeing is because Firebase Security Rules are **NOT configured in Firebase Console**. 

**⚠️ CRITICAL**: You MUST configure these rules in the Firebase Console web interface. Just having the files in your project is NOT enough!

👉 **See `FIREBASE_CONSOLE_SETUP.md` for detailed step-by-step instructions with screenshots.**

Quick steps:

---

## Step 1: Configure Firestore Security Rules

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project

2. **Navigate to Firestore Database**
   - Click on "Firestore Database" in the left sidebar
   - Click on the "Rules" tab

3. **Copy and Paste the Rules**
   - Open the `firestore.rules` file in this project
   - Copy all the content
   - Paste it into the Firebase Console Rules editor
   - Click "Publish"

**OR** use Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

---

## Step 2: Configure Storage Security Rules

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project

2. **Navigate to Storage**
   - Click on "Storage" in the left sidebar
   - Click on the "Rules" tab

3. **Copy and Paste the Rules**
   - Open the `storage.rules` file in this project
   - Copy all the content
   - Paste it into the Firebase Console Rules editor
   - Click "Publish"

**OR** use Firebase CLI:

```bash
firebase deploy --only storage
```

---

## Step 3: Create Required Firestore Indexes

Firestore requires composite indexes for certain queries. When you first run queries that need indexes, Firebase will show you a link to create them. Click the link to auto-create the indexes.

**Required Indexes:**
1. **Collection**: `reminders`
   - Fields: `userId` (Ascending) + `scheduledTime` (Ascending)

2. **Collection**: `prescriptions` (if you use orderBy with where)
   - Fields: `userId` (Ascending) + `dateAdded` (Descending)

---

## Step 4: Verify Rules Are Working

After setting up the rules:

1. **Test Adding a Reminder**
   - Try adding a reminder in the app
   - It should work without permission errors

2. **Test Adding a Prescription**
   - Try uploading a prescription
   - It should work without permission errors

3. **Check Browser Console**
   - Open browser DevTools (F12)
   - Check for any remaining errors

---

## Quick Setup (Firebase CLI)

If you have Firebase CLI installed:

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init

# Deploy rules
firebase deploy --only firestore:rules,storage
```

---

## Troubleshooting

### Still Getting Permission Errors?

1. **Check Authentication**
   - Make sure you're logged in
   - Check browser console for auth errors

2. **Verify Rules Are Published**
   - Go to Firebase Console
   - Check that rules show "Published" status
   - Rules might take a few seconds to propagate

3. **Check User ID**
   - Make sure `currentUser.uid` is being set correctly
   - Check browser console logs

4. **Test Mode (Development Only)**
   - ⚠️ **NEVER use in production!**
   - Temporary rules for testing:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

---

## Security Rules Explained

### Firestore Rules
- **Users**: Users can only read/write their own user document
- **Prescriptions**: Users can only access prescriptions where `userId` matches their auth ID
- **Reminders**: Users can only access reminders where `userId` matches their auth ID

### Storage Rules
- **Prescriptions Folder**: Users can only access files in their own `prescriptions/{userId}/` folder

---

## Need Help?

If you're still having issues:
1. Check Firebase Console for error logs
2. Check browser console for detailed error messages
3. Verify environment variables are set correctly
4. Make sure Firebase project is properly configured

---

**After setting up these rules, your app should work correctly!** ✅

