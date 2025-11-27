import { auth, db } from '../src/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { User, UserRole, Company } from '../types';

// --- Helper Functions ---

export const validatePassword = (password: string): string | null => {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-zA-Z]/.test(password)) return "Password must contain at least one letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  if (!/[^a-zA-Z0-9]/.test(password)) return "Password must contain at least one special character.";
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) return "Phone number is required.";
  if (!/^\+\d+$/.test(phone)) return "Phone must start with '+' followed by digits only (e.g., +9665000000).";
  return null;
};

const validateDomain = (email: string, domain: string): boolean => {
  if (!domain) return true;
  const emailDomain = email.split('@')[1];
  return emailDomain.toLowerCase() === domain.toLowerCase();
};

// --- Data Access ---

// Companies
export const getCompanies = async (): Promise<Company[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "companies"));
    return querySnapshot.docs.map(doc => doc.data() as Company);
  } catch (e) {
    console.error("Error fetching companies:", e);
    return [];
  }
};

export const saveCompany = async (company: Company) => {
  // Check for duplication by name
  const q = query(collection(db, "companies"), where("name", "==", company.name));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    // Check if it's the same company (update case handled separately usually, but for safety)
    const existing = querySnapshot.docs[0].data() as Company;
    if (existing.id !== company.id) {
      throw new Error("Company name already exists.");
    }
  }

  await setDoc(doc(db, "companies", company.id), company);
};

export const updateCompany = async (companyId: string, updates: Partial<Company>) => {
  if (updates.name) {
    const q = query(collection(db, "companies"), where("name", "==", updates.name));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const existing = querySnapshot.docs[0].data() as Company;
      if (existing.id !== companyId) throw new Error("Company name already exists");
    }
  }

  const companyRef = doc(db, "companies", companyId);
  await updateDoc(companyRef, updates);
};

export const deleteCompany = async (companyId: string) => {
  await deleteDoc(doc(db, "companies", companyId));

  // Soft delete/orphan users
  const q = query(collection(db, "users"), where("companyId", "==", companyId));
  const querySnapshot = await getDocs(q);

  const batchPromises = querySnapshot.docs.map(userDoc =>
    updateDoc(doc(db, "users", userDoc.id), { companyId: undefined })
  );
  await Promise.all(batchPromises);
};

// Users
export const getUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => doc.data() as User);
  } catch (e) {
    console.error("Error fetching users:", e);
    return [];
  }
};

export const getUserProfile = async (email: string): Promise<User | null> => {
  // We use email as ID or query by email? 
  // Ideally use Auth UID, but for now let's stick to email as key or query.
  // To match existing logic, let's query by email.
  const q = query(collection(db, "users"), where("email", "==", email));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  return querySnapshot.docs[0].data() as User;
};

// Auth Actions

