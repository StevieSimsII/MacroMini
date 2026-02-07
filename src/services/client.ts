import { createClient } from '@/lib/supabase/client';
import { storagePath } from '@/lib/utils';
import type { FoodItem, LogEntry, AnalysisResult, MealType, LogStatus, Profile } from '@/lib/types';

/* ============================================================
   Client-side mutation services
   ============================================================ */

function supabase() {
  return createClient();
}

// --- Auth ---
export async function signOut() {
  await supabase().auth.signOut();
  window.location.href = '/login';
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase().auth.getUser();
  return user;
}

// --- Image Upload ---
export async function uploadFoodImage(
  userId: string,
  file: File
): Promise<{ path: string; publicUrl: string }> {
  const path = storagePath(userId, file.name);
  const sb = supabase();

  const { error } = await sb.storage
    .from('food-images')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw error;

  const { data } = sb.storage.from('food-images').getPublicUrl(path);

  return { path, publicUrl: data.publicUrl };
}

// --- Image helpers ---
/** Resize an image to fit within maxDim and return a JPEG base64 string */
async function compressImage(file: File, maxDim = 1024, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      // toDataURL returns "data:image/jpeg;base64,XXXX"
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl.split(',')[1]);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// --- AI Analysis ---
export async function analyzeImage(imageFile: File): Promise<AnalysisResult> {
  // Compress & convert to base64 (keeps payload well under 10 MB)
  const base64 = await compressImage(imageFile);

  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: base64, mimeType: 'image/jpeg' }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Analysis failed');
  }

  return res.json();
}

// --- Food Items CRUD ---
export async function createFoodItem(
  item: Omit<FoodItem, 'id' | 'created_at' | 'updated_at'>
): Promise<FoodItem> {
  const { data, error } = await supabase()
    .from('food_items')
    .insert(item as Record<string, unknown>)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as FoodItem;
}

export async function updateFoodItem(
  id: string,
  updates: Partial<FoodItem>
): Promise<FoodItem> {
  const { data, error } = await supabase()
    .from('food_items')
    .update({ ...updates, updated_at: new Date().toISOString() } as Record<string, unknown>)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as FoodItem;
}

export async function deleteFoodItem(id: string) {
  const { error } = await supabase().from('food_items').delete().eq('id', id);
  if (error) throw error;
}

// --- Log Entries CRUD ---
export async function createLogEntry(entry: {
  user_id: string;
  food_item_id: string;
  status: LogStatus;
  meal_type: MealType;
  quantity?: number;
  notes?: string;
  logged_at?: string;
}): Promise<LogEntry> {
  const { data, error } = await supabase()
    .from('log_entries')
    .insert({
      ...entry,
      quantity: entry.quantity ?? 1,
      logged_at: entry.logged_at ?? new Date().toISOString(),
    } as Record<string, unknown>)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as LogEntry;
}

export async function updateLogEntry(
  id: string,
  updates: Partial<LogEntry>
) {
  const { error } = await supabase()
    .from('log_entries')
    .update(updates as Record<string, unknown>)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteLogEntry(id: string) {
  const { error } = await supabase().from('log_entries').delete().eq('id', id);
  if (error) throw error;
}

// --- Profile ---
export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
) {
  const { error } = await supabase()
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() } as Record<string, unknown>)
    .eq('id', userId);

  if (error) throw error;
}

// --- Export ---
export async function exportUserData(userId: string) {
  const sb = supabase();
  const [foodRes, logRes] = await Promise.all([
    sb.from('food_items').select('*').eq('user_id', userId),
    sb.from('log_entries').select('*, food_item:food_items(name, calories, protein_g, carbs_g, fat_g)').eq('user_id', userId).order('logged_at', { ascending: false }),
  ]);

  return {
    food_items: foodRes.data ?? [],
    log_entries: logRes.data ?? [],
    exported_at: new Date().toISOString(),
  };
}
