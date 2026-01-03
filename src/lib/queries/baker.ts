import { createClient } from '@/lib/supabase/server';
import type { Baker } from '@/types/database';
import type { PublicBakerView } from '@/types/views';

/**
 * Get the current authenticated user's baker profile
 */
export async function getCurrentBaker(): Promise<Baker | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  return getBakerByUserId(user.id);
}

/**
 * Get baker by their auth user ID
 */
export async function getBakerByUserId(userId: string): Promise<Baker | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('bakers')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Get baker by their public slug (for public availability page)
 * Only returns public-safe fields
 */
export async function getBakerBySlug(slug: string): Promise<PublicBakerView | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('bakers')
    .select('id, business_name, slug, context_message, timezone')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Check if a slug is available
 */
export async function isSlugAvailable(slug: string): Promise<boolean> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('bakers')
    .select('*', { count: 'exact', head: true })
    .eq('slug', slug);

  if (error) {
    throw error;
  }

  return count === 0;
}

/**
 * Get baker by ID
 */
export async function getBakerById(bakerId: string): Promise<Baker | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('bakers')
    .select('*')
    .eq('id', bakerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}