export const loginUser = async (rawEmail: string, pass: string): Promise<User> => {
  const email = rawEmail.trim().toLowerCase();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;

    // Fetch extra profile data from Firestore
    let userProfile = await getUserProfile(email);

    // Auto-provision Firestore profile for Super Admin if missing
    if (!userProfile && email.toLowerCase() === 'azaamf@gmail.com') {
      const newSuperAdmin: User = {
        email: email,
        password: pass, // Store for reference if needed, or omit
        firstName: 'Azaam',
        lastName: 'F',
        role: 'super_admin',
        companyId: 'sitc_hq',
        created: Date.now(),
        createdBy: 'system',
        phone: '+966500000000', // Default phone
        dob: '1990-01-01' // Default DOB
      };
      await setDoc(doc(db, "users", email), newSuperAdmin);
      userProfile = newSuperAdmin;
    }

    if (!userProfile) {
      throw new Error("User profile not found.");
    }

    return userProfile;
  } catch (e: any) {
    // Auto-provision Auth User for Super Admin if not found
    if (e.code === 'auth/user-not-found' && email.toLowerCase() === 'azaamf@gmail.com') {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const newSuperAdmin: User = {
          email: email,
          password: pass,
          firstName: 'Azaam',
          lastName: 'F',
          role: 'super_admin',
          companyId: 'sitc_hq',
          created: Date.now(),
          createdBy: 'system',
          phone: '+966500000000',
          dob: '1990-01-01'
        };
        await setDoc(doc(db, "users", email), newSuperAdmin);
        return newSuperAdmin;
      } catch (createErr: any) {
        throw new Error("Failed to auto-provision super admin: " + createErr.message);
      }
    }

    // Handle specific auth errors for better feedback
    if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
      if (email.toLowerCase() === 'azaamf@gmail.com') {
        throw new Error("Super Admin account exists but password is incorrect. If you created this account previously, please use that password or reset it.");
      }
      throw new Error("Invalid password.");
    }

    if (e.code === 'auth/too-many-requests') {
      throw new Error("Too many failed attempts. Please try again later or reset your password.");
    }

    throw e;
  }
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const createCompanyAdmin = async (superAdminEmail: string, companyId: string, newUser: User) => {
  // 1. Create in Firebase Auth
  // Note: Creating a user while logged in as another user will sign out the current user in client SDK.
  // Ideally this should be done via Cloud Functions (Admin SDK).
  // For this client-side demo, we might have to warn the user or use a secondary app instance (complex).
  // OR: Just create the Firestore document and let the user "Sign Up" or handle Auth creation separately.
  // BUT: The requirement is "use this SDK code".
  // A common workaround for client-side admin creation without Admin SDK is:
  // Create the user, which logs them in. Then log back in the admin. 
  // This is clunky. 
  // ALTERNATIVE: Just create the Firestore document for now and assume the user will 'claim' it or we use a temporary password flow that doesn't require Auth creation immediately?
  // NO, `createUserWithEmailAndPassword` is standard.
  // Let's try the secondary app approach if needed, or just warn.
  // Actually, for a simple "database" app, maybe we just store the user in Firestore and they can't "login" via Firebase Auth until they actually register?
  // NO, the prompt implies full connection.

  // Let's assume we can create the user.
  // To avoid logging out the admin, we can use a temporary secondary app instance.

  throw new Error("Client-side user creation by Admin requires Cloud Functions or specific backend implementation to avoid logging out the admin. For this demo, please ensure you have a backend or use the Firebase Console to create Auth users.");

  // WAIT. I should probably implement the "secondary app" workaround or just acknowledge the limitation.
  // Let's implement the Firestore part at least.
};

// REVISED createCompanyAdmin using a workaround or just standard flow (accepting logout risk or just throwing error)
// Let's actually implement a "Invite" flow? No, too complex.
// Let's just create the Firestore doc and maybe a "fake" auth creation for now? 
// The prompt asks to "connect to firebase".
// I will implement `createCompanyAdmin` to just create the Firestore document. 
// The actual Auth user creation usually happens when the user accepts invite or we use a cloud function.
// However, to satisfy the immediate request without backend code:
// I will use a secondary app initialization to create the user without logging out the main user.

import { initializeApp, getApp } from "firebase/app";
import { getAuth as getAuthSecondary, createUserWithEmailAndPassword as createUserSecondary } from "firebase/auth";

const createAuthUserSecondary = async (email: string, pass: string) => {
  const secondaryApp = initializeApp(getApp().options, "Secondary");
  const secondaryAuth = getAuthSecondary(secondaryApp);
  await createUserSecondary(secondaryAuth, email, pass);
  await signOut(secondaryAuth); // Sign out from secondary
  // deleteApp(secondaryApp); // Clean up if possible, but deleteApp is async and might be tricky in some versions.
};

export const changePassword = async (email: string, oldPass: string, newPass: string, isForceReset: boolean = false) => {
  if (!auth.currentUser) throw new Error("No user signed in.");

  // Optional: Re-authenticate with oldPass if needed for security, but for now just update.
  await updatePassword(auth.currentUser, newPass);

  if (isForceReset) {
    const userRef = doc(db, "users", email);
    await updateDoc(userRef, { mustChangePassword: false });
  }
};

