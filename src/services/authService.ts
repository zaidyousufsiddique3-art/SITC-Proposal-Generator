
import { User, UserRole, Company } from '../types';
import { auth } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser 
} from "firebase/auth";

const STORAGE_KEY_USERS = 'sitc_users';
const STORAGE_KEY_COMPANIES = 'sitc_companies';
const STORAGE_KEY_SETTINGS = 'sitc_settings';

// 20.1 Create Default Super Admin Account
const SEED_SUPER_ADMIN: User = {
  firstName: 'Azaam',
  lastName: 'Fashir',
  dob: '1980-01-01',
  email: 'azaamf@gmail.com',
  phone: '+0000000000',
  password: 'Azaamf@1234', 
  role: 'super_admin',
  created: 1700000000000
};

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

// --- Data Access (Legacy/Local Storage) ---

export const getCompanies = (): Company[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_COMPANIES);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveCompany = (company: Company) => {
  const companies = getCompanies();
  if (companies.find(c => c.name.toLowerCase() === company.name.toLowerCase() && c.id !== company.id)) {
      throw new Error("Company name already exists.");
  }
  
  const existingIdx = companies.findIndex(c => c.id === company.id);
  if (existingIdx >= 0) {
      companies[existingIdx] = company;
  } else {
      companies.push(company);
  }
  localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
};

export const updateCompany = (companyId: string, updates: Partial<Company>) => {
    const companies = getCompanies();
    const idx = companies.findIndex(c => c.id === companyId);
    if (idx === -1) throw new Error("Company not found");
    
    if (updates.name) {
        const dupe = companies.find(c => c.name.toLowerCase() === updates.name!.toLowerCase() && c.id !== companyId);
        if (dupe) throw new Error("Company name already exists");
    }

    companies[idx] = { ...companies[idx], ...updates };
    localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
};

export const deleteCompany = (companyId: string) => {
    let companies = getCompanies();
    companies = companies.filter(c => c.id !== companyId);
    localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
    
    const users = getUsers();
    const updatedUsers = users.map(u => u.companyId === companyId ? { ...u, companyId: undefined } : u);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedUsers));
};

export const getUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_USERS);
    let users: User[] = stored ? JSON.parse(stored) : [];
    
    const superAdminIdx = users.findIndex(u => u.role === 'super_admin');
    if (superAdminIdx === -1) {
        users.push(SEED_SUPER_ADMIN);
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } else {
        if (users[superAdminIdx].email !== SEED_SUPER_ADMIN.email || 
            users[superAdminIdx].firstName !== SEED_SUPER_ADMIN.firstName || 
            users[superAdminIdx].lastName !== SEED_SUPER_ADMIN.lastName) {
             users[superAdminIdx] = { ...users[superAdminIdx], ...SEED_SUPER_ADMIN, password: users[superAdminIdx].password };
             localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
        }
    }

    return users;
  } catch (e) {
    return [SEED_SUPER_ADMIN]; 
  }
};

export const createCompanyAdmin = (superAdminEmail: string, companyId: string, newUser: User): void => {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
    throw new Error("User with this email already exists.");
  }
  
  const phoneErr = validatePhone(newUser.phone);
  if (phoneErr) throw new Error(phoneErr);

  const companies = getCompanies();
  const company = companies.find(c => c.id === companyId);
  if (company && company.domain) {
      if (!validateDomain(newUser.email, company.domain)) {
          throw new Error(`Admin email must belong to domain: @${company.domain}`);
      }
  }

  const admin: User = {
      ...newUser,
      role: 'admin',
      companyId: companyId,
      created: Date.now(),
      createdBy: superAdminEmail
  };

  users.push(admin);
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

export const createSubUser = (adminEmail: string, newUser: User): void => {
  const users = getUsers();
  const creator = users.find(u => u.email === adminEmail);
  
  if (!creator || creator.role !== 'admin') {
      throw new Error("Only Company Admins can create sub-users.");
  }

  if (users.find(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
    throw new Error("User with this email already exists.");
  }
  
  const phoneErr = validatePhone(newUser.phone);
  if (phoneErr) throw new Error(phoneErr);

  const adminDomain = creator.email.split('@')[1];
  if (!validateDomain(newUser.email, adminDomain)) {
      throw new Error(`Sub-user email must match the Admin's domain: @${adminDomain}`);
  }

  const user: User = {
    ...newUser,
    role: 'user',
    companyId: creator.companyId,
    created: Date.now(),
    createdBy: adminEmail
  };

  users.push(user);
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

export const updateUser = (originalEmail: string, updates: Partial<User>): User => {
  const users = getUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === originalEmail.toLowerCase());
  
  if (index === -1) throw new Error("User not found.");

  if (updates.email && updates.email.toLowerCase() !== originalEmail.toLowerCase()) {
      const conflict = users.find(u => u.email.toLowerCase() === updates.email!.toLowerCase());
      if (conflict) throw new Error("Email already in use by another user.");
  }
  
  if (updates.phone) {
      const phoneErr = validatePhone(updates.phone);
      if (phoneErr) throw new Error(phoneErr);
  }

  const updatedUser = { ...users[index], ...updates };
  users[index] = updatedUser;
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  return updatedUser;
};

export const adminResetUserPassword = (targetEmail: string, tempPass: string) => {
    const users = getUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === targetEmail.toLowerCase());
    if (index === -1) throw new Error("User not found");

    users[index].password = tempPass;
    users[index].mustChangePassword = true; 
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

export const deleteUser = (emailToDelete: string) => {
    if (emailToDelete.toLowerCase() === 'azaamf@gmail.com') {
        throw new Error("Cannot delete Super Admin.");
    }
    const users = getUsers().filter(u => u.email.toLowerCase() !== emailToDelete.toLowerCase());
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

// Synchronous Legacy Authentication (Preserved for App.tsx)
export const authenticate = (email: string, pass: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
  return user || null;
};

export const changePassword = (email: string, oldPass: string, newPass: string, isForceReset: boolean = false): void => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (userIndex === -1) throw new Error("User not found");
  
  if (users[userIndex].password !== oldPass) {
    throw new Error("Incorrect current password");
  }

  const validationError = validatePassword(newPass);
  if (validationError) throw new Error(validationError);

  users[userIndex].password = newPass;
  if (isForceReset) {
      users[userIndex].mustChangePassword = false;
  }
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

export const recoverUsername = (phone: string): string | null => {
    const users = getUsers();
    const user = users.find(u => u.phone === phone);
    return user ? user.email : null;
};

export const recoverPassword = (email: string): boolean => {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return !!user;
};

export const getGlobalSettings = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return stored ? JSON.parse(stored) : { defaultCompanyLogo: '' };
  } catch {
    return { defaultCompanyLogo: '' };
  }
};

export const saveGlobalSettings = (settings: { defaultCompanyLogo: string }) => {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
};

// --- Firebase Integration (v9 Modular) ---

export const registerUser = async (email: string, pass: string) => {
  return createUserWithEmailAndPassword(auth, email, pass);
};

export const loginUser = async (email: string, pass: string) => {
  return signInWithEmailAndPassword(auth, email, pass);
};

export const logoutUser = async () => {
  return signOut(auth);
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};
