import sharp from 'sharp';

const PHOTO_TARGET_BYTES = 200 * 1024;
const PHOTO_RESIZE_OPTIONS = { fit: 'inside', withoutEnlargement: true };
const PHOTO_MAX_DIMENSION = 1600;

export async function compressPhoto(buffer) {
  let quality = 80;
  let output = await resizeAndCompress(buffer, quality);

  while (output.length > PHOTO_TARGET_BYTES && quality > 30) {
    quality -= 10;
    output = await resizeAndCompress(buffer, quality);
  }

  return output;
}

function resizeAndCompress(buffer, quality) {
  return sharp(buffer)
    .resize(PHOTO_MAX_DIMENSION, PHOTO_MAX_DIMENSION, PHOTO_RESIZE_OPTIONS)
    .jpeg({ quality })
    .toBuffer();
}
