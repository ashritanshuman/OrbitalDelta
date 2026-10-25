export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'NO FILE SELECTED' };
  }

  const isTypeValid = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) || 
                      file.name.match(/\.(png|jpe?g)$/i);
  if (!isTypeValid) {
    return { valid: false, error: 'INVALID FORMAT. REQUIRE PNG OR JPG.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'FILE EXCEEDS MAXIMUM 10MB CAPACITY.' };
  }

  return { valid: true, error: null };
}
