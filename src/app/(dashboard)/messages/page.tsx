import { Metadata } from "next";
import { getUserConversations } from "@/lib/messages/queries";
import { getSession } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Search, UserPlus, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Messages | CraftsMatch",
  description: "Manage your conversations with sellers and buyers",
};

// Add dynamic configuration to prevent static build
export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  // Skip authentication check during build
  if (process.env.NEXT_BUILD === 'true') {
    const mockConversations = [];
    return renderMessagesPage(mockConversations);
  }
  
  // Regular runtime authentication
  const session = await getSession();
  
  if (!session) {
    redirect("/sign-in");
  }
  
  const conversations = await getUserConversations();
  return renderMessagesPage(conversations);
}

// Separate rendering function to avoid duplication
function renderMessagesPage(conversations: any[]) {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Manage your conversations with craftsmen and builders
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search messages..."
              className="pl-8 h-9 w-[200px] rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>
      
      {conversations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <MessageSquare className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-center mb-2">No messages yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              You haven&apos;t started any conversations yet. Connect with craftsmen or builders to begin messaging.
            </p>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Start a Conversation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="border-b px-6 py-4">
            <CardTitle>Conversations</CardTitle>
            <CardDescription>
              {conversations.length} {conversations.length === 1 ? "conversation" : "conversations"}
            </CardDescription>
          </CardHeader>
          
          <div className="divide-y">
            {conversations.map((conversation) => {
              const otherParticipant = conversation.participants[0];
              const lastMessage = conversation.lastMessage;
              const unreadCount = conversation.unreadCount;
              
              return (
                <Link 
                  key={conversation.id} 
                  href={`/dashboard/messages/${conversation.id}`}
                  className="block hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center p-4 gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={otherParticipant?.avatarUrl || ""} alt={otherParticipant?.fullName || "User"} />
                      <AvatarFallback>
                        {otherParticipant?.fullName?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-medium truncate">
                          {otherParticipant?.fullName}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {lastMessage?.createdAt && formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground truncate max-w-[350px]">
                          {lastMessage?.content || "No messages yet"}
                        </p>
                        
                        {unreadCount > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs font-medium rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="icon" className="ml-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
} 