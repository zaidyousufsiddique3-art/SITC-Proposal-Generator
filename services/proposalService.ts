<<<<<<< HEAD
import { db } from '../src/firebase';
import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    where
} from 'firebase/firestore';
import { ProposalData, User } from '../types';

export const getProposals = async (user: User): Promise<ProposalData[]> => {
    try {
        console.log("=== GET PROPOSALS START ===");
        console.log("User role:", user.role);
        console.log("User email:", user.email);
        console.log("User companyId:", user.companyId);

        let q;
        if (user.role === 'super_admin' || user.role === 'owner') {
            // Fetch all proposals
            console.log("Fetching all proposals (super admin)");
            q = query(collection(db, "proposals"));
        } else if (user.role === 'admin') {
            // Fetch company proposals
            console.log("Fetching company proposals (admin)");
            q = query(collection(db, "proposals"), where("companyId", "==", user.companyId));
        } else {
            // Fetch own proposals
            console.log("Fetching own proposals (user)");
            q = query(collection(db, "proposals"), where("createdBy", "==", user.email));
        }

        const querySnapshot = await getDocs(q);
        const proposals = querySnapshot.docs.map(doc => doc.data() as ProposalData);

        // Sort client-side by lastModified descending
        proposals.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));

        console.log("Fetched proposals count:", proposals.length);
        console.log("Proposals:", proposals.map(p => ({ id: p.id, name: p.proposalName, isDraft: p.isDraft, createdBy: p.createdBy })));
        console.log("=== GET PROPOSALS END ===");
        return proposals;
    } catch (e) {
        console.error("=== GET PROPOSALS ERROR ===", e);
        return [];
    }
};


// Helper to replace undefined with null recursively
const sanitizeData = (data: any): any => {
    if (data === undefined) return null;
    if (data === null) return null;
    if (Array.isArray(data)) {
        return data.map(sanitizeData);
    }
    if (typeof data === 'object') {
        const sanitized: any = {};
        for (const key in data) {
            sanitized[key] = sanitizeData(data[key]);
        }
        return sanitized;
    }
    return data;
};

export const saveProposal = async (proposal: ProposalData) => {
    console.log("saveProposal called with ID:", proposal.id);
    const sanitizedProposal = sanitizeData({ ...proposal, isDraft: false });
    console.log("Sanitized proposal:", sanitizedProposal);
    await setDoc(doc(db, "proposals", proposal.id), sanitizedProposal);
    console.log("setDoc completed for proposal");
};

export const saveDraft = async (proposal: ProposalData) => {
    console.log("saveDraft called with ID:", proposal.id);
    const sanitizedProposal = sanitizeData({ ...proposal, isDraft: true });
    console.log("Sanitized draft:", sanitizedProposal);
    await setDoc(doc(db, "proposals", proposal.id), sanitizedProposal);
    console.log("setDoc completed for draft");
};

// Simple debounce for auto-save
let autoSaveTimer: any = null;
export const autoSaveDraft = (proposal: ProposalData, onSave?: () => void) => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(async () => {
        await saveDraft(proposal);
        if (onSave) onSave();
    }, 3000); // 3 seconds debounce
};

export const deleteProposal = async (id: string) => {
    // Soft delete or hard delete?
    // App.tsx logic was soft delete (isDeleted: true).
    // Let's stick to soft delete if we want to keep history, or hard delete.
    // The previous code did: return { ...p, isDeleted: true };
    // So we should update the doc.
    await setDoc(doc(db, "proposals", id), { isDeleted: true }, { merge: true });
};
=======
import { db } from '../src/firebase';
import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    where
} from 'firebase/firestore';
import { ProposalData, User } from '../types';

export const getProposals = async (user: User): Promise<ProposalData[]> => {
    try {
        console.log("=== GET PROPOSALS START ===");
        console.log("User role:", user.role);
        console.log("User email:", user.email);
        console.log("User companyId:", user.companyId);

        let q;
        if (user.role === 'super_admin' || user.role === 'owner') {
            // Fetch all proposals
            console.log("Fetching all proposals (super admin)");
            q = query(collection(db, "proposals"));
        } else if (user.role === 'admin') {
            // Fetch company proposals
            console.log("Fetching company proposals (admin)");
            q = query(collection(db, "proposals"), where("companyId", "==", user.companyId));
        } else {
            // Fetch own proposals
            console.log("Fetching own proposals (user)");
            q = query(collection(db, "proposals"), where("createdBy", "==", user.email));
        }

        const querySnapshot = await getDocs(q);
        const proposals = querySnapshot.docs.map(doc => doc.data() as ProposalData);

        // Sort client-side by lastModified descending
        proposals.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));

        console.log("Fetched proposals count:", proposals.length);
        console.log("Proposals:", proposals.map(p => ({ id: p.id, name: p.proposalName, isDraft: p.isDraft, createdBy: p.createdBy })));
        console.log("=== GET PROPOSALS END ===");
        return proposals;
    } catch (e) {
        console.error("=== GET PROPOSALS ERROR ===", e);
        return [];
    }
};


// Helper to replace undefined with null recursively
const sanitizeData = (data: any): any => {
    if (data === undefined) return null;
    if (data === null) return null;
    if (Array.isArray(data)) {
        return data.map(sanitizeData);
    }
    if (typeof data === 'object') {
        const sanitized: any = {};
        for (const key in data) {
            sanitized[key] = sanitizeData(data[key]);
        }
        return sanitized;
    }
    return data;
};

export const saveProposal = async (proposal: ProposalData) => {
    console.log("saveProposal called with ID:", proposal.id);
    const sanitizedProposal = sanitizeData({ ...proposal, isDraft: false });
    console.log("Sanitized proposal:", sanitizedProposal);
    await setDoc(doc(db, "proposals", proposal.id), sanitizedProposal);
    console.log("setDoc completed for proposal");
};

export const saveDraft = async (proposal: ProposalData) => {
    console.log("saveDraft called with ID:", proposal.id);
    const sanitizedProposal = sanitizeData({ ...proposal, isDraft: true });
    console.log("Sanitized draft:", sanitizedProposal);
    await setDoc(doc(db, "proposals", proposal.id), sanitizedProposal);
    console.log("setDoc completed for draft");
};

// Simple debounce for auto-save
let autoSaveTimer: any = null;
export const autoSaveDraft = (proposal: ProposalData, onSave?: () => void) => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(async () => {
        await saveDraft(proposal);
        if (onSave) onSave();
    }, 3000); // 3 seconds debounce
};

export const deleteProposal = async (id: string) => {
    // Soft delete or hard delete?
    // App.tsx logic was soft delete (isDeleted: true).
    // Let's stick to soft delete if we want to keep history, or hard delete.
    // The previous code did: return { ...p, isDeleted: true };
    // So we should update the doc.
    await setDoc(doc(db, "proposals", id), { isDeleted: true }, { merge: true });
};
>>>>>>> b870ebc28be0c3b737721a51d4708bfa245f5e8e
