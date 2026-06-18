import { 
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './config';

// Users Collection
export const usersCollection = collection(db, 'users');

// Devices Collection
export const devicesCollection = collection(db, 'devices');

// SMS Collection
export const smsCollection = collection(db, 'sms');

// Gallery Collection
export const galleryCollection = collection(db, 'gallery');

// Licenses Collection
export const licensesCollection = collection(db, 'licenses');

// Enrollment PIN Collection
export const enrollmentCollection = collection(db, 'enrollment_pins');

// User Functions
export const createUser = async (userData) => {
  try {
    const userRef = doc(db, 'users', userData.uid);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      isSuspended: false
    });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUser = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { user: userDoc.data(), error: null };
    }
    return { user: null, error: 'User not found' };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const updateUser = async (uid, data) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteUser = async (uid) => {
  try {
    await deleteDoc(doc(db, 'users', uid));
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const suspendUser = async (uid, suspend = true) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      isSuspended: suspend,
      suspendedAt: suspend ? serverTimestamp() : null,
      updatedAt: serverTimestamp()
    });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Device Functions
export const registerDevice = async (deviceData) => {
  try {
    const deviceRef = doc(db, 'devices', deviceData.deviceId);
    await setDoc(deviceRef, {
      ...deviceData,
      registeredAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
      status: 'offline',
      isActive: true
    });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getDevices = async (userId = null) => {
  try {
    let q = query(devicesCollection, orderBy('registeredAt', 'desc'));
    if (userId) {
      q = query(q, where('userId', '==', userId));
    }
    const querySnapshot = await getDocs(q);
    const devices = [];
    querySnapshot.forEach((doc) => {
      devices.push({ id: doc.id, ...doc.data() });
    });
    return { devices, error: null };
  } catch (error) {
    return { devices: [], error: error.message };
  }
};

export const updateDeviceStatus = async (deviceId, status) => {
  try {
    await updateDoc(doc(db, 'devices', deviceId), {
      status,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteDevice = async (deviceId) => {
  try {
    await deleteDoc(doc(db, 'devices', deviceId));
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Real-time device status listener
export const listenDeviceStatus = (deviceId, callback) => {
  return onSnapshot(doc(db, 'devices', deviceId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
};

// SMS Functions
export const saveSMS = async (smsData) => {
  try {
    await addDoc(smsCollection, {
      ...smsData,
      createdAt: serverTimestamp()
    });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getSMSHistory = async (deviceId = null, limit = 100) => {
  try {
    let q = query(smsCollection, orderBy('createdAt', 'desc'), limit(limit));
    if (deviceId) {
      q = query(q, where('deviceId', '==', deviceId));
    }
    const querySnapshot = await getDocs(q);
    const smsList = [];
    querySnapshot.forEach((doc) => {
      smsList.push({ id: doc.id, ...doc.data() });
    });
    return { smsList, error: null };
  } catch (error) {
    return { smsList: [], error: error.message };
  }
};

// Gallery Functions
export const saveGalleryItem = async (galleryData) => {
  try {
    await addDoc(galleryCollection, {
      ...galleryData,
      createdAt: serverTimestamp()
    });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getGalleryItems = async (deviceId = null) => {
  try {
    let q = query(galleryCollection, orderBy('createdAt', 'desc'));
    if (deviceId) {
      q = query(q, where('deviceId', '==', deviceId));
    }
    const querySnapshot = await getDocs(q);
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return { items, error: null };
  } catch (error) {
    return { items: [], error: error.message };
  }
};

// License Functions
export const createLicense = async (licenseData) => {
  try {
    const licenseRef = doc(db, 'licenses', licenseData.licenseId);
    await setDoc(licenseRef, {
      ...licenseData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getLicenses = async () => {
  try {
    const querySnapshot = await getDocs(licensesCollection);
    const licenses = [];
    querySnapshot.forEach((doc) => {
      licenses.push({ id: doc.id, ...doc.data() });
    });
    return { licenses, error: null };
  } catch (error) {
    return { licenses: [], error: error.message };
  }
};

// Enrollment PIN Functions
export const createEnrollmentPIN = async (pinData) => {
  try {
    const pinRef = doc(db, 'enrollment_pins', pinData.pin);
    await setDoc(pinRef, {
      ...pinData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      used: false
    });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const verifyEnrollmentPIN = async (pin) => {
  try {
    const pinDoc = await getDoc(doc(db, 'enrollment_pins', pin));
    if (!pinDoc.exists()) {
      return { valid: false, error: 'PIN tidak valid' };
    }
    const data = pinDoc.data();
    if (!data.isActive || data.used) {
      return { valid: false, error: 'PIN sudah tidak aktif' };
    }
    if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
      return { valid: false, error: 'PIN sudah kadaluarsa' };
    }
    return { valid: true, data, error: null };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

export const useEnrollmentPIN = async (pin, userId) => {
  try {
    await updateDoc(doc(db, 'enrollment_pins', pin), {
      used: true,
      usedBy: userId,
      usedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
