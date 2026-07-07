import { supabase } from '../config/db.js';
import path from 'path';

/**
 * Uploads a file buffer to Supabase Storage and returns the public URL.
 * @param {import('express-fileupload').UploadedFile | Express.Multer.File} file - multer file object (memoryStorage)
 * @returns {Promise<string>} public URL of the uploaded file
 */
export async function uploadToSupabase(file) {
  if (!file) return '';

  if (!supabase) {
    // Fallback mode — return an empty string (no persistent storage available)
    console.warn('Supabase not connected, skipping file upload.');
    return '';
  }

  const ext = path.extname(file.originalname || file.name || '');
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  const { error } = await supabase.storage
    .from('uploads')
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    console.error('Supabase Storage upload error:', error.message);
    throw new Error('File upload failed: ' + error.message);
  }

  const { data } = supabase.storage.from('uploads').getPublicUrl(filename);
  return data.publicUrl;
}
