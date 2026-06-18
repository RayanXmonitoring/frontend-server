import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  updateEmail,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from './config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

export const loginWithEmailPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if user is suspended
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (userDoc.exists() && userDoc.data().isSuspended) {
      await signOut(auth);
      return { user: null, error: 'Akun Anda telah ditangguhkan' };
    }
    
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const registerWithEmailPassword = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: email,
      displayName: displayName || '',
      role: 'user',
      isActive: true,
      isSuspended: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

export const getUserRole = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data().role || 'user';
    }
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const changePassword = async (newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    await updatePassword(user, newPassword);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const changeEmail = async (newEmail) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    await updateEmail(user, newEmail);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
