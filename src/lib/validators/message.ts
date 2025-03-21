import { z } from "zod";

// Validation schema for creating a new message
export const newMessageSchema = z.object({
  conversationId: z.string().uuid({ message: "Invalid conversation ID format." }),
  content: z.string()
    .min(1, { message: "Message cannot be empty." })
    .max(2000, { message: "Message cannot exceed 2000 characters." }),
});

// Validation schema for file attachments
export const attachmentSchema = z.object({
  fileName: z.string().min(1, { message: "File name is required." }),
  fileSize: z.number().max(5 * 1024 * 1024, { message: "File size cannot exceed 5MB." }),
  fileType: z.string().refine(type => {
    // Allow common file types: images, PDFs, and documents
    const allowedTypes = [
      "image/jpeg", "image/png", "image/webp", 
      "application/pdf", 
      "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    return allowedTypes.includes(type);
  }, { message: "File type not supported. Please upload an image (JPEG, PNG, WebP), PDF, or document (DOC, DOCX)." }),
});

// Validation schema for creating a new conversation
export const newConversationSchema = z.object({
  recipientId: z.string().uuid({ message: "Invalid recipient ID format." }),
  initialMessage: z.string()
    .min(1, { message: "Initial message cannot be empty." })
    .max(2000, { message: "Initial message cannot exceed 2000 characters." }),
  title: z.string().optional(),
}); 