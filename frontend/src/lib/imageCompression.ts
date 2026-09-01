/**
 * Client-Side Image Auto-Compression Utility
 * Uses native HTML5 Canvas to downscale and compress camera photos (5MB - 12MB)
 * to ~150KB - 250KB at 1080px resolution (82% JPEG quality).
 * Reduces server memory load and bandwidth by 98% while keeping jewelry details crystal clear.
 */

export interface CompressionResult {
  compressedBase64: string;
  compressedFile: File;
  originalSizeKB: number;
  compressedSizeKB: number;
  reductionPercent: number;
}

export async function compressImage(
  file: File,
  maxDimension: number = 1080,
  quality: number = 0.82
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    // If not an image, pass through
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          compressedBase64: reader.result as string,
          compressedFile: file,
          originalSizeKB: Math.round(file.size / 1024),
          compressedSizeKB: Math.round(file.size / 1024),
          reductionPercent: 0
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Preserve aspect ratio while scaling to maxDimension (1080px)
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback if canvas context is unavailable
          const base64 = event.target?.result as string;
          resolve({
            compressedBase64: base64,
            compressedFile: file,
            originalSizeKB: Math.round(file.size / 1024),
            compressedSizeKB: Math.round(file.size / 1024),
            reductionPercent: 0
          });
          return;
        }

        // Apply high-quality bicubic interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);

        canvas.toBlob((blob) => {
          const finalBlob = blob || file;
          const compressedFile = new File(
            [finalBlob],
            file.name.replace(/\.[^/.]+$/, "") + ".jpg",
            { type: 'image/jpeg', lastModified: Date.now() }
          );

          const origKB = Math.round(file.size / 1024);
          const compKB = Math.round(compressedFile.size / 1024);
          const reduction = origKB > 0 ? Math.round(((origKB - compKB) / origKB) * 100) : 0;

          resolve({
            compressedBase64,
            compressedFile,
            originalSizeKB: origKB,
            compressedSizeKB: compKB,
            reductionPercent: Math.max(0, reduction)
          });
        }, 'image/jpeg', quality);
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}
