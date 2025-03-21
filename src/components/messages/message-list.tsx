"use client";

import { useState, useEffect, useRef } from "react";
import { MessageWithAttachments } from "@/lib/messages/queries";
import { markMessagesAsRead } from "@/lib/messages/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface MessageListProps {
  messages: MessageWithAttachments[];
  currentUserId: string;
  conversationId: string;
}

export default function MessageList({ messages, currentUserId, conversationId }: MessageListProps) {
  const [hasMarkedRead, setHasMarkedRead] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when component mounts
  useEffect(() => {
    if (!hasMarkedRead && messages.length > 0) {
      const markAsRead = async () => {
        try {
          await markMessagesAsRead(conversationId);
          setHasMarkedRead(true);
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      };
      
      markAsRead();
    }
  }, [messages, conversationId, hasMarkedRead]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: Record<string, MessageWithAttachments[]> = {};
  
  messages.forEach((message) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  return (
    <div className="flex flex-col space-y-6 pb-4">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">
              {date === new Date().toLocaleDateString() ? "Today" : date}
            </div>
          </div>
          
          {dateMessages.map((message) => {
            const isCurrentUser = message.senderId === currentUserId;
            
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} max-w-[80%] gap-2`}>
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage 
                      src={message.sender?.avatarUrl || ""} 
                      alt={message.sender?.fullName || "User"} 
                    />
                    <AvatarFallback>
                      {message.sender?.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`space-y-1 ${isCurrentUser ? "items-end" : "items-start"}`}>
                    <Card className={`px-4 py-3 ${
                      isCurrentUser 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment) => {
                            const isImage = attachment.fileType.startsWith("image/");
                            
                            return (
                              <div key={attachment.id} className="flex flex-col">
                                {isImage ? (
                                  <a 
                                    href={attachment.fileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block max-w-[240px] max-h-[240px] rounded overflow-hidden"
                                  >
                                    <img 
                                      src={attachment.fileUrl} 
                                      alt={attachment.fileName}
                                      className="object-contain w-full h-full"
                                    />
                                  </a>
                                ) : (
                                  <div className="flex items-center bg-background/80 rounded p-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        window.open(attachment.fileUrl, "_blank");
                                      }}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    <span className="text-xs truncate max-w-[160px]">
                                      {attachment.fileName}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Card>
                    
                    <div className={`flex text-xs text-muted-foreground ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}>
                      <span>
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </span>
                      
                      {isCurrentUser && (
                        <span className="ml-2">
                          {message.isRead ? "Read" : "Delivered"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
} 