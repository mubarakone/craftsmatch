import { createClient } from '@/lib/supabase/server';

// Mock data types
export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  attachments?: {
    id: string;
    fileUrl: string;
    fileName: string;
    fileSize: string;
    fileType: string;
  }[];
}

export interface Conversation {
  id: string;
  title?: string;
  participantIds: string[];
  participants: User[];
  lastMessageId?: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Export types for use in other files
export type ConversationWithParticipants = Conversation;
export type MessageWithAttachments = Message;

// Mock data
const mockUsers: User[] = [
  {
    id: 'user1',
    fullName: 'John Doe',
    email: 'john@example.com',
    avatarUrl: '/avatars/john.jpg'
  },
  {
    id: 'user2',
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    avatarUrl: '/avatars/jane.jpg'
  },
  {
    id: 'seller1',
    fullName: 'Artisan Workshop',
    email: 'artisan@example.com',
    avatarUrl: '/avatars/artisan.jpg'
  }
];

const mockMessages: Message[] = [
  {
    id: 'msg1',
    conversationId: 'conv1',
    senderId: 'user1',
    content: 'Hello! I\'m interested in your handcrafted wooden table.',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg2',
    conversationId: 'conv1',
    senderId: 'seller1',
    content: 'Thank you for your interest! What size are you looking for?',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg3',
    conversationId: 'conv1',
    senderId: 'user1',
    content: 'I need a dining table that seats 6 people.',
    isRead: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg4',
    conversationId: 'conv1',
    senderId: 'seller1',
    content: 'Perfect! I have several options available. Would you like to see some designs?',
    isRead: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    attachments: [
      {
        id: 'att1',
        fileName: 'table-designs.pdf',
        fileUrl: '/attachments/table-designs.pdf',
        fileSize: '2500000',
        fileType: 'application/pdf'
      }
    ]
  },
  {
    id: 'msg5',
    conversationId: 'conv2',
    senderId: 'user1',
    content: 'Do you make custom vases?',
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg6',
    conversationId: 'conv2',
    senderId: 'user2',
    content: 'Yes! I specialize in custom ceramic pieces. What did you have in mind?',
    isRead: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    participantIds: ['user1', 'seller1'],
    participants: [mockUsers[0], mockUsers[2]],
    lastMessageId: 'msg4',
    lastMessage: mockMessages[3],
    unreadCount: 1,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'conv2',
    participantIds: ['user1', 'user2'],
    participants: [mockUsers[0], mockUsers[1]],
    lastMessageId: 'msg6',
    lastMessage: mockMessages[5],
    unreadCount: 0,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

/**
 * Get all conversations for the current user
 */
export async function getUserConversations() {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return [];
    }
    
    const userId = session.user.id;
    
    // For mock purposes, just return all conversations
    return mockConversations;
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    return [];
  }
}

/**
 * Get a single conversation by ID
 */
export async function getConversation(conversationId: string) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }
    
    // For mock purposes, find the conversation in our mock data
    const conversation = mockConversations.find(c => c.id === conversationId);
    return conversation || null;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }
}

/**
 * Get all messages for a conversation
 */
export async function getConversationMessages(conversationId: string) {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return [];
    }
    
    // For mock purposes, filter messages by conversation ID
    return mockMessages.filter(m => m.conversationId === conversationId);
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    return [];
  }
}

/**
 * Get the unread count for all user conversations
 */
export async function getUnreadMessagesCount() {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return 0;
    }
    
    // For mock purposes, calculate the total unread count from our mock data
    return mockConversations.reduce((total, conv) => total + conv.unreadCount, 0);
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
} 