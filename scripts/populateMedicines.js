/**
 * Utility script to populate initial medicine data into Firestore
 * 
 * Usage:
 * 1. Make sure you have Firebase Admin SDK set up, OR
 * 2. Run this from the browser console after logging in, OR
 * 3. Use Firebase Console to manually add the data
 * 
 * For browser console usage:
 * 1. Open your app in the browser
 * 2. Log in
 * 3. Open browser console (F12)
 * 4. Copy and paste this entire script
 * 5. Call: populateMedicines()
 */

import { collection, addDoc } from 'firebase/firestore';
import { db } from '../src/firebase.js';

const initialMedicines = [
  {
    name: 'Ibuprofen',
    aliases: ['advil', 'motrin'],
    overview: 'A non-steroidal anti-inflammatory drug (NSAID) used to reduce fever and treat pain or inflammation.',
    uses: ['Headaches & migraines', 'Muscle aches', 'Arthritis pain', 'Menstrual cramps'],
    dosage: '200-400mg every 4-6 hours as needed. Do not exceed 1200mg in 24 hours without medical supervision.',
    warnings: [
      'Avoid if you have stomach ulcers, bleeding disorders, or severe kidney disease.',
      'Take with food to reduce stomach irritation.',
      'May interact with blood thinners or other NSAIDs.',
    ],
    sideEffects: ['Upset stomach', 'Dizziness', 'Fluid retention'],
  },
  {
    name: 'Paracetamol',
    aliases: ['acetaminophen', 'tylenol'],
    overview: 'An analgesic and antipyretic used to treat mild to moderate pain and reduce fever.',
    uses: ['Fever reduction', 'Headaches', 'Post-vaccination discomfort'],
    dosage: '500-1000mg every 6 hours as needed. Maximum 4000mg in 24 hours (or 3000mg for chronic use).',
    warnings: [
      'Exceeding 4g per day can lead to severe liver damage.',
      'Avoid combining with alcohol or other paracetamol-containing medications.',
    ],
    sideEffects: ['Rare, but may include rash or liver enzyme elevation with prolonged high doses.'],
  },
  {
    name: 'Amoxicillin',
    aliases: ['amoxil'],
    overview: 'A penicillin-type antibiotic that fights bacterial infections.',
    uses: ['Ear infections', 'Pneumonia', 'Urinary tract infections', 'Skin infections'],
    dosage: '250-500mg every 8 hours or 500-875mg every 12 hours, depending on the infection.',
    warnings: [
      'Complete the full prescribed course even if you feel better.',
      'May reduce effectiveness of oral contraceptives—use backup protection.',
      'Not effective for viral infections like cold or flu.',
    ],
    sideEffects: ['Nausea', 'Diarrhea', 'Skin rash', 'Yeast infections'],
  },
  {
    name: 'Metformin',
    aliases: [],
    overview: 'An oral medication for type 2 diabetes that improves insulin sensitivity and lowers glucose production.',
    uses: ['Type 2 diabetes', 'Prediabetes management', 'Polycystic ovary syndrome (off-label)'],
    dosage: '500mg once or twice daily with meals. Titrate up to 2000mg per day as tolerated.',
    warnings: [
      'Take with food to reduce gastrointestinal upset.',
      'Rare risk of lactic acidosis—avoid with severe kidney or liver disease.',
    ],
    sideEffects: ['Diarrhea', 'Bloating', 'Metallic taste'],
  },
  {
    name: 'Cetirizine',
    aliases: ['zyrtec'],
    overview: 'A second-generation antihistamine used for allergy relief.',
    uses: ['Seasonal allergies', 'Chronic urticaria', 'Allergic rhinitis'],
    dosage: '10mg once daily for adults. Children dosing varies by age/weight.',
    warnings: ['Use caution with kidney impairment.', 'May cause mild drowsiness in some individuals.'],
    sideEffects: ['Drowsiness', 'Dry mouth', 'Fatigue'],
  },
];

/**
 * Populates medicines collection in Firestore
 * Note: This requires admin access or you need to temporarily allow writes in firestore.rules
 */
export const populateMedicines = async () => {
  try {
    const medicinesRef = collection(db, 'medicines');
    const promises = initialMedicines.map((medicine) => addDoc(medicinesRef, medicine));
    await Promise.all(promises);
    console.log(`✅ Successfully added ${initialMedicines.length} medicines to Firestore!`);
    return { success: true, count: initialMedicines.length };
  } catch (error) {
    console.error('❌ Error populating medicines:', error);
    throw error;
  }
};

// For browser console usage
if (typeof window !== 'undefined') {
  window.populateMedicines = populateMedicines;
}

