import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;

export const fetchHotelData = async (hotelName: string, websiteUrl?: string): Promise<{ images: string[], address: string }> => {
  if (!apiKey) {
    console.warn("API Key missing. Returning placeholder data.");
    return getMockData();
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const context = websiteUrl ? `The hotel's website is: ${websiteUrl}` : '';
    
    const prompt = `
      Find information for the hotel: "${hotelName}". ${context}
      1. Find the physical address.
      2. Search for exactly 3 high-quality image URLs:
         - Image 1: Hotel Exterior / Building
         - Image 2: Standard Guest Room
         - Image 3: Meeting Room / Conference Hall
      
      Return the data in this JSON format:
      {
        "address": "string",
        "images": ["exterior_url", "room_url", "meeting_url"]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from Gemini");

    // Clean up markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const data = JSON.parse(text);
    
    // Validate image URLs
    const images = (data.images || []).filter((url: string) => url.startsWith('http'));
    
    // Ensure we have 3 images, fill with mocks if missing
    while (images.length < 3) {
      images.push(`https://picsum.photos/800/600?random=${Math.random()}`);
    }
    
    return {
      address: data.address || "Address available on request",
      images: images
    };

  } catch (error) {
    console.error("Error fetching hotel data:", error);
    return getMockData();
  }
};

const getMockImages = () => [
  `https://picsum.photos/800/600?random=${Math.random()}`, // Exterior
  `https://picsum.photos/800/600?random=${Math.random()}`, // Room
  `https://picsum.photos/800/600?random=${Math.random()}`  // Meeting
];

const getMockData = () => ({
  address: "Amman, Jordan",
  images: getMockImages()
});