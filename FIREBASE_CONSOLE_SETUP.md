# 🔧 Firebase Console Setup - Step by Step Guide

## ⚠️ CRITICAL: You MUST configure Firestore Security Rules in Firebase Console

The "Missing or insufficient permissions" error means your Firestore database is blocking all writes. Follow these steps **exactly**:

---

## 📋 Step-by-Step Instructions

### **Step 1: Open Firebase Console**

1. Go to: **https://console.firebase.google.com/**
2. **Sign in** with your Google account (the one you used to create the Firebase project)
3. **Select your project** from the list

---

### **Step 2: Configure Firestore Security Rules**

1. In the left sidebar, click **"Firestore Database"**
   - If you don't see it, click **"Build"** → **"Firestore Database"**

2. Click on the **"Rules"** tab at the top

3. You'll see something like this (default rules):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if false;
       }
     }
   }
   ```
   ⚠️ **This blocks everything!** That's why you're getting the error.

4. **DELETE** all the existing rules

5. **COPY and PASTE** this code (from `firestore.rules` file):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users collection - users can only access their own document
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Prescriptions collection - users can only access their own prescriptions
       match /prescriptions/{prescriptionId} {
         // Allow read if user owns the prescription
         allow read: if request.auth != null && 
           resource.data.userId == request.auth.uid;
         
         // Allow create if user is authenticated and sets their own userId
         allow create: if request.auth != null && 
           request.resource.data.userId == request.auth.uid;
         
         // Allow update/delete if user owns the prescription
         allow update, delete: if request.auth != null && 
           resource.data.userId == request.auth.uid;
       }
       
       // Reminders collection - users can only access their own reminders
       match /reminders/{reminderId} {
         // Allow read if user owns the reminder
         allow read: if request.auth != null && 
           resource.data.userId == request.auth.uid;
         
         // Allow create if user is authenticated and sets their own userId
         allow create: if request.auth != null && 
           request.resource.data.userId == request.auth.uid;
         
         // Allow update/delete if user owns the reminder
         allow update, delete: if request.auth != null && 
           resource.data.userId == request.auth.uid;
       }
     }
   }
   ```

6. Click **"Publish"** button (top right)
   - Wait for the success message: "Rules published successfully"

---

### **Step 3: Configure Storage Security Rules**

1. In the left sidebar, click **"Storage"**
   - If you don't see it, click **"Build"** → **"Storage"**

2. Click on the **"Rules"** tab at the top

3. **DELETE** all the existing rules

4. **COPY and PASTE** this code (from `storage.rules` file):
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       // Prescriptions folder - users can only access their own files
       match /prescriptions/{userId}/{allPaths=**} {
         // Allow read if user owns the file
         allow read: if request.auth != null && request.auth.uid == userId;
         
         // Allow write (upload/delete) if user owns the folder
         allow write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

5. Click **"Publish"** button (top right)
   - Wait for the success message: "Rules published successfully"

---

### **Step 4: Verify Firestore Database is Created**

1. Go back to **"Firestore Database"** → **"Data"** tab
2. You should see an empty database (or your existing data)
3. If you see a message asking to create a database:
   - Click **"Create database"**
   - Choose **"Start in test mode"** (we'll change rules after)
   - Select a location (choose closest to you)
   - Click **"Enable"**
   - **Then go back to Step 2** to set the proper rules

---

### **Step 5: Verify Authentication is Enabled**

1. In the left sidebar, click **"Authentication"**
2. Click on **"Sign-in method"** tab
3. Make sure **"Email/Password"** is enabled:
   - If it shows "Disabled", click on it
   - Toggle **"Enable"** to ON
   - Click **"Save"**

---

### **Step 6: Test the Connection**

1. **Refresh your browser** (where the app is running)
2. **Log out and log back in** (to refresh auth token)
3. Try adding a reminder again
4. It should work now! ✅

---

## 🧪 Temporary Test Rules (For Debugging Only)

If you want to test if the connection works first, use these **TEMPORARY** rules (⚠️ **ONLY FOR TESTING, NOT PRODUCTION**):

### Firestore Test Rules:
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

**After testing works, IMMEDIATELY replace with the proper rules from Step 2!**

---

## 🔍 Troubleshooting

### Still Getting Permission Errors?

1. **Check Rules Are Published**
   - Go to Firestore → Rules tab
   - Look for "Published" status
   - Rules take 10-30 seconds to propagate

2. **Check You're Logged In**
   - Open browser console (F12)
   - Check if `currentUser` is not null
   - Try logging out and back in

3. **Check Firebase Project**
   - Make sure you're in the correct Firebase project
   - Verify environment variables match the project

4. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear browser cache completely

5. **Check Browser Console**
   - Open DevTools (F12)
   - Look for detailed error messages
   - Check Network tab for failed requests

### Common Issues:

**Issue**: "Rules published" but still getting errors
- **Solution**: Wait 30 seconds, then hard refresh browser (Ctrl+Shift+R)

**Issue**: Can't find Firestore Database
- **Solution**: Click "Build" in left sidebar, then "Firestore Database"

**Issue**: Rules editor shows syntax errors
- **Solution**: Make sure you copied the entire rules file, including `rules_version = '2';`

**Issue**: Authentication not working
- **Solution**: Go to Authentication → Sign-in method → Enable Email/Password

---

## ✅ Verification Checklist

Before testing, make sure:
- [ ] Firestore Database is created
- [ ] Firestore Rules are published (check "Published" status)
- [ ] Storage Rules are published (check "Published" status)
- [ ] Email/Password authentication is enabled
- [ ] You're logged into the app
- [ ] Browser is refreshed (hard refresh: Ctrl+Shift+R)

---

## 🎯 Quick Test

After setting up rules:

1. Open your app: `http://localhost:5000`
2. Make sure you're logged in
3. Go to Reminders page
4. Click "Add Reminder"
5. Fill in the form:
   - Medication Name: "Test"
   - Scheduled Time: Any future date/time
6. Click "Add"

**Expected Result**: Reminder should be created without errors! ✅

---

## 📞 Still Having Issues?

If you're still getting errors after following all steps:

1. **Check Browser Console** (F12) for detailed error messages
2. **Check Firebase Console** → Firestore → Usage tab for any errors
3. **Verify Environment Variables** in your `.env` file match your Firebase project
4. **Try the test rules** above to verify connection works

---

**The rules MUST be published in Firebase Console for the app to work!** 🔒

