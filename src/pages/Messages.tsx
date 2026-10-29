import { useEffect, useState } from "react";
import { MessageSquare, Car, Clock, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMessaging, Conversation } from "@/contexts/MessagingContext";
import { useAuth } from "@/contexts/AuthContext";
import ChatInterface from "@/components/ChatInterface";
import { formatDistanceToNow } from "date-fns";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Separator } from "@/components/ui/separator"; // <-- NEW

function stringAvatar(name?: string) {
  // Generate initials from name or fallback
  if (!name) return "U";
  const arr = name.trim().split(" ");
  if (arr.length === 1) return arr[0][0].toUpperCase();
  return `${arr[0][0]}${arr[1][0]}`.toUpperCase();
}

const Messages = () => {
  usePageMeta({ title: "Messages", noIndex: true });
  const { user } = useAuth();
  const { conversations, loading, fetchConversations, messages } = useMessaging();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const handleOpenChat = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setChatOpen(true);
  };

  const getOtherUserName = (conversation: Conversation) => {
    if (!user) return 'Unknown User';
    if (conversation.buyer_id === user.id) {
      return conversation.seller_profile?.first_name && conversation.seller_profile?.last_name
        ? `${conversation.seller_profile.first_name} ${conversation.seller_profile.last_name}`
        : 'Seller';
    }
    return conversation.buyer_profile?.first_name && conversation.buyer_profile?.last_name
      ? `${conversation.buyer_profile.first_name} ${conversation.buyer_profile.last_name}`
      : 'Buyer';
  };

  const getCarTitle = (conversation: Conversation) => {
    if (conversation.car_listings) {
      return `${conversation.car_listings.year} ${conversation.car_listings.make} ${conversation.car_listings.model}`;
    }
    return 'Car Details Not Available';
  };

  // Count of unread messages for each conversation (for future badge use)
  const getUnreadCount = (convId: string) => {
    if (!messages) return 0;
    return messages.filter(
      (msg) =>
        msg.conversation_id === convId &&
        msg.sender_id !== user?.id &&
        !msg.is_read
    ).length;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                <span>Messages</span>
              </CardTitle>
              <CardDescription>
                View and manage your conversations with sellers and buyers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Sign in required</h3>
                <p className="text-muted-foreground mb-6">
                  Please sign in to view your messages and conversations.
                </p>
                <a
                  href="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                >
                  Sign In
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-accent/20 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary px-6 py-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-card/20 rounded-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Messages</h1>
                <p className="text-primary-foreground/80 text-sm">Your conversations with buyers and sellers</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-20">
                <div className="w-12 h-12 mx-auto rounded-full animate-spin border-4 border-t-red-500 border-border"></div>
                <div className="mt-4 text-muted-foreground font-medium">Loading conversations...</div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center py-20">
                <div className="p-4 bg-accent rounded-full mb-6">
                  <MessageSquare className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">No conversations yet</h3>
                <p className="text-muted-foreground mb-8 max-w-sm text-center leading-relaxed">
                  Start chatting with sellers or buyers about car listings. Your conversations will appear here.
                </p>
                <a
                  href="/cars"
                  className="inline-flex items-center px-6 py-3 rounded-xl text-white bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-brand-dark transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Car className="w-4 h-4 mr-2" />
                  Browse Cars
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conversation, idx) => {
                  const unreadCount = getUnreadCount(conversation.id);
                  const isSelected = selectedConversation?.id === conversation.id;
                  return (
                    <div 
                      key={conversation.id} 
                      className={`group bg-card rounded-xl border border-border hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer ${
                        isSelected ? "ring-2 ring-ring border-primary shadow-lg" : ""
                      }`}
                      onClick={() => handleOpenChat(conversation)}
                    >
                      <div className="flex items-center space-x-4 p-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {stringAvatar(getOtherUserName(conversation))}
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-foreground truncate text-sm">
                              {getCarTitle(conversation)}
                            </h4>
                            {unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-destructive text-white text-xs font-bold">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate mb-1">
                            With {getOtherUserName(conversation)}
                          </p>
                          {conversation.car_listings?.price && (
                            <p className="text-xs font-semibold text-primary">
                              ₦{conversation.car_listings.price.toLocaleString()}
                            </p>
                          )}
                        </div>
                        
                        {/* Time & Action */}
                        <div className="flex flex-col items-end space-y-2">
                          <span className="text-xs text-muted-foreground/70 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-3 text-xs bg-accent hover:bg-accent text-primary border border-primary/20 opacity-80 group-hover:opacity-100"
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Dialog */}
        <Dialog open={chatOpen} onOpenChange={setChatOpen}>
          <DialogContent className="w-full max-w-4xl border-0 rounded-2xl shadow-2xl px-0 py-0 bg-card overflow-hidden h-[85vh] max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary px-6 py-4 flex-shrink-0">
              <DialogHeader className="p-0">
                <DialogTitle className="text-white font-bold text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {selectedConversation && `${getCarTitle(selectedConversation)}`}
                </DialogTitle>
                <p className="text-primary-foreground/80 text-sm">
                  {selectedConversation && `Chatting with ${getOtherUserName(selectedConversation)}`}
                </p>
              </DialogHeader>
            </div>
            
            {/* Chat Interface */}
            <div className="flex-1 min-h-0 bg-background">
              {selectedConversation && (
                <ChatInterface
                  conversationId={selectedConversation.id}
                  carTitle={getCarTitle(selectedConversation)}
                  otherUserName={getOtherUserName(selectedConversation)}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Messages;
