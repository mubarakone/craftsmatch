/**
 * Schema Adapter
 * 
 * This file provides utility functions to ensure compatibility between
 * our Drizzle ORM schemas and Supabase's row-level security policies.
 * 
 * It helps standardize how we handle data access patterns across our
 * server components and client components that use Supabase directly.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { db } from './index';
import * as schema from './schema';

/**
 * Convert a Drizzle query result to the format expected by components
 * This ensures a consistent interface regardless of data source
 */
export function adaptQueryResult<T>(result: T): T {
  if (!result) return result;
  
  // If it's an array, process each item
  if (Array.isArray(result)) {
    return result.map(item => adaptQueryResult(item)) as unknown as T;
  }
  
  // If it's not an object or null/undefined, return as is
  if (typeof result !== 'object' || result === null) return result;
  
  // Convert snake_case to camelCase for object keys
  const adapted = {} as Record<string, unknown>;
  for (const [key, value] of Object.entries(result)) {
    const camelKey = key.replace(/_([a-z])/g, (_, p1) => p1.toUpperCase());
    adapted[camelKey] = value;
  }
  
  return adapted as T;
}

/**
 * Provides a consistent interface for querying data, whether using
 * Drizzle directly or falling back to Supabase for client components.
 */
export function createQueryAdapter(supabase?: SupabaseClient) {
  // On server, prefer Drizzle
  if (!supabase) {
    return {
      db,
      // Standard query patterns
      async getUser(userId: string) {
        const user = await db.select().from(schema.users).where(({ id }) => id.equals(userId)).limit(1);
        return user.length ? adaptQueryResult(user[0]) : null;
      },
      
      async getCraftsmanProfile(userId: string) {
        const profile = await db.select().from(schema.craftsmanProfiles).where(({ userId: id }) => id.equals(userId)).limit(1);
        return profile.length ? adaptQueryResult(profile[0]) : null;
      },
      
      async getBuilderProfile(userId: string) {
        const profile = await db.select().from(schema.builderProfiles).where(({ userId: id }) => id.equals(userId)).limit(1);
        return profile.length ? adaptQueryResult(profile[0]) : null;
      },
      
      async getStorefronts(userId?: string) {
        let query = db.select().from(schema.storefronts);
        if (userId) {
          query = query.where(({ userId: id }) => id.equals(userId));
        }
        const storefronts = await query;
        return adaptQueryResult(storefronts);
      },
      
      async getProducts({ 
        storefrontId, 
        categoryId, 
        craftmanId,
        limit = 100,
        offset = 0,
        orderBy = 'createdAt',
        order = 'desc'
      }: {
        storefrontId?: string;
        categoryId?: string;
        craftmanId?: string;
        limit?: number;
        offset?: number;
        orderBy?: string;
        order?: 'asc' | 'desc';
      }) {
        let query = db.select().from(schema.products);
        
        // Apply filters
        if (storefrontId) {
          query = query.where(({ storefrontId: id }) => id.equals(storefrontId));
        }
        if (categoryId) {
          query = query.where(({ categoryId: id }) => id.equals(categoryId));
        }
        if (craftmanId) {
          query = query.where(({ craftmanId: id }) => id.equals(craftmanId));
        }
        
        // Apply pagination and ordering
        // Note: orderBy is a dynamically created field name
        const products = await query.limit(limit).offset(offset);
        return adaptQueryResult(products);
      }
    };
  }
  
  // On client, use Supabase with RLS policies
  return {
    supabase,
    // Client-side queries with Supabase
    async getUser(userId: string) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .limit(1)
        .single();
      return data ? adaptQueryResult(data) : null;
    },
    
    async getCraftsmanProfile(userId: string) {
      const { data } = await supabase
        .from('craftsman_profiles')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .single();
      return data ? adaptQueryResult(data) : null;
    },
    
    async getBuilderProfile(userId: string) {
      const { data } = await supabase
        .from('builder_profiles')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .single();
      return data ? adaptQueryResult(data) : null;
    },
    
    async getStorefronts(userId?: string) {
      let query = supabase.from('storefronts').select('*');
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data } = await query;
      return data ? adaptQueryResult(data) : [];
    },
    
    async getProducts({ 
      storefrontId, 
      categoryId, 
      craftmanId,
      limit = 100,
      offset = 0,
      orderBy = 'created_at',
      order = 'desc'
    }: {
      storefrontId?: string;
      categoryId?: string;
      craftmanId?: string;
      limit?: number;
      offset?: number;
      orderBy?: string;
      order?: 'asc' | 'desc';
    }) {
      let query = supabase.from('products').select('*');
      
      // Apply filters
      if (storefrontId) {
        query = query.eq('storefront_id', storefrontId);
      }
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      if (craftmanId) {
        query = query.eq('craftman_id', craftmanId);
      }
      
      // Apply pagination and ordering
      const { data } = await query.order(orderBy, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1);
      return data ? adaptQueryResult(data) : [];
    }
  };
} 