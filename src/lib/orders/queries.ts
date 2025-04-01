'use server';

import { db } from '@/lib/db';
import { orders, orderItems, shipping, products, users, productImages } from '@/lib/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/server';

/**
 * Get an order by ID, with authorization check
 * Buyer can only see their own orders
 * Seller can only see orders for their products
 */
export async function getOrderById(orderId: string) {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return null;
    }

    // Get the user from our database to check role
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.authId, currentUser.id))
      .limit(1);

    if (!user) {
      return null;
    }

    // Fetch the order
    const [orderData] = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.id, orderId),
          or(
            eq(orders.buyerId, user.id),
            eq(orders.sellerId, user.id)
          )
        )
      )
      .limit(1);

    if (!orderData) {
      return null;
    }

    // Get order items
    const orderItemsData = await db
      .select({
        id: orderItems.id,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        customizations: orderItems.customizations,
        productName: products.name,
        productSlug: products.slug,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    // Get shipping details
    const [shippingData] = await db
      .select()
      .from(shipping)
      .where(eq(shipping.orderId, orderId))
      .limit(1);

    // Get buyer and seller info
    const [buyer] = await db
      .select({ 
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        avatarUrl: users.avatarUrl 
      })
      .from(users)
      .where(eq(users.id, orderData.buyerId))
      .limit(1);

    const [seller] = await db
      .select({ 
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        avatarUrl: users.avatarUrl 
      })
      .from(users)
      .where(eq(users.id, orderData.sellerId))
      .limit(1);

    // Get product images for order items
    const orderItemsWithImages = await Promise.all(
      orderItemsData.map(async (item) => {
        if (!item.productId) return item;
        
        const [productImage] = await db
          .select({ imageUrl: productImages.imageUrl })
          .from(productImages)
          .where(
            and(
              eq(productImages.productId, item.productId),
              eq(productImages.isMain, true)
            )
          )
          .limit(1);

        return {
          ...item,
          imageUrl: productImage?.imageUrl,
        };
      })
    );

    return {
      ...orderData,
      items: orderItemsWithImages,
      shipping: shippingData,
      buyer,
      seller,
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

/**
 * Get orders for the current user based on their role (buyer or seller)
 */
export async function getUserOrders(params: {
  page?: number;
  perPage?: number;
  status?: string;
  role?: 'buyer' | 'seller';
}) {
  const { 
    page = 1, 
    perPage = 10, 
    status, 
    role = 'buyer' 
  } = params;
  
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return { orders: [], count: 0 };
    }

    // Get the user from our database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.authId, currentUser.id))
      .limit(1);

    if (!user) {
      return { orders: [], count: 0 };
    }

    // Build the query based on user role
    const offset = (page - 1) * perPage;
    
    // Base query
    let query = db.select().from(orders);
    
    // Add filters
    if (role === 'buyer') {
      query = query.where(eq(orders.buyerId, user.id));
    } else {
      query = query.where(eq(orders.sellerId, user.id));
    }
    
    if (status) {
      query = query.where(eq(orders.status, status));
    }
    
    // Add sorting and pagination
    const ordersData = await query
      .orderBy(desc(orders.createdAt))
      .limit(perPage)
      .offset(offset);

    // Get count for pagination
    const [{ count }] = await db
      .select({ count: db.fn.count() })
      .from(orders)
      .where(role === 'buyer' ? eq(orders.buyerId, user.id) : eq(orders.sellerId, user.id))
      .limit(1) as [{ count: number }];

    // Get basic info for each order
    const ordersWithDetails = await Promise.all(
      ordersData.map(async (order) => {
        // Get number of items
        const [{ itemCount }] = await db
          .select({ itemCount: db.fn.count() })
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id))
          .limit(1) as [{ itemCount: number }];

        // Get other user info (if buyer, get seller, and vice versa)
        const otherUserId = role === 'buyer' ? order.sellerId : order.buyerId;
        const [otherUser] = await db
          .select({
            fullName: users.fullName,
            avatarUrl: users.avatarUrl,
          })
          .from(users)
          .where(eq(users.id, otherUserId))
          .limit(1);

        return {
          ...order,
          itemCount,
          otherUser,
        };
      })
    );

    return {
      orders: ordersWithDetails,
      pagination: {
        page,
        perPage,
        totalItems: Number(count),
        totalPages: Math.ceil(Number(count) / perPage),
      },
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { 
      orders: [],
      pagination: {
        page,
        perPage,
        totalItems: 0,
        totalPages: 0,
      }
    };
  }
} 