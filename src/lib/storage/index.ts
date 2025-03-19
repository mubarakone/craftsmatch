import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { env } from '@/lib/env';

// Bucket names
export const PRODUCT_IMAGES_BUCKET = 'product-images';
export const PORTFOLIO_BUCKET = 'portfolio-items';
export const ATTACHMENTS_BUCKET = 'message-attachments';

// File size limits (in bytes)
export const MAX_PRODUCT_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_PORTFOLIO_FILE_SIZE = 20 * 1024 * 1024; // 20MB
export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB

// Allowed file types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_ATTACHMENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * Get a Supabase client for storage operations in client components
 */
export function getStorageClient() {
  return createClientComponentClient();
}

/**
 * Get a public URL for a file in a bucket
 */
export function getPublicUrl(bucketName: string, filePath: string) {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Supabase URL or anon key is not defined');
  }
  
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Check if a file type is allowed for upload
 */
export function isFileTypeAllowed(fileType: string, allowedTypes: string[]) {
  return allowedTypes.includes(fileType);
}

/**
 * Check if a file size is within limits
 */
export function isFileSizeAllowed(fileSize: number, maxSize: number) {
  return fileSize <= maxSize;
} 