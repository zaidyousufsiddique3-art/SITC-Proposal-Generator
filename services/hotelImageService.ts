
const SERPSTACK_API_KEY = '93a934699218d5eb9c16b06f4a7e0868';

export const fetchHotelImageFromSerpStack = async (hotelName: string): Promise<string | null> => {
  if (!hotelName) return null;

  const query = encodeURIComponent(`${hotelName} hotel luxury exterior`);
  
  // SerpStack Free Tier often only supports HTTP. 
  // If the app is served via HTTPS, this might cause a Mixed Content warning.
  // We attempt HTTPS first, but in production with a paid key, HTTPS is standard.
  const url = `https://api.serpstack.com/search?access_key=${SERPSTACK_API_KEY}&query=${query}&type=images&num=5`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.image_results && data.image_results.length > 0) {
      // Get the first image result
      return data.image_results[0].image_url;
    }
    
    // Fallback: If no image_results (sometimes depends on plan), check organic results for generic images (less reliable)
    console.warn("SerpStack: No direct image results found.");
    return null;

  } catch (error) {
    console.error("Error fetching hotel image from SerpStack:", error);
    return null;
  }
};
