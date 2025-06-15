
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageCircle } from 'lucide-react';
import { useMessaging, Message } from '@/hooks/useMessaging';
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

  useEffect(() => {
    if (conversationId) {
      console.log('ChatInterface: Setting up for conversation:', conversationId);
      fetchMessages(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageToSend = newMessage.trim();
    setSending(true);
    setNewMessage(''); // Clear input immediately for better UX
    
    console.log('Sending message:', messageToSend);
    
    const success = await sendMessage(conversationId, messageToSend);
    if (!success) {
      // If sending failed, restore the message
      setNewMessage(messageToSend);
      console.error('Failed to send message, restoring input');
    } else {
      console.log('Message sent successfully');
      // Focus back to input after sending
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

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5" />
          Chat about {carTitle}
        </CardTitle>
        <p className="text-sm text-gray-600">Chatting with {otherUserName}</p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 pt-0 min-h-0">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-0">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message: Message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.sender_id === user?.id
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender_id === user?.id
                        ? 'text-red-100'
                        : 'text-gray-500'
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

        {/* Message Input - Fixed at bottom */}
        <div className="flex gap-2 flex-shrink-0">
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
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
