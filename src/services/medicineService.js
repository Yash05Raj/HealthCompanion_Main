import { collection, getDocs, query, orderBy, addDoc, where, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { searchFDA } from './fdaService';

/**
 * Fetches all medicines from Firestore
 * @returns {Promise<Array>} Array of medicine objects
 */
export const fetchMedicines = async () => {
  try {
    const medicinesRef = collection(db, 'medicines');
    const q = query(medicinesRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    const medicines = [];
    
    querySnapshot.forEach((doc) => {
      medicines.push({ id: doc.id, ...doc.data() });
    });
    
    return medicines;
  } catch (error) {
    console.error('Error fetching medicines:', error);
    throw error;
  }
};

/**
 * Caches a medicine in Firestore for faster future access
 */
const cacheMedicine = async (medicine) => {
  try {
    // Check if medicine already exists
    const medicinesRef = collection(db, 'medicines');
    const q = query(medicinesRef, where('name', '==', medicine.name), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Add new medicine to cache
      await addDoc(medicinesRef, {
        ...medicine,
        cachedAt: new Date().toISOString()
      });
      console.log(`Cached medicine: ${medicine.name}`);
    }
  } catch (error) {
    console.error('Error caching medicine:', error);
    // Don't throw - caching is optional
  }
};

/**
 * Searches for a medicine by name or alias
 * First checks Firestore cache, then falls back to FDA API
 * @param {string} searchTerm - The search term to match against medicine names and aliases
 * @returns {Promise<Object|null>} Matching medicine object or null
 */
export const searchMedicine = async (searchTerm) => {
  try {
    const normalized = searchTerm.trim().toLowerCase();
    
    if (!normalized) return null;

    // Step 1: Search in Firestore cache first (fast)
    const medicines = await fetchMedicines();
    const cachedMatch = medicines.find((med) => {
      const nameMatch = med.name.toLowerCase().includes(normalized) ||
                       normalized.includes(med.name.toLowerCase());
      const aliasMatch = med.aliases?.some((alias) =>
        normalized.includes(alias.toLowerCase()) ||
        alias.toLowerCase().includes(normalized)
      );
      return nameMatch || aliasMatch;
    });

    if (cachedMatch) {
      console.log(`Found in cache: ${cachedMatch.name}`);
      return cachedMatch;
    }

    // Step 2: If not found in cache, search FDA API
    console.log(`Searching FDA API for: ${searchTerm}`);
    const fdaResult = await searchFDA(searchTerm);
    
    if (fdaResult) {
      // Cache the result for future use
      await cacheMedicine(fdaResult);
      console.log(`Found via FDA API: ${fdaResult.name}`);
      return fdaResult;
    }

    // Step 3: Try fuzzy search in Firestore (partial matches)
    const fuzzyMatch = medicines.find((med) => {
      const name = med.name.toLowerCase();
      const searchLower = normalized.toLowerCase();
      
      // Check if search term is part of medicine name or vice versa
      return name.includes(searchLower) || searchLower.includes(name) ||
             med.aliases?.some(alias => 
               alias.toLowerCase().includes(searchLower) || 
               searchLower.includes(alias.toLowerCase())
             );
    });

    if (fuzzyMatch) {
      console.log(`Found via fuzzy match: ${fuzzyMatch.name}`);
      return fuzzyMatch;
    }

    return null;
  } catch (error) {
    console.error('Error searching medicine:', error);
    return null;
  }
};

/**
 * Search multiple medicines (for suggestions/autocomplete)
 * @param {string} searchTerm - The search term
 * @param {number} maxResults - Maximum number of results
 * @returns {Promise<Array>} Array of medicine objects
 */
export const searchMedicinesMultiple = async (searchTerm, maxResults = 5) => {
  try {
    const normalized = searchTerm.trim().toLowerCase();
    
    if (!normalized) return [];

    // Search in Firestore cache
    const medicines = await fetchMedicines();
    const cachedMatches = medicines
      .filter((med) => {
        const nameMatch = med.name.toLowerCase().includes(normalized);
        const aliasMatch = med.aliases?.some((alias) =>
          alias.toLowerCase().includes(normalized)
        );
        return nameMatch || aliasMatch;
      })
      .slice(0, maxResults);

    return cachedMatches;
  } catch (error) {
    console.error('Error searching multiple medicines:', error);
    return [];
  }
};

