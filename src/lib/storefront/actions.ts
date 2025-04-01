'use server';

import { db } from '@/lib/db';
import { storefronts, storefrontCustomization } from '@/lib/db/schema';
import { auth } from '@/lib/auth/utils';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { generateSlug } from '@/lib/utils';
import { StorefrontFormValues } from '../validators/storefront';

/**
 * Creates a new storefront
 */
export async function createStorefront(data: StorefrontFormValues): Promise<string> {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('You must be logged in to create a storefront');
  }

  // Generate a unique slug if not provided
  let slug = data.slug;
  if (!slug) {
    slug = generateSlug(data.name);
  }

  // Check if slug already exists
  const existingStorefront = await db.select({ id: storefronts.id })
    .from(storefronts)
    .where(eq(storefronts.slug, slug))
    .limit(1);

  if (existingStorefront.length > 0) {
    throw new Error('A storefront with this URL already exists. Please choose a different URL.');
  }

  // Create the storefront
  const [newStorefront] = await db.insert(storefronts)
    .values({
      userId: session.user.id,
      name: data.name,
      description: data.description,
      slug,
      location: data.location,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
    })
    .returning({ id: storefronts.id });

  if (!newStorefront?.id) {
    throw new Error('Failed to create storefront');
  }

  // Create default customization
  await db.insert(storefrontCustomization)
    .values({
      storefrontId: newStorefront.id,
      primaryColor: '#4f46e5',
      secondaryColor: '#f43f5e',
      accentColor: '#10b981',
      fontFamily: 'Inter',
      headerLayout: 'standard',
      productCardStyle: 'standard',
    });

  revalidatePath('/storefront');
  return newStorefront.id;
}

/**
 * Updates a storefront's appearance settings
 */
export async function updateStorefrontAppearance(
  storefrontId: string, 
  data: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    headerLayout: string;
    productCardStyle: string;
    customCss?: string;
  }
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('You must be logged in to update a storefront');
  }

  // Verify ownership
  const storefront = await db.select({ userId: storefronts.userId })
    .from(storefronts)
    .where(eq(storefronts.id, storefrontId))
    .limit(1);

  if (storefront.length === 0) {
    return notFound();
  }

  if (storefront[0].userId !== session.user.id) {
    throw new Error('You do not have permission to update this storefront');
  }

  // Update customization
  await db.update(storefrontCustomization)
    .set({
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      accentColor: data.accentColor,
      fontFamily: data.fontFamily,
      headerLayout: data.headerLayout,
      productCardStyle: data.productCardStyle,
      customCss: data.customCss,
      updatedAt: new Date(),
    })
    .where(eq(storefrontCustomization.storefrontId, storefrontId));

  revalidatePath(`/storefront/customize?id=${storefrontId}`);
  revalidatePath(`/storefront/preview?id=${storefrontId}`);
}

/**
 * Updates storefront general information
 */
export async function updateStorefrontInfo(
  storefrontId: string,
  data: Partial<StorefrontFormValues>
) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('You must be logged in to update a storefront');
  }

  // Verify ownership
  const storefront = await db.select({ userId: storefronts.userId })
    .from(storefronts)
    .where(eq(storefronts.id, storefrontId))
    .limit(1);

  if (storefront.length === 0) {
    return notFound();
  }

  if (storefront[0].userId !== session.user.id) {
    throw new Error('You do not have permission to update this storefront');
  }

  // If slug is being updated, check uniqueness
  if (data.slug) {
    const existingStorefront = await db.select({ id: storefronts.id })
      .from(storefronts)
      .where(eq(storefronts.slug, data.slug))
      .limit(1);

    if (existingStorefront.length > 0 && existingStorefront[0].id !== storefrontId) {
      throw new Error('A storefront with this URL already exists. Please choose a different URL.');
    }
  }

  // Update storefront
  await db.update(storefronts)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.description && { description: data.description }),
      ...(data.slug && { slug: data.slug }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.contactEmail !== undefined && { contactEmail: data.contactEmail }),
      ...(data.contactPhone !== undefined && { contactPhone: data.contactPhone }),
      updatedAt: new Date(),
    })
    .where(eq(storefronts.id, storefrontId));

  revalidatePath(`/storefront/dashboard?id=${storefrontId}`);
  revalidatePath(`/stores/${data.slug}`);
}

/**
 * Publish a storefront (make it publicly accessible)
 */
export async function publishStorefront(storefrontId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('You must be logged in to publish a storefront');
  }

  // Verify ownership
  const storefront = await db.select({ userId: storefronts.userId, slug: storefronts.slug })
    .from(storefronts)
    .where(eq(storefronts.id, storefrontId))
    .limit(1);

  if (storefront.length === 0) {
    return notFound();
  }

  if (storefront[0].userId !== session.user.id) {
    throw new Error('You do not have permission to publish this storefront');
  }

  // Update published status (this is a placeholder - we'll need to add a published field to the schema)
  // For now, we'll just revalidate the paths
  revalidatePath(`/storefront/preview?id=${storefrontId}`);
  revalidatePath(`/stores/${storefront[0].slug}`);
  
  return { success: true };
}

/**
 * Delete a storefront
 */
export async function deleteStorefront(storefrontId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('You must be logged in to delete a storefront');
  }

  // Verify ownership
  const storefront = await db.select({ userId: storefronts.userId })
    .from(storefronts)
    .where(eq(storefronts.id, storefrontId))
    .limit(1);

  if (storefront.length === 0) {
    return notFound();
  }

  if (storefront[0].userId !== session.user.id) {
    throw new Error('You do not have permission to delete this storefront');
  }

  // Delete storefront (cascade will handle customization and other related records)
  await db.delete(storefronts)
    .where(eq(storefronts.id, storefrontId));

  revalidatePath('/dashboard');
  redirect('/dashboard');
} 