import { db, storage as firebaseStorage } from '../firebase';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Hybrid Storage Service
 * 
 * Implements a hybrid storage strategy:
 * - Local Storage: Fast, offline-first cache using localStorage and IndexedDB
 * - Firebase: Cloud sync for cross-device access
 * 
 * Strategy:
 * 1. All reads come from local cache first (instant)
 * 2. Writes go to local cache immediately (optimistic UI)
 * 3. Background sync to Firebase when online
 * 4. Periodic sync from Firebase to catch updates from other devices
 */

const STORAGE_KEYS = {
    PRESCRIPTIONS: 'health_companion_prescriptions',
    REMINDERS: 'health_companion_reminders',
    SYNC_STATUS: 'health_companion_sync_status',
    LAST_SYNC: 'health_companion_last_sync'
};

// ============================================================================
// Local Storage Helpers
// ============================================================================

/**
 * Get data from localStorage
 */
const getLocalData = (key) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error(`Error reading from localStorage (${key}):`, error);
        return [];
    }
};

/**
 * Save data to localStorage
 */
const setLocalData = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`Error writing to localStorage (${key}):`, error);
        return false;
    }
};

/**
 * Convert file to base64 for local storage
 */
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Check if online
 */
const isOnline = () => {
    return navigator.onLine;
};

// ============================================================================
// Prescriptions Service
// ============================================================================

/**
 * Get all prescriptions for a user
 * Returns local cache immediately, syncs from Firebase in background
 */
export const getPrescriptions = async (userId) => {
    // Always return local cache first (instant)
    const localPrescriptions = getLocalData(STORAGE_KEYS.PRESCRIPTIONS)
        .filter(p => p.userId === userId);

    // Background sync from Firebase if online
    if (isOnline()) {
        syncPrescriptionsFromFirebase(userId).catch(err =>
            console.warn('Background sync failed:', err)
        );
    }

    return localPrescriptions;
};

/**
 * Add a new prescription
 * Saves to local storage immediately, syncs to Firebase in background
 */
export const addPrescription = async (userId, prescriptionData, file = null) => {
    try {
        // Generate local ID
        const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Handle file storage
        let fileURL = null;
        let fileData = null;

        if (file) {
            // Store file as base64 in local storage
            fileData = await fileToBase64(file);
            fileURL = fileData; // For local, URL is the base64 data
        }

        // Create prescription object
        const prescription = {
            id: localId,
            userId,
            ...prescriptionData,
            fileURL,
            fileData, // Store base64 for local
            fileName: file?.name || null,
            dateAdded: new Date().toLocaleDateString(),
            createdAt: new Date().toISOString(),
            syncStatus: 'pending', // pending, synced, error
            localOnly: true
        };

        // Save to local storage immediately
        const localPrescriptions = getLocalData(STORAGE_KEYS.PRESCRIPTIONS);
        localPrescriptions.push(prescription);
        setLocalData(STORAGE_KEYS.PRESCRIPTIONS, localPrescriptions);

        // Background sync to Firebase if online
        if (isOnline()) {
            syncPrescriptionToFirebase(prescription, file).catch(err => {
                console.warn('Failed to sync prescription to Firebase:', err);
                // Update sync status to error
                updatePrescriptionSyncStatus(localId, 'error');
            });
        }

        return prescription;
    } catch (error) {
        console.error('Error adding prescription:', error);
        throw error;
    }
};

/**
 * Delete a prescription
 */
export const deletePrescription = async (userId, prescriptionId) => {
    try {
        // Delete from local storage
        let localPrescriptions = getLocalData(STORAGE_KEYS.PRESCRIPTIONS);
        const prescription = localPrescriptions.find(p => p.id === prescriptionId);
        localPrescriptions = localPrescriptions.filter(p => p.id !== prescriptionId);
        setLocalData(STORAGE_KEYS.PRESCRIPTIONS, localPrescriptions);

        // Delete from Firebase if it was synced
        if (isOnline() && prescription && !prescription.localOnly) {
            try {
                // Delete file from Firebase Storage
                if (prescription.filePath) {
                    const fileRef = ref(firebaseStorage, prescription.filePath);
                    await deleteObject(fileRef);
                }
                // Delete document from Firestore
                if (prescription.firebaseId) {
                    await deleteDoc(doc(db, 'prescriptions', prescription.firebaseId));
                }
            } catch (error) {
                console.warn('Failed to delete from Firebase:', error);
            }
        }

        return true;
    } catch (error) {
        console.error('Error deleting prescription:', error);
        throw error;
    }
};

// ============================================================================
// Reminders Service
// ============================================================================

/**
 * Get all reminders for a user
 */
export const getReminders = async (userId) => {
    // Return local cache first
    const localReminders = getLocalData(STORAGE_KEYS.REMINDERS)
        .filter(r => r.userId === userId);

    // Background sync from Firebase if online
    if (isOnline()) {
        syncRemindersFromFirebase(userId).catch(err =>
            console.warn('Background sync failed:', err)
        );
    }

    return localReminders;
};

/**
 * Add a new reminder
 */
export const addReminder = async (userId, reminderData) => {
    try {
        // Generate local ID
        const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create reminder object
        const reminder = {
            id: localId,
            userId,
            ...reminderData,
            createdAt: new Date().toISOString(),
            syncStatus: 'pending',
            localOnly: true
        };

        // Save to local storage immediately
        const localReminders = getLocalData(STORAGE_KEYS.REMINDERS);
        localReminders.push(reminder);
        setLocalData(STORAGE_KEYS.REMINDERS, localReminders);

        // Background sync to Firebase if online
        if (isOnline()) {
            syncReminderToFirebase(reminder).catch(err => {
                console.warn('Failed to sync reminder to Firebase:', err);
                updateReminderSyncStatus(localId, 'error');
            });
        }

        return reminder;
    } catch (error) {
        console.error('Error adding reminder:', error);
        throw error;
    }
};

/**
 * Update a reminder
 */
export const updateReminder = async (userId, reminderId, updates) => {
    try {
        // Update local storage
        let localReminders = getLocalData(STORAGE_KEYS.REMINDERS);
        const index = localReminders.findIndex(r => r.id === reminderId);

        if (index === -1) {
            throw new Error('Reminder not found');
        }

        localReminders[index] = {
            ...localReminders[index],
            ...updates,
            updatedAt: new Date().toISOString(),
            syncStatus: 'pending'
        };

        setLocalData(STORAGE_KEYS.REMINDERS, localReminders);

        // Background sync to Firebase if online
        if (isOnline() && !localReminders[index].localOnly) {
            syncReminderToFirebase(localReminders[index]).catch(err => {
                console.warn('Failed to sync reminder update to Firebase:', err);
            });
        }

        return localReminders[index];
    } catch (error) {
        console.error('Error updating reminder:', error);
        throw error;
    }
};

/**
 * Delete a reminder
 */
export const deleteReminder = async (userId, reminderId) => {
    try {
        // Delete from local storage
        let localReminders = getLocalData(STORAGE_KEYS.REMINDERS);
        const reminder = localReminders.find(r => r.id === reminderId);
        localReminders = localReminders.filter(r => r.id !== reminderId);
        setLocalData(STORAGE_KEYS.REMINDERS, localReminders);

        // Delete from Firebase if it was synced
        if (isOnline() && reminder && !reminder.localOnly) {
            try {
                if (reminder.firebaseId) {
                    await deleteDoc(doc(db, 'reminders', reminder.firebaseId));
                }
            } catch (error) {
                console.warn('Failed to delete from Firebase:', error);
            }
        }

        return true;
    } catch (error) {
        console.error('Error deleting reminder:', error);
        throw error;
    }
};

// ============================================================================
// Firebase Sync Functions
// ============================================================================

/**
 * Sync prescriptions from Firebase to local storage
 */
const syncPrescriptionsFromFirebase = async (userId) => {
    try {
        const prescriptionsRef = collection(db, 'prescriptions');
        const q = query(prescriptionsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        const firebasePrescriptions = [];
        querySnapshot.forEach((doc) => {
            firebasePrescriptions.push({
                ...doc.data(),
                id: doc.id,
                firebaseId: doc.id,
                localOnly: false,
                syncStatus: 'synced'
            });
        });

        // Merge with local data (local data takes precedence for conflicts)
        let localPrescriptions = getLocalData(STORAGE_KEYS.PRESCRIPTIONS);

        // Add Firebase prescriptions that don't exist locally
        firebasePrescriptions.forEach(fbPrescription => {
            const existsLocally = localPrescriptions.some(
                lp => lp.firebaseId === fbPrescription.firebaseId
            );
            if (!existsLocally) {
                localPrescriptions.push(fbPrescription);
            }
        });

        setLocalData(STORAGE_KEYS.PRESCRIPTIONS, localPrescriptions);
        updateLastSync('prescriptions');

        return localPrescriptions;
    } catch (error) {
        console.error('Error syncing prescriptions from Firebase:', error);
        throw error;
    }
};

/**
 * Sync a single prescription to Firebase
 */
const syncPrescriptionToFirebase = async (prescription, file = null) => {
    try {
        let fileURL = null;
        let filePath = null;

        // Upload file to Firebase Storage if provided
        if (file) {
            filePath = `prescriptions/${prescription.userId}/${Date.now()}_${file.name}`;
            const fileRef = ref(firebaseStorage, filePath);
            await uploadBytes(fileRef, file);
            fileURL = await getDownloadURL(fileRef);
        }

        // Prepare data for Firestore (remove local-only fields)
        const firestoreData = {
            userId: prescription.userId,
            medicationName: prescription.medicationName,
            dosage: prescription.dosage,
            prescribedBy: prescription.prescribedBy,
            instructions: prescription.instructions,
            dateAdded: prescription.dateAdded,
            fileName: prescription.fileName,
            uploadDate: prescription.createdAt,
            status: prescription.status || 'active',
            ...(fileURL && { fileURL, filePath })
        };

        // Add to Firestore
        const docRef = await addDoc(collection(db, 'prescriptions'), firestoreData);

        // Update local storage with Firebase ID
        updatePrescriptionWithFirebaseId(prescription.id, docRef.id, fileURL, filePath);

        return docRef.id;
    } catch (error) {
        console.error('Error syncing prescription to Firebase:', error);
        throw error;
    }
};

/**
 * Sync reminders from Firebase to local storage
 */
const syncRemindersFromFirebase = async (userId) => {
    try {
        const remindersRef = collection(db, 'reminders');
        const q = query(remindersRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        const firebaseReminders = [];
        querySnapshot.forEach((doc) => {
            firebaseReminders.push({
                ...doc.data(),
                id: doc.id,
                firebaseId: doc.id,
                localOnly: false,
                syncStatus: 'synced'
            });
        });

        // Merge with local data
        let localReminders = getLocalData(STORAGE_KEYS.REMINDERS);

        firebaseReminders.forEach(fbReminder => {
            const existsLocally = localReminders.some(
                lr => lr.firebaseId === fbReminder.firebaseId
            );
            if (!existsLocally) {
                localReminders.push(fbReminder);
            }
        });

        setLocalData(STORAGE_KEYS.REMINDERS, localReminders);
        updateLastSync('reminders');

        return localReminders;
    } catch (error) {
        console.error('Error syncing reminders from Firebase:', error);
        throw error;
    }
};

/**
 * Sync a single reminder to Firebase
 */
const syncReminderToFirebase = async (reminder) => {
    try {
        // Prepare data for Firestore
        const firestoreData = {
            userId: reminder.userId,
            medicineName: reminder.medicineName,
            dosage: reminder.dosage,
            frequency: reminder.frequency,
            times: reminder.times,
            startDate: reminder.startDate,
            endDate: reminder.endDate,
            notes: reminder.notes,
            active: reminder.active !== undefined ? reminder.active : true,
            createdAt: reminder.createdAt
        };

        if (reminder.firebaseId) {
            // Update existing
            await updateDoc(doc(db, 'reminders', reminder.firebaseId), firestoreData);
        } else {
            // Create new
            const docRef = await addDoc(collection(db, 'reminders'), firestoreData);
            updateReminderWithFirebaseId(reminder.id, docRef.id);
        }

        return true;
    } catch (error) {
        console.error('Error syncing reminder to Firebase:', error);
        throw error;
    }
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Update prescription with Firebase ID after sync
 */
const updatePrescriptionWithFirebaseId = (localId, firebaseId, fileURL, filePath) => {
    let localPrescriptions = getLocalData(STORAGE_KEYS.PRESCRIPTIONS);
    const index = localPrescriptions.findIndex(p => p.id === localId);

    if (index !== -1) {
        localPrescriptions[index] = {
            ...localPrescriptions[index],
            firebaseId,
            localOnly: false,
            syncStatus: 'synced',
            ...(fileURL && { fileURL }),
            ...(filePath && { filePath })
        };
        setLocalData(STORAGE_KEYS.PRESCRIPTIONS, localPrescriptions);
    }
};

/**
 * Update reminder with Firebase ID after sync
 */
const updateReminderWithFirebaseId = (localId, firebaseId) => {
    let localReminders = getLocalData(STORAGE_KEYS.REMINDERS);
    const index = localReminders.findIndex(r => r.id === localId);

    if (index !== -1) {
        localReminders[index] = {
            ...localReminders[index],
            firebaseId,
            localOnly: false,
            syncStatus: 'synced'
        };
        setLocalData(STORAGE_KEYS.REMINDERS, localReminders);
    }
};

/**
 * Update sync status for a prescription
 */
const updatePrescriptionSyncStatus = (localId, status) => {
    let localPrescriptions = getLocalData(STORAGE_KEYS.PRESCRIPTIONS);
    const index = localPrescriptions.findIndex(p => p.id === localId);

    if (index !== -1) {
        localPrescriptions[index].syncStatus = status;
        setLocalData(STORAGE_KEYS.PRESCRIPTIONS, localPrescriptions);
    }
};

/**
 * Update sync status for a reminder
 */
const updateReminderSyncStatus = (localId, status) => {
    let localReminders = getLocalData(STORAGE_KEYS.REMINDERS);
    const index = localReminders.findIndex(r => r.id === localId);

    if (index !== -1) {
        localReminders[index].syncStatus = status;
        setLocalData(STORAGE_KEYS.REMINDERS, localReminders);
    }
};

/**
 * Update last sync timestamp
 */
const updateLastSync = (type) => {
    const lastSync = getLocalData(STORAGE_KEYS.LAST_SYNC) || {};
    lastSync[type] = new Date().toISOString();
    setLocalData(STORAGE_KEYS.LAST_SYNC, lastSync);
};

/**
 * Get sync status
 */
export const getSyncStatus = () => {
    const prescriptions = getLocalData(STORAGE_KEYS.PRESCRIPTIONS);
    const reminders = getLocalData(STORAGE_KEYS.REMINDERS);
    const lastSync = getLocalData(STORAGE_KEYS.LAST_SYNC) || {};

    const pendingPrescriptions = prescriptions.filter(p => p.syncStatus === 'pending').length;
    const pendingReminders = reminders.filter(r => r.syncStatus === 'pending').length;

    return {
        online: isOnline(),
        pendingPrescriptions,
        pendingReminders,
        lastSync,
        totalPending: pendingPrescriptions + pendingReminders
    };
};

/**
 * Force sync all pending items
 */
export const forceSyncAll = async (userId) => {
    if (!isOnline()) {
        throw new Error('Cannot sync while offline');
    }

    const prescriptions = getLocalData(STORAGE_KEYS.PRESCRIPTIONS)
        .filter(p => p.userId === userId && p.syncStatus === 'pending');

    const reminders = getLocalData(STORAGE_KEYS.REMINDERS)
        .filter(r => r.userId === userId && r.syncStatus === 'pending');

    const results = {
        prescriptions: { success: 0, failed: 0 },
        reminders: { success: 0, failed: 0 }
    };

    // Sync prescriptions
    for (const prescription of prescriptions) {
        try {
            await syncPrescriptionToFirebase(prescription);
            results.prescriptions.success++;
        } catch (error) {
            results.prescriptions.failed++;
            updatePrescriptionSyncStatus(prescription.id, 'error');
        }
    }

    // Sync reminders
    for (const reminder of reminders) {
        try {
            await syncReminderToFirebase(reminder);
            results.reminders.success++;
        } catch (error) {
            results.reminders.failed++;
            updateReminderSyncStatus(reminder.id, 'error');
        }
    }

    return results;
};

/**
 * Clear all local data (for testing or reset)
 */
export const clearLocalStorage = () => {
    localStorage.removeItem(STORAGE_KEYS.PRESCRIPTIONS);
    localStorage.removeItem(STORAGE_KEYS.REMINDERS);
    localStorage.removeItem(STORAGE_KEYS.SYNC_STATUS);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
};
