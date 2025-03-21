"use client";

import { useState, useRef, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, X } from "lucide-react";
import { sendMessage } from "@/lib/messages/actions";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { attachmentSchema } from "@/lib/validators/message";

interface MessageComposerProps {
  conversationId: string;
}

export default function MessageComposer({ conversationId }: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentErrors, setAttachmentErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle text input change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // Handle attachment selection
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const errors: string[] = [];
    const validFiles: File[] = [];

    // Validate files
    files.forEach(file => {
      try {
        attachmentSchema.parse({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });
        validFiles.push(file);
      } catch (error) {
        if (error instanceof Error) {
          errors.push(`${file.name}: ${error.message}`);
        } else {
          errors.push(`${file.name}: Invalid file`);
        }
      }
    });

    if (errors.length > 0) {
      setAttachmentErrors(errors);
    }

    setAttachments(prev => [...prev, ...validFiles]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove an attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && attachments.length === 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("conversationId", conversationId);
      formData.append("content", content.trim() || "Sent an attachment");
      
      // Add attachments
      attachments.forEach(file => {
        formData.append("attachments", file);
      });
      
      const result = await sendMessage(formData);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        // Clear form
        setContent("");
        setAttachments([]);
        setAttachmentErrors([]);
        
        // Reset textarea height
        const textarea = document.querySelector("textarea");
        if (textarea) {
          textarea.style.height = "auto";
        }
        
        // Refresh conversation
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t pt-4">
      {/* Attachment errors */}
      {attachmentErrors.length > 0 && (
        <div className="mb-3 p-3 border border-destructive bg-destructive/10 rounded-md">
          <h4 className="text-sm font-semibold mb-1">Invalid attachments:</h4>
          <ul className="text-xs space-y-1">
            {attachmentErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 h-7 text-xs"
            onClick={() => setAttachmentErrors([])}
            type="button"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div 
              key={index} 
              className="relative flex items-center bg-muted p-2 pr-8 rounded-md text-sm"
            >
              <span className="truncate max-w-[200px]">
                {file.name}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 absolute right-1"
                onClick={() => removeAttachment(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-end">
        {/* Attachment input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAttachmentChange}
          className="hidden"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
        />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSubmitting}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        
        {/* Message input */}
        <Textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Type a message..."
          className="min-h-[40px] resize-none"
          disabled={isSubmitting}
        />
        
        {/* Send button */}
        <Button
          type="submit"
          size="icon"
          className="flex-shrink-0"
          disabled={isSubmitting || (!content.trim() && attachments.length === 0)}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
} 