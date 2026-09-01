import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'i4irbhvz',
  api_key: process.env.CLOUDINARY_API_KEY || '487739485683547',
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Uploads a base64 image to Cloudinary under an isolated shop folder.
 * Guarantees no images get mixed between different showroom owners.
 *
 * @param base64Data - Data URI or raw base64 string
 * @param shopId - Unique ID of the jewelry showroom owner
 * @returns Secure HTTPS CDN URL of the uploaded image
 */
export async function uploadImageToCloudinary(
  base64Data: string,
  shopId: string
): Promise<string> {
  // If already an HTTP/HTTPS URL, return as-is
  if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
    return base64Data;
  }

  // If Cloudinary credentials are not configured yet, return fallback base64
  if (!process.env.CLOUDINARY_API_SECRET) {
    console.warn("⚠️ CLOUDINARY_API_SECRET missing in environment. Saving inline base64 fallback.");
    return base64Data;
  }

  const cleanBase64 = base64Data.startsWith('data:')
    ? base64Data
    : `data:image/jpeg;base64,${base64Data}`;

  // Unique isolated folder for each shop owner
  const sanitizedShopId = shopId.replace(/[^a-zA-Z0-9_-]/g, '');
  const shopFolder = `jewelbot_shops/shop_${sanitizedShopId}`;

  const uploadResult = await cloudinary.uploader.upload(cleanBase64, {
    folder: shopFolder,
    resource_type: 'image',
    transformation: [
      { width: 1080, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }
    ]
  });

  return uploadResult.secure_url;
}
