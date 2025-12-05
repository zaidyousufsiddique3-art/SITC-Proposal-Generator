import { storage } from '../src/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Uploads a base64 image to Firebase Storage and returns the download URL
 * @param base64Image - Base64 encoded image string (with data:image/... prefix)
 * @param path - Storage path (e.g., 'proposals/123/logo.png')
 * @returns Download URL for the uploaded image
 */
export const uploadImageToStorage = async (
    base64Image: string,
    path: string
): Promise<string> => {
    try {
        // Convert base64 to blob
        const response = await fetch(base64Image);
        const blob = await response.blob();

        // Upload to Firebase Storage
        const imageRef = storageRef(storage, path);
        await uploadBytes(imageRef, blob);

        // Get and return the download URL
        const url = await getDownloadURL(imageRef);
        return url;
    } catch (error) {
        console.error('Error uploading image to storage:', error);
        throw error;
    }
};

/**
 * Deletes an image from Firebase Storage
 * @param path - Storage path of the image to delete
 */
export const deleteImageFromStorage = async (path: string): Promise<void> => {
    try {
        const imageRef = storageRef(storage, path);
        await deleteObject(imageRef);
    } catch (error) {
        console.error('Error deleting image from storage:', error);
        // Don't throw - image might not exist
    }
};

/**
 * Checks if a string is a base64 image
 */
export const isBase64Image = (str: string): boolean => {
    return str?.startsWith('data:image/') || false;
};

/**
 * Generates a unique storage path for an image
 * @param proposalId - Proposal ID
 * @param category - Image category (e.g., 'branding', 'hotel', 'transport')
 * @param filename - Optional filename
 */
export const generateImagePath = (
    proposalId: string,
    category: string,
    filename?: string
): string => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const name = filename || `${category}_${timestamp}_${randomId}.png`;
    return `proposals/${proposalId}/${category}/${name}`;
};
