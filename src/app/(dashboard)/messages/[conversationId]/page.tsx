import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getConversation, getConversationMessages } from "@/lib/messages/queries";
import MessageList from "@/components/messages/message-list";
import MessageComposer from "@/components/messages/message-composer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conversation | CraftsMatch",
  description: "Chat with your customers or sellers",
};

interface ConversationPageProps {
  params: {
    conversationId: string;
  };
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = params;
  
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect("/sign-in");
  }
  
  const currentUserId = session.user.id;
  const conversation = await getConversation(conversationId);
  
  if (!conversation) {
    notFound();
  }
  
  const messages = await getConversationMessages(conversationId);
  
  // Get other participant
  const otherParticipant = conversation.participants.find(
    (participant) => participant.id !== currentUserId
  );
  
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Conversation header */}
      <div className="border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/messages">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          
          <Avatar className="h-9 w-9">
            <AvatarImage 
              src={otherParticipant?.avatarUrl || ""} 
              alt={otherParticipant?.fullName || "User"} 
            />
            <AvatarFallback>
              {otherParticipant?.fullName?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="font-medium text-base leading-tight">
              {otherParticipant?.fullName}
            </h2>
            <p className="text-xs text-muted-foreground">
              {/* Could add online status here */}
              {otherParticipant?.email}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6">
        <MessageList 
          messages={messages} 
          currentUserId={currentUserId} 
          conversationId={conversationId} 
        />
      </div>
      
      {/* Message composer */}
      <div className="border-t px-6 py-4">
        <MessageComposer conversationId={conversationId} />
      </div>
    </div>
  );
} 