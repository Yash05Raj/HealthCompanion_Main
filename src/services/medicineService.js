import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

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
 * Searches for a medicine by name or alias
 * @param {string} searchTerm - The search term to match against medicine names and aliases
 * @returns {Promise<Object|null>} Matching medicine object or null
 */
export const searchMedicine = async (searchTerm) => {
  try {
    const medicines = await fetchMedicines();
    const normalized = searchTerm.trim().toLowerCase();
    
    if (!normalized) return null;
    
    return medicines.find((med) => {
      const nameMatch = med.name.toLowerCase().includes(normalized);
      const aliasMatch = med.aliases?.some((alias) =>
        normalized.includes(alias.toLowerCase())
      );
      return nameMatch || aliasMatch;
    }) || null;
  } catch (error) {
    console.error('Error searching medicine:', error);
    return null;
  }
};

