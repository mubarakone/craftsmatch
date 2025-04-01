'use server';

import { db } from '@/lib/db';
import { 
  conversations, 
  messages, 
  attachments, 
  users 
} from '@/lib/db/schema';
import { eq, and, or, desc, inArray } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/server';

// Type definitions
export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  attachments?: {
    id: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  }[];
}

export interface Conversation {
  id: string;
  title?: string | null;
  participantIds: string[] | any;
  participants?: User[];
  lastMessageId?: string | null;
  lastMessage?: Message | null;
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date | null;
}

// Export types for use in other files
export type ConversationWithParticipants = Conversation & {
  participants: User[];
  lastMessage?: Message | null;
  unreadCount: number;
};

export type MessageWithAttachments = Message & {
  attachments: {
    id: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  }[];
};

/**
 * Get all conversations for the current user
 */
export async function getUserConversations() {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return [];
    }

    // Get the user from our database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.authId, currentUser.id))
      .limit(1);

    if (!user) {
      return [];
    }

    // Fetch all conversations where the user is a participant
    const conversationsData = await db
      .select()
      .from(conversations)
      .where(
        // Using SQL contains operator to check JSON array
        sql`${conversations.participantIds} ? ${user.id}::text`
      )
      .orderBy(desc(conversations.updatedAt));

    // Get participant info and last message for each conversation
    const conversationsWithDetails = await Promise.all(
      conversationsData.map(async (conversation) => {
        // Get participants
        const participantUsers = await db
          .select({
            id: users.id,
            fullName: users.fullName,
            email: users.email,
            avatarUrl: users.avatarUrl
          })
          .from(users)
          .where(inArray(users.id, conversation.participantIds as string[]));

        // Get last message if available
        let lastMessage = null;
        if (conversation.lastMessageId) {
          const [message] = await db
            .select()
            .from(messages)
            .where(eq(messages.id, conversation.lastMessageId))
            .limit(1);
          
          if (message) {
            lastMessage = message;
          }
        }

        // Count unread messages
        const [{ count: unreadCount }] = await db
          .select({ 
            count: db.fn.count() 
          })
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, conversation.id),
              eq(messages.isRead, false),
              eq(messages.senderId, user.id)
            )
          )
          .limit(1) as [{ count: number }];

        return {
          ...conversation,
          participants: participantUsers,
          lastMessage,
          unreadCount: Number(unreadCount)
        };
      })
    );

    return conversationsWithDetails;
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    return [];
  }
}

/**
 * Get a single conversation by ID
 */
export async function getConversation(conversationId: string): Promise<ConversationWithParticipants | null> {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return null;
    }

    // Get the user from our database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.authId, currentUser.id))
      .limit(1);

    if (!user) {
      return null;
    }

    // Fetch the conversation
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          // Using SQL contains operator to check JSON array
          sql`${conversations.participantIds} ? ${user.id}::text`
        )
      )
      .limit(1);

    if (!conversation) {
      return null;
    }

    // Get participants
    const participants = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        avatarUrl: users.avatarUrl
      })
      .from(users)
      .where(inArray(users.id, conversation.participantIds as string[]));

    // Get last message if available
    let lastMessage = null;
    if (conversation.lastMessageId) {
      const [message] = await db
        .select()
        .from(messages)
        .where(eq(messages.id, conversation.lastMessageId))
        .limit(1);
      
      if (message) {
        // Get attachments for last message
        const messageAttachments = await db
          .select()
          .from(attachments)
          .where(eq(attachments.messageId, message.id));

        lastMessage = {
          ...message,
          attachments: messageAttachments
        };
      }
    }

    // Count unread messages
    const [{ count: unreadCount }] = await db
      .select({ 
        count: db.fn.count() 
      })
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, conversation.id),
          eq(messages.isRead, false),
          eq(messages.senderId, user.id)
        )
      )
      .limit(1) as [{ count: number }];

    return {
      ...conversation,
      participants,
      lastMessage,
      unreadCount: Number(unreadCount)
    };
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }
}

/**
 * Get all messages for a conversation
 */
export async function getConversationMessages(conversationId: string): Promise<MessageWithAttachments[]> {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return [];
    }

    // Get the user from our database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.authId, currentUser.id))
      .limit(1);

    if (!user) {
      return [];
    }

    // Check user has access to this conversation
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          // Using SQL contains operator to check JSON array
          sql`${conversations.participantIds} ? ${user.id}::text`
        )
      )
      .limit(1);

    if (!conversation) {
      return [];
    }

    // Get all messages
    const messagesData = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt));

    // Get attachments for each message
    const messagesWithAttachments = await Promise.all(
      messagesData.map(async (message) => {
        const messageAttachments = await db
          .select()
          .from(attachments)
          .where(eq(attachments.messageId, message.id));

        return {
          ...message,
          attachments: messageAttachments
        };
      })
    );

    // Mark messages as read if they're from other users
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.isRead, false),
          eq(messages.senderId, user.id)
        )
      );

    return messagesWithAttachments;
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    return [];
  }
}

/**
 * Get the unread count for all user conversations
 */
export async function getUnreadMessagesCount(): Promise<number> {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return 0;
    }

    // Get the user from our database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.authId, currentUser.id))
      .limit(1);

    if (!user) {
      return 0;
    }

    // Get all conversations for this user
    const userConversations = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(
        // Using SQL contains operator to check JSON array
        sql`${conversations.participantIds} ? ${user.id}::text`
      );

    if (!userConversations.length) {
      return 0;
    }

    // Get count of all unread messages across all conversations
    const [{ count }] = await db
      .select({ 
        count: db.fn.count() 
      })
      .from(messages)
      .where(
        and(
          inArray(
            messages.conversationId, 
            userConversations.map(c => c.id)
          ),
          eq(messages.isRead, false),
          eq(messages.senderId, user.id)
        )
      )
      .limit(1) as [{ count: number }];

    return Number(count);
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
} 