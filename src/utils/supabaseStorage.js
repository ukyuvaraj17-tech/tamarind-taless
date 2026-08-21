import { supabase } from '../supabase';

const BUCKET = 'images';

// Uploads a File to Supabase Storage and returns its public URL. Filenames are
// prefixed with a timestamp so two admins uploading a same-named file never
// collide and silently overwrite each other's photo.
export async function uploadToStorage(file, folder = 'products') {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_');
  const path = `${folder}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
