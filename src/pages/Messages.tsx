import { useEffect, useState } from "react";
import { MessageSquare, Car, Clock, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMessaging, Conversation } from "@/hooks/useMessaging";
import { useAuth } from "@/contexts/AuthContext";
import ChatInterface from "@/components/ChatInterface";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator"; // <-- NEW

function stringAvatar(name?: string) {
  // Generate initials from name or fallback
  if (!name) return "U";
  const arr = name.trim().split(" ");
  if (arr.length === 1) return arr[0][0].toUpperCase();
  return `${arr[0][0]}${arr[1][0]}`.toUpperCase();
}

const Messages = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8">
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-white/80 rounded-t-lg backdrop-blur-md">
            <CardTitle className="flex items-center space-x-3 text-2xl font-bold">
              <MessageSquare className="h-7 w-7 text-red-600" />
              <span>Messages</span>
            </CardTitle>
            <CardDescription>
              View and manage your conversations with sellers and buyers.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0">
            {loading ? (
              <div className="text-center py-16">
                <div className="w-10 h-10 mx-auto rounded-full animate-spin border-4 border-t-red-600 border-gray-200"></div>
                <div className="mt-4 text-gray-500 font-medium">Loading conversations...</div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center py-16">
                <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No conversations yet</h3>
                <p className="text-gray-500 mb-6 max-w-xs text-center">
                  When you contact sellers or buyers about a car listing, your conversations will appear here.
                </p>
                <a
                  href="/cars"
                  className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-150 text-sm font-medium"
                >
                  Browse Cars
                </a>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 rounded-xl overflow-hidden shadow-inner bg-gray-50">
                {conversations.map((conversation, idx) => {
                  const unreadCount = getUnreadCount(conversation.id);
                  const isSelected = selectedConversation?.id === conversation.id;
                  return (
                    <div key={conversation.id} className="group hover:bg-white/80 transition-all duration-150">
                      <div
                        onClick={() => handleOpenChat(conversation)}
                        tabIndex={0}
                        className={`flex cursor-pointer px-4 py-4 sm:px-6 items-center space-x-4 transition-shadow hover:shadow-lg rounded-xl border border-transparent hover:border-red-200 hover:ring-1 hover:ring-red-100 focus:ring-2 focus:ring-red-400 outline-none ${
                          isSelected ? "ring-2 ring-red-500 border-red-500 shadow-xl" : ""
                        }`}
                      >
                        {/* Avatar/Fallback */}
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-2xl font-bold text-red-600 border border-gray-300 shadow-sm">
                            <span>
                              {stringAvatar(getOtherUserName(conversation))}
                            </span>
                          </div>
                        </div>
                        {/* Conversation Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900 truncate block">{getCarTitle(conversation)}</span>
                            {unreadCount > 0 && (
                              <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-2 rounded-full bg-red-500 text-white text-xs font-semibold animate-pulse shadow">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                          <span className="block text-sm text-gray-500 truncate">
                            With {getOtherUserName(conversation)}
                          </span>
                          {conversation.car_listings?.price && (
                            <span className="block text-xs font-medium text-red-600 mt-0.5">
                              ₦{conversation.car_listings.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {/* Time & Open Chat Button */}
                        <div className="flex flex-col items-end min-w-[70px] flex-shrink-0">
                          <span className="text-xs text-gray-400 flex items-center mb-2">
                            <Clock className="h-4 w-4 mr-0.5" />
                            {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                          </span>
                          <Button variant="secondary" size="sm" className="opacity-80 hover:opacity-100 flex items-center gap-1 border border-gray-200 shadow">
                            <MessageSquare className="h-4 w-4" />
                            <span className="hidden sm:inline">Open</span>
                          </Button>
                        </div>
                      </div>
                      {/* ADD DIVIDER unless last item */}
                      {idx !== conversations.length - 1 && (
                        <Separator orientation="horizontal" className="my-0 mx-6 bg-gray-200" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Dialog */}
        <Dialog open={chatOpen} onOpenChange={setChatOpen}>
          <DialogContent 
            className="
              w-full 
              max-w-[95vw] 
              sm:max-w-2xl 
              border-0 
              rounded-none sm:rounded-2xl 
              shadow-2xl 
              px-0 py-0 
              bg-white 
              overflow-hidden 
              sm:my-8
              h-[95vh] 
              max-h-[95vh] 
              flex flex-col
              animate-fade-in
            "
            style={{
              padding: 0,
              borderRadius: '0.75rem',
              margin: 0,
              top: '2.5vh', // better alignment if needed
              left: '50%',
              transform: 'translate(-50%, 0)'
            }}
          >
            {/* Header Callout */}
            <div className="bg-gradient-to-r from-red-600/80 to-red-400/80 px-4 sm:px-6 pt-6 pb-2 rounded-t-none sm:rounded-t-2xl shadow-inner">
              <DialogHeader className="p-0">
                <DialogTitle className="text-white font-bold text-xl tracking-tight flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  {selectedConversation && `Chat about ${getCarTitle(selectedConversation)}`}
                </DialogTitle>
                <div className="text-sm text-red-50">
                  {selectedConversation && <>With {getOtherUserName(selectedConversation)}</>}
                </div>
              </DialogHeader>
            </div>
            {/* Divider between header and chat */}
            <Separator orientation="horizontal" className="bg-gray-200" />
            {/* Main chat callout area, scrollable but keeps header and input always visible */}
            <div className="bg-gray-50 px-1 sm:px-4 py-4 sm:py-6 min-h-0 flex-1 rounded-b-none sm:rounded-b-2xl shadow-inner flex flex-col overflow-y-auto">
              {selectedConversation && (
                <div className="bg-white border border-gray-100 rounded-none sm:rounded-xl shadow p-0 overflow-hidden flex flex-col flex-1 min-h-0">
                  {/* ChatInterface is JUST the messages and input, no internal title/subtitle */}
                  <ChatInterface
                    conversationId={selectedConversation.id}
                    carTitle={getCarTitle(selectedConversation)}
                    otherUserName={getOtherUserName(selectedConversation)}
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Messages;
