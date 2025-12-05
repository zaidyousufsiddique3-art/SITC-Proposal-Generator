import { uploadImageToStorage, generateImagePath, isBase64Image } from './imageService';
import { ProposalData } from '../types';

/**
 * Migrates all base64 images in a proposal to Firebase Storage
 * @param proposalId - The ID of the proposal to migrate
 * @returns Updated proposal data with Storage URLs
 */
export const migrateProposalImages = async (proposalId: string, proposalData: ProposalData): Promise<ProposalData> => {
    const updatedData = { ...proposalData };

    try {
        // Migrate branding images
        if (updatedData.branding.clientLogo && isBase64Image(updatedData.branding.clientLogo)) {
            const url = await uploadImageToStorage(
                updatedData.branding.clientLogo,
                generateImagePath(proposalId, 'branding', 'clientLogo.png')
            );
            updatedData.branding.clientLogo = url;
        }

        if (updatedData.branding.companyLogo && isBase64Image(updatedData.branding.companyLogo)) {
            const url = await uploadImageToStorage(
                updatedData.branding.companyLogo,
                generateImagePath(proposalId, 'branding', 'companyLogo.png')
            );
            updatedData.branding.companyLogo = url;
        }

        // Migrate hotel images
        for (let i = 0; i < updatedData.hotelOptions.length; i++) {
            const hotel = updatedData.hotelOptions[i];
            for (let j = 0; j < hotel.images.length; j++) {
                if (isBase64Image(hotel.images[j].url)) {
                    const url = await uploadImageToStorage(
                        hotel.images[j].url,
                        generateImagePath(proposalId, `hotels/${i}`, `image${j}.png`)
                    );
                    hotel.images[j].url = url;
                }
            }
        }

        // Migrate transportation images
        for (let i = 0; i < updatedData.transportation.length; i++) {
            const transport = updatedData.transportation[i];
            if (transport.image && isBase64Image(transport.image)) {
                const url = await uploadImageToStorage(
                    transport.image,
                    generateImagePath(proposalId, `transportation`, `vehicle${i}.png`)
                );
                transport.image = url;
            }
        }

        // Migrate activity images
        for (let i = 0; i < updatedData.activities.length; i++) {
            const activity = updatedData.activities[i];
            if (activity.image && isBase64Image(activity.image)) {
                const url = await uploadImageToStorage(
                    activity.image,
                    generateImagePath(proposalId, `activities`, `activity${i}.png`)
                );
                activity.image = url;
            }
        }

        return updatedData;
    } catch (error) {
        console.error('Error migrating proposal images:', error);
        throw error;
    }
};

/**
 * Auto-migrates proposal images before saving if they're base64
 * Call this function in your save logic
 */
export const autoMigrateBeforeSave = async (proposalData: ProposalData): Promise<ProposalData> => {
    // Check if there are any base64 images
    const hasBase64 =
        (proposalData.branding.clientLogo && isBase64Image(proposalData.branding.clientLogo)) ||
        (proposalData.branding.companyLogo && isBase64Image(proposalData.branding.companyLogo)) ||
        proposalData.hotelOptions.some(h => h.images.some(img => isBase64Image(img.url))) ||
        proposalData.transportation.some(t => t.image && isBase64Image(t.image)) ||
        proposalData.activities.some(a => a.image && isBase64Image(a.image));

    if (hasBase64) {
        console.log('Base64 images detected, migrating to Firebase Storage...');
        return await migrateProposalImages(proposalData.id, proposalData);
    }

    return proposalData;
};
