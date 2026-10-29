
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Remove header/title imports
import { Send, MessageCircle } from 'lucide-react';
import { useMessaging, Message } from '@/contexts/MessagingContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface ChatInterfaceProps {
  conversationId: string;
  carTitle: string;
  otherUserName: string;
}

const ChatInterface = ({ conversationId, carTitle, otherUserName }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const { messages, fetchMessages, sendMessage } = useMessaging();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId, fetchMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageToSend = newMessage.trim();
    setSending(true);
    setNewMessage(''); // Clear input immediately for better UX

    const success = await sendMessage(conversationId, messageToSend);
    if (!success) {
      setNewMessage(messageToSend);
    } else {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter messages for current conversation
  const conversationMessages = messages.filter(msg => msg.conversation_id === conversationId);

  return (
    <div className="h-full flex flex-col">
      {/* MESSAGES: Scrollable area, takes all available vertical space except input */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {conversationMessages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          conversationMessages.map((message: Message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.sender_id === user?.id
                    ? 'bg-primary text-white'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm break-words">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender_id === user?.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}
                >
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT: Bottom fixed input (not scrollable) */}
      <div className="flex gap-2 border-t border-border bg-card px-2 py-2">
        <Input
          ref={inputRef}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={sending}
          className="flex-1"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || sending}
          size="sm"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;
