# Medicine Database Setup Guide

This guide explains how to set up the medicine database for the chatbot.

## Overview

The medicine chatbot now fetches data from Firestore instead of using a hardcoded array. This allows you to:
- Easily add new medicines
- Update existing medicine information
- Manage medicine data centrally in Firebase

## Database Structure

The `medicines` collection in Firestore stores medicine information with the following structure:

```javascript
{
  name: string,              // Medicine name (e.g., "Ibuprofen")
  aliases: array,            // Alternative names (e.g., ["advil", "motrin"])
  overview: string,          // Brief description
  uses: array,               // Common uses
  dosage: string,            // Dosage instructions
  warnings: array,           // Important warnings
  sideEffects: array         // Common side effects
}
```

## Setting Up the Database

### Option 1: Using Firebase Console (Recommended)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project
   - Navigate to **Firestore Database**

2. **Create the Collection**
   - Click **"Start collection"** or **"Add collection"**
   - Collection ID: `medicines`
   - Click **"Next"**

3. **Add Medicine Documents**
   - For each medicine, click **"Add document"**
   - Document ID: Leave empty (auto-generated) or use medicine name in lowercase
   - Add the following fields:

   **Example for Ibuprofen:**
   ```
   name: "Ibuprofen" (string)
   aliases: ["advil", "motrin"] (array)
   overview: "A non-steroidal anti-inflammatory drug (NSAID)..." (string)
   uses: ["Headaches & migraines", "Muscle aches", ...] (array)
   dosage: "200-400mg every 4-6 hours..." (string)
   warnings: ["Avoid if you have stomach ulcers...", ...] (array)
   sideEffects: ["Upset stomach", "Dizziness", ...] (array)
   ```

4. **Repeat for all medicines**
   - Ibuprofen
   - Paracetamol
   - Amoxicillin
   - Metformin
   - Cetirizine

### Option 2: Using Browser Console Script

1. **Temporarily Update Firestore Rules**
   - Open `firestore.rules`
   - Find the medicines collection rules
   - Change `allow write: if false;` to `allow write: if request.auth != null;`
   - Deploy the rules (or update in Firebase Console)

2. **Run the Script**
   - Open your app in the browser
   - Log in to your account
   - Open browser console (F12)
   - Copy the content from `scripts/populateMedicinesBrowser.js`
   - Paste and run: `populateMedicines()`

3. **Revert Firestore Rules**
   - Change back to `allow write: if false;`
   - Deploy the rules again

### Option 3: Using Firebase Admin SDK

If you have Firebase Admin SDK set up:

```javascript
const admin = require('firebase-admin');
const medicines = require('./initialMedicines.json');

async function populateMedicines() {
  const batch = admin.firestore().batch();
  const medicinesRef = admin.firestore().collection('medicines');
  
  medicines.forEach(medicine => {
    const docRef = medicinesRef.doc();
    batch.set(docRef, medicine);
  });
  
  await batch.commit();
  console.log('Medicines populated successfully!');
}
```

## Security Rules

The current Firestore rules allow:
- **Read**: All authenticated users can read medicines
- **Write**: Disabled for client-side (use Admin SDK or Firebase Console)

This is appropriate because:
- Medicine data is reference information (not user-specific)
- All users should be able to read it
- Only admins should be able to modify it

## Adding New Medicines

### Via Firebase Console:
1. Go to Firestore Database
2. Select `medicines` collection
3. Click **"Add document"**
4. Fill in all required fields
5. Save

### Via Code (if you enable writes):
```javascript
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

const newMedicine = {
  name: 'Aspirin',
  aliases: ['acetylsalicylic acid'],
  overview: '...',
  uses: [...],
  dosage: '...',
  warnings: [...],
  sideEffects: [...]
};

await addDoc(collection(db, 'medicines'), newMedicine);
```

## Troubleshooting

### "Missing or insufficient permissions" Error
- Make sure you've updated `firestore.rules` to allow read access
- Deploy the rules: `firebase deploy --only firestore:rules`
- Or update rules in Firebase Console

### Chatbot Shows "Loading medicine database..."
- Check browser console for errors
- Verify medicines collection exists in Firestore
- Verify you're logged in (authentication required)

### No Medicines Found
- Check that medicines collection has documents
- Verify field names match exactly (case-sensitive)
- Check that arrays are properly formatted in Firestore

## Data Format Reference

Here's a complete example document structure:

```json
{
  "name": "Ibuprofen",
  "aliases": ["advil", "motrin"],
  "overview": "A non-steroidal anti-inflammatory drug (NSAID) used to reduce fever and treat pain or inflammation.",
  "uses": [
    "Headaches & migraines",
    "Muscle aches",
    "Arthritis pain",
    "Menstrual cramps"
  ],
  "dosage": "200-400mg every 4-6 hours as needed. Do not exceed 1200mg in 24 hours without medical supervision.",
  "warnings": [
    "Avoid if you have stomach ulcers, bleeding disorders, or severe kidney disease.",
    "Take with food to reduce stomach irritation.",
    "May interact with blood thinners or other NSAIDs."
  ],
  "sideEffects": [
    "Upset stomach",
    "Dizziness",
    "Fluid retention"
  ]
}
```

## Next Steps

1. ✅ Set up Firestore rules (already done)
2. ✅ Populate initial medicine data
3. ✅ Test the chatbot
4. 📝 Add more medicines as needed
5. 🔄 Keep medicine data updated

---

**Note**: Always consult healthcare professionals for medical advice. This database is for informational purposes only.

