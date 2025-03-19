import { v4 as uuidv4 } from 'uuid';
import type { SupabaseClient } from '@supabase/supabase-js';
import { 
  ALLOWED_ATTACHMENT_TYPES,
  ALLOWED_IMAGE_TYPES,
  ATTACHMENTS_BUCKET,
  PORTFOLIO_BUCKET, 
  PRODUCT_IMAGES_BUCKET,
  MAX_ATTACHMENT_SIZE,
  MAX_PORTFOLIO_FILE_SIZE,
  MAX_PRODUCT_IMAGE_SIZE,
  isFileTypeAllowed,
  isFileSizeAllowed
} from './index';

export interface UploadResult {
  success: boolean;
  filePath?: string;
  publicUrl?: string;
  error?: string;
}

/**
 * Generate a unique file path for upload
 */
export function generateFilePath(fileName: string, userId: string, prefix?: string) {
  const extension = fileName.split('.').pop();
  const uniqueId = uuidv4();
  const basePath = prefix ? `${userId}/${prefix}` : userId;
  return `${basePath}/${uniqueId}.${extension}`;
}

/**
 * Upload a product image
 */
export async function uploadProductImage(
  supabase: SupabaseClient,
  file: File,
  userId: string,
  productId: string
): Promise<UploadResult> {
  // Validate file type and size
  if (!isFileTypeAllowed(file.type, ALLOWED_IMAGE_TYPES)) {
    return { success: false, error: 'File type not allowed. Please upload JPG, PNG, or WebP images.' };
  }

  if (!isFileSizeAllowed(file.size, MAX_PRODUCT_IMAGE_SIZE)) {
    return { success: false, error: 'File too large. Maximum size is 10MB.' };
  }

  // Generate file path
  const filePath = generateFilePath(file.name, userId, `products/${productId}`);

  // Upload the file
  const { data, error } = await supabase
    .storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  // Get public URL
  const { data: urlData } = supabase
    .storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(filePath);

  return {
    success: true,
    filePath: data.path,
    publicUrl: urlData.publicUrl,
  };
}

/**
 * Upload a portfolio item
 */
export async function uploadPortfolioItem(
  supabase: SupabaseClient,
  file: File,
  userId: string
): Promise<UploadResult> {
  // Validate file type and size
  if (!isFileTypeAllowed(file.type, ALLOWED_IMAGE_TYPES)) {
    return { success: false, error: 'File type not allowed. Please upload JPG, PNG, or WebP images.' };
  }

  if (!isFileSizeAllowed(file.size, MAX_PORTFOLIO_FILE_SIZE)) {
    return { success: false, error: 'File too large. Maximum size is 20MB.' };
  }

  // Generate file path
  const filePath = generateFilePath(file.name, userId, 'portfolio');

  // Upload the file
  const { data, error } = await supabase
    .storage
    .from(PORTFOLIO_BUCKET)
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  // Get public URL
  const { data: urlData } = supabase
    .storage
    .from(PORTFOLIO_BUCKET)
    .getPublicUrl(filePath);

  return {
    success: true,
    filePath: data.path,
    publicUrl: urlData.publicUrl,
  };
}

/**
 * Upload a message attachment
 */
export async function uploadMessageAttachment(
  supabase: SupabaseClient,
  file: File,
  userId: string,
  conversationId: string
): Promise<UploadResult> {
  // Validate file type and size
  if (!isFileTypeAllowed(file.type, ALLOWED_ATTACHMENT_TYPES)) {
    return { 
      success: false, 
      error: 'File type not allowed. Please upload images, PDFs, or document files.' 
    };
  }

  if (!isFileSizeAllowed(file.size, MAX_ATTACHMENT_SIZE)) {
    return { success: false, error: 'File too large. Maximum size is 5MB.' };
  }

  // Generate file path
  const filePath = generateFilePath(file.name, userId, `messages/${conversationId}`);

  // Upload the file
  const { data, error } = await supabase
    .storage
    .from(ATTACHMENTS_BUCKET)
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  // Get public URL
  const { data: urlData } = supabase
    .storage
    .from(ATTACHMENTS_BUCKET)
    .getPublicUrl(filePath);

  return {
    success: true,
    filePath: data.path,
    publicUrl: urlData.publicUrl,
  };
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  supabase: SupabaseClient,
  bucketName: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .storage
    .from(bucketName)
    .remove([filePath]);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
} 