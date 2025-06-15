
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  car_listings?: {
    make: string;
    model: string;
    year: string;
    price: number;
  };
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

export const useMessaging = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          car_listings (make, model, year, price),
          profiles!conversations_buyer_id_fkey (first_name, last_name)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Failed to load conversations');
        return;
      }

      setConversations(data || []);
    } catch (error) {
      console.error('Error in fetchConversations:', error);
      toast.error('An error occurred while loading conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
        return;
      }

      setMessages(data || []);

      // Mark messages as read
      if (user && data?.length) {
        const unreadMessages = data.filter(msg => msg.sender_id !== user.id && !msg.is_read);
        if (unreadMessages.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadMessages.map(msg => msg.id));
        }
      }
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      toast.error('An error occurred while loading messages');
    }
  };

  const startConversation = async (listingId: string, sellerId: string) => {
    if (!user) {
      toast.error('Please sign in to start a conversation');
      return null;
    }

    if (user.id === sellerId) {
      toast.error('You cannot message yourself');
      return null;
    }

    try {
      // Check if conversation already exists
      const { data: existingConversation, error: checkError } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listingId)
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing conversation:', checkError);
        toast.error('Failed to start conversation');
        return null;
      }

      if (existingConversation) {
        return existingConversation.id;
      }

      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          listing_id: listingId,
          buyer_id: user.id,
          seller_id: sellerId
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating conversation:', createError);
        toast.error('Failed to start conversation');
        return null;
      }

      return newConversation.id;
    } catch (error) {
      console.error('Error in startConversation:', error);
      toast.error('An error occurred while starting conversation');
      return null;
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!user || !content.trim()) return false;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
        return false;
      }

      // Refresh messages
      await fetchMessages(conversationId);
      return true;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast.error('An error occurred while sending message');
      return false;
    }
  };

  return {
    conversations,
    messages,
    loading,
    fetchConversations,
    fetchMessages,
    startConversation,
    sendMessage
  };
};
