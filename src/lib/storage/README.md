# Supabase Storage Implementation

This directory contains the implementation for file storage using Supabase Storage.

## Setup

Before using the storage functionality, make sure to:

1. Run the SQL script in `supabase/storage-setup.sql` in your Supabase SQL editor to create the necessary buckets and policies.
2. Ensure the following environment variables are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Storage Buckets

The implementation uses three buckets:

- `product-images`: For product listings images (publicly accessible)
- `portfolio-items`: For craftsman portfolio items (publicly accessible)
- `message-attachments`: For files shared in messages (private, only accessible to conversation participants)

## Usage

### Uploading Files

```typescript
import { getStorageClient } from '@/lib/storage';
import { uploadProductImage } from '@/lib/storage/upload';

// In a client component
const handleUpload = async (file: File) => {
  const supabase = getStorageClient();
  const userId = 'user-id'; // Get from auth
  const productId = 'product-id';
  
  const result = await uploadProductImage(supabase, file, userId, productId);
  
  if (result.success) {
    // Use result.publicUrl or result.filePath
  } else {
    // Handle error with result.error
  }
};
```

### Getting Public URLs

```typescript
import { getPublicUrl, PRODUCT_IMAGES_BUCKET } from '@/lib/storage';

const imageUrl = getPublicUrl(PRODUCT_IMAGES_BUCKET, 'path/to/file.jpg');
```

### Deleting Files

```typescript
import { getStorageClient, PRODUCT_IMAGES_BUCKET } from '@/lib/storage';
import { deleteFile } from '@/lib/storage/upload';

const handleDelete = async (filePath: string) => {
  const supabase = getStorageClient();
  const result = await deleteFile(supabase, PRODUCT_IMAGES_BUCKET, filePath);
  
  if (result.success) {
    // File deleted successfully
  } else {
    // Handle error with result.error
  }
};
```

## File Size and Type Restrictions

- Product Images: Max 10MB, allowed types: JPEG, PNG, WebP
- Portfolio Items: Max 20MB, allowed types: JPEG, PNG, WebP
- Message Attachments: Max 5MB, allowed types: JPEG, PNG, WebP, PDF, DOC, DOCX

## Security Considerations

- Files are organized by user ID to ensure proper access control
- Storage bucket policies enforce that users can only access their own files
- Public buckets allow read access to anyone, but write access is restricted to authenticated users
- Message attachments are only accessible to conversation participants 