import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { setDoc, doc, collection, query, where, getDocs, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to create/update user document in Firestore
  async function ensureUserDocument(user) {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Create user document if it doesn't exist
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        provider: user.providerData[0]?.providerId || 'email',
        createdAt: new Date().toISOString()
      });
    } else {
      // Update existing document with latest info (for Google users)
      const existingData = userSnap.data();
      await setDoc(userRef, {
        ...existingData,
        email: user.email,
        displayName: user.displayName || existingData.displayName,
        photoURL: user.photoURL || existingData.photoURL,
        lastLogin: new Date().toISOString()
      }, { merge: true });
    }
  }

  // Google Sign In
  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Ensure user document exists in Firestore
      await ensureUserDocument(result.user);
      return result;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  async function signup(email, password) {
    try {
      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await ensureUserDocument(userCredential.user);
      
      return userCredential;
    } catch (error) {
      // Re-throw with more context
      console.error('Signup error:', error);
      throw error;
    }
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    if (!email) {
      return Promise.reject(new Error('Email is required'));
    }
    return sendPasswordResetEmail(auth, email);
  }

  async function changePassword(currentPwd, newPwd) {
    if (!auth.currentUser) throw new Error('No authenticated user');
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPwd);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPwd);
    return true;
  }

  async function deleteAccount(currentPwd) {
    if (!auth.currentUser) throw new Error('No authenticated user');
    const user = auth.currentUser;
    const uid = user.uid;

    // Reauthenticate to avoid requires-recent-login
    if (currentPwd) {
      const credential = EmailAuthProvider.credential(user.email, currentPwd);
      await reauthenticateWithCredential(user, credential);
    }

    // Cleanup Firestore data
    try {
      const collectionsToClean = ['prescriptions', 'reminders'];
      for (const col of collectionsToClean) {
        const q = query(collection(db, col), where('userId', '==', uid));
        const snap = await getDocs(q);
        const deletes = snap.docs.map((d) => deleteDoc(doc(db, col, d.id)));
        await Promise.all(deletes);
      }
      // Delete user profile doc
      await deleteDoc(doc(db, 'users', uid));
    } catch (e) {
      console.error('Error cleaning Firestore data during account deletion:', e);
    }

    // Cleanup Storage files under prescriptions/uid
    try {
      const folderRef = ref(storage, `prescriptions/${uid}`);
      const list = await listAll(folderRef);
      const fileDeletes = list.items.map((itemRef) => deleteObject(itemRef));
      await Promise.all(fileDeletes);
    } catch (e) {
      // If folder doesn't exist or listing fails, continue
      console.warn('Storage cleanup warning:', e?.message || e);
    }

    // Finally delete the auth user
    await deleteUser(user);
    return true;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Ensure user document exists when auth state changes
        try {
          await ensureUserDocument(user);
        } catch (error) {
          console.error('Error ensuring user document:', error);
        }
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    signInWithGoogle,
    logout,
    resetPassword,
    changePassword,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}