# Firebase Rules Deployment Guide

## Prerequisites

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```
   This will open a browser window for you to authenticate with your Google account.

## Deploy Security Rules

### Option 1: Deploy Only Rules (Recommended)
```bash
firebase deploy --only firestore:rules,storage:rules
```

### Option 2: Deploy Everything
```bash
firebase deploy
```

## Verify Deployment

After deployment, you should see output like:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/healthcompanion-005/overview
```

## Test the Application

1. Refresh your browser at http://localhost:5000
2. Try adding a prescription (without a file)
3. Try adding a reminder
4. Verify data is saved and appears in the lists

## Troubleshooting

### If you get "Permission Denied" errors:
1. Make sure you're logged in with the correct Google account
2. Verify you have owner/editor access to the `healthcompanion-005` project
3. Check the Firebase Console: https://console.firebase.google.com/project/healthcompanion-005

### If deployment fails:
1. Check that `firestore.rules` and `storage.rules` files exist
2. Verify `firebase.json` and `.firebaserc` are configured correctly
3. Make sure you're in the project root directory

## Current Rules Summary

### Firestore Rules
- Users can only read/write their own data
- Prescriptions: Users can CRUD their own prescriptions
- Reminders: Users can CRUD their own reminders
- Medicines: All authenticated users can read (for chatbot)

### Storage Rules
- Users can only upload/download files in their own folder
- Path: `/prescriptions/{userId}/...`

## Quick Commands Reference

```bash
# Login
firebase login

# Deploy rules only
firebase deploy --only firestore:rules,storage:rules

# Check current project
firebase projects:list

# View deployed rules
firebase firestore:rules
```