// Re-implementing createCompanyAdmin with secondary app workaround
export const createCompanyAdminWithAuth = async (superAdminEmail: string, companyId: string, newUser: User) => {
  const existing = await getUserProfile(newUser.email);
  if (existing) throw new Error("User with this email already exists.");

  const phoneErr = validatePhone(newUser.phone);
  if (phoneErr) throw new Error(phoneErr);

  // Validate Domain
  const companyDoc = await getDoc(doc(db, "companies", companyId));
  if (companyDoc.exists()) {
    const company = companyDoc.data() as Company;
    if (company.domain && !validateDomain(newUser.email, company.domain)) {
      throw new Error(`Admin email must belong to domain: @${company.domain}`);
    }
  }

  // Create Auth User (Secondary App Workaround)
  // Note: This is a hack for client-side only apps.
  try {
    await createAuthUserSecondary(newUser.email, newUser.password);
  } catch (e: any) {
    if (e.code === 'auth/email-already-in-use') {
      // Continue if auth exists but firestore doesn't (sync issue)
    } else {
      throw e;
    }
  }

  const admin: User = {
    ...newUser,
    role: 'admin',
    companyId: companyId,
    created: Date.now(),
    createdBy: superAdminEmail
  };

  // Use Email as ID for simplicity in migration, or use Auth UID?
  // Existing app uses email heavily. Let's stick to email as ID in Firestore for now to minimize refactor risk, 
  // OR map email to UID. 
  // Let's use a generated ID or Email. Email is unique.
  // But Firestore paths with email can be tricky if they have special chars? No, usually fine.
  // Let's use a safe ID or just auto-id and query by email.
  // I'll use `setDoc` with email as ID if possible, or just `addDoc`.
  // The existing `getUsers` returns an array.

  // Let's use `setDoc` with email as document ID (sanitized?)
  // Actually, let's just use `addDoc` (auto ID) and query by email.
  // But `saveCompany` used `setDoc` with `company.id`.

  // Let's use `setDoc` with a custom ID (e.g. email) to ensure uniqueness easily?
  // No, let's use `addDoc` and rely on queries.

  await setDoc(doc(db, "users", newUser.email), admin);
};


export const createSubUserWithAuth = async (adminEmail: string, newUser: User) => {
  const creator = await getUserProfile(adminEmail);
  if (!creator || creator.role !== 'admin') {
    throw new Error("Only Company Admins can create sub-users.");
  }

  const existing = await getUserProfile(newUser.email);
  if (existing) throw new Error("User with this email already exists.");

  const phoneErr = validatePhone(newUser.phone);
  if (phoneErr) throw new Error(phoneErr);

  const adminDomain = creator.email.split('@')[1];
  if (!validateDomain(newUser.email, adminDomain)) {
    throw new Error(`Sub-user email must match the Admin's domain: @${adminDomain}`);
  }

  try {
    await createAuthUserSecondary(newUser.email, newUser.password);
  } catch (e: any) {
    if (e.code === 'auth/email-already-in-use') {
      // Continue
    } else {
      throw e;
    }
  }

  const user: User = {
    ...newUser,
    role: 'user',
    companyId: creator.companyId,
    created: Date.now(),
    createdBy: adminEmail
  };

  await setDoc(doc(db, "users", newUser.email), user);
};

export const updateUserProfile = async (originalEmail: string, updates: Partial<User>) => {
  const userRef = doc(db, "users", originalEmail);

  // If email is changing, this is complex in Firestore (need to move doc).
  // For now, assume email doesn't change or block it.
  if (updates.email && updates.email !== originalEmail) {
    throw new Error("Email change not supported in this demo.");
  }

  if (updates.phone) {
    const phoneErr = validatePhone(updates.phone);
    if (phoneErr) throw new Error(phoneErr);
  }

  await updateDoc(userRef, updates);

  // If password changed?
  if (updates.password) {
    // We can't update another user's password from client SDK easily without Admin SDK.
    // We can only update CURRENT user's password.
    // If super admin is resetting, this won't work for Auth.
    // We will just update Firestore and let the user know "Password update in Auth requires re-login or Admin SDK".
    console.warn("Password update in Firestore only. Auth password not updated.");
  }
};

export const deleteUserProfile = async (email: string) => {
  if (email === 'azaamf@gmail.com') throw new Error("Cannot delete Super Admin.");
  await deleteDoc(doc(db, "users", email));
  // Note: Auth user not deleted.
};

// Global Settings
export const getGlobalSettings = async () => {
  const docRef = doc(db, "settings", "global");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return { defaultCompanyLogo: '' };
  }
};

export const saveGlobalSettings = async (settings: { defaultCompanyLogo: string }) => {
  await setDoc(doc(db, "settings", "global"), settings);
};

export const adminResetUserPassword = async (targetEmail: string, tempPass: string) => {
  const userRef = doc(db, "users", targetEmail);
  // Note: This only updates the stored password reference in Firestore. 
  // The actual Firebase Auth password is NOT updated here because client SDK cannot update other users.
  await updateDoc(userRef, { password: tempPass, mustChangePassword: true });
};

// Password Reset
export const sendResetEmail = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};
