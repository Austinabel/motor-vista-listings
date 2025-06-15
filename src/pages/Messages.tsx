
import { useEffect, useState } from "react";
import { MessageSquare, Car, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMessaging, Conversation } from "@/hooks/useMessaging";
import { useAuth } from "@/contexts/AuthContext";
import ChatInterface from "@/components/ChatInterface";
import { formatDistanceToNow } from "date-fns";

const Messages = () => {
  const { user } = useAuth();
  const { conversations, loading, fetchConversations } = useMessaging();
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
    
    // If current user is buyer, show seller info
    if (conversation.buyer_id === user.id) {
      return conversation.seller_profile?.first_name && conversation.seller_profile?.last_name
        ? `${conversation.seller_profile.first_name} ${conversation.seller_profile.last_name}`
        : 'Seller';
    }
    
    // If current user is seller, show buyer info  
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-6 w-6 text-red-600" />
                <span>Messages</span>
              </CardTitle>
              <CardDescription>
                View and manage your conversations with sellers and buyers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in required</h3>
                <p className="text-gray-500 mb-6">
                  Please sign in to view your messages and conversations.
                </p>
                <a
                  href="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6 text-red-600" />
              <span>Messages</span>
            </CardTitle>
            <CardDescription>
              View and manage your conversations with sellers and buyers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div>Loading conversations...</div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                <p className="text-gray-500 mb-6">
                  When you contact sellers or buyers about a car listing, your conversations will appear here.
                </p>
                <a
                  href="/cars"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Browse Cars
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {conversations.map((conversation) => (
                  <Card key={conversation.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleOpenChat(conversation)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-red-100 p-2 rounded-full">
                            <Car className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {getCarTitle(conversation)}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Conversation with {getOtherUserName(conversation)}
                            </p>
                            {conversation.car_listings?.price && (
                              <p className="text-sm font-medium text-red-600">
                                ₦{conversation.car_listings.price.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                          </div>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Open Chat
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={chatOpen} onOpenChange={setChatOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedConversation && `Chat about ${getCarTitle(selectedConversation)}`}
              </DialogTitle>
            </DialogHeader>
            {selectedConversation && (
              <ChatInterface
                conversationId={selectedConversation.id}
                carTitle={getCarTitle(selectedConversation)}
                otherUserName={getOtherUserName(selectedConversation)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Messages;
