import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser,
  EmailAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { setDoc, doc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      createdAt: new Date().toISOString()
    });
    return userCredential;
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
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