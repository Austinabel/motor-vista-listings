
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle } from 'lucide-react';
import { useMessaging } from '@/contexts/MessagingContext';
import { useAuth } from '@/contexts/AuthContext';
import ChatInterface from './ChatInterface';
import { toast } from 'sonner';

interface MessageSellerButtonProps {
  listingId: string;
  sellerId: string;
  carTitle: string;
  sellerName: string;
}

const MessageSellerButton = ({ listingId, sellerId, carTitle, sellerName }: MessageSellerButtonProps) => {
  const { user } = useAuth();
  const { startConversation } = useMessaging();
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStartChat = async () => {
    if (!user) {
      toast.error('Please sign in to message the seller');
      return;
    }

    setLoading(true);
    const convId = await startConversation(listingId, sellerId);
    if (convId) {
      setConversationId(convId);
      setOpen(true);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => toast.error('Please sign in to message the seller')}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Message Seller
      </Button>
    );
  }

  if (user.id === sellerId) {
    return null; // Don't show message button for own listings
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleStartChat}
          disabled={loading}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          {loading ? 'Starting Chat...' : 'Message Seller'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Message about {carTitle}</DialogTitle>
        </DialogHeader>
        {conversationId && (
          <ChatInterface
            conversationId={conversationId}
            carTitle={carTitle}
            otherUserName={sellerName}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MessageSellerButton;
