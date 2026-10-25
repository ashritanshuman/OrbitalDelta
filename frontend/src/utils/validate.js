export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'Please choose a photo.' };
  }

  const isTypeValid = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) || 
                      file.name.match(/\.(png|jpe?g)$/i);
  if (!isTypeValid) {
    return { valid: false, error: 'We could not read this file. Please use a PNG or JPG under 10 MB.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'This file is too large. Please use a photo under 10 MB.' };
  }

  return { valid: true, error: null };
}
