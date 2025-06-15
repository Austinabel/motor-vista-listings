
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
  buyer_profile?: {
    first_name: string;
    last_name: string;
  };
  seller_profile?: {
    first_name: string;
    last_name: string;
  };
}

export const useMessaging = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Real-time subscription for messages
  useEffect(() => {
    if (!currentConversationId) return;

    console.log('Setting up real-time subscription for conversation:', currentConversationId);
    
    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${currentConversationId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as Message;
          setMessages(prevMessages => {
            // Avoid duplicates
            if (prevMessages.some(msg => msg.id === newMessage.id)) {
              return prevMessages;
            }
            return [...prevMessages, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [currentConversationId]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // First fetch conversations
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        toast.error('Failed to load conversations');
        return;
      }

      if (!conversationsData || conversationsData.length === 0) {
        setConversations([]);
        return;
      }

      // Fetch car listings for each conversation
      const listingIds = conversationsData.map(conv => conv.listing_id);
      const { data: carListings, error: carListingsError } = await supabase
        .from('car_listings')
        .select('id, make, model, year, price')
        .in('id', listingIds);

      if (carListingsError) {
        console.error('Error fetching car listings:', carListingsError);
      }

      // Fetch profiles for buyers and sellers
      const userIds = [...new Set([
        ...conversationsData.map(conv => conv.buyer_id),
        ...conversationsData.map(conv => conv.seller_id)
      ])];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Combine the data
      const enrichedConversations = conversationsData.map(conversation => {
        const carListing = carListings?.find(listing => listing.id === conversation.listing_id);
        const buyerProfile = profiles?.find(profile => profile.id === conversation.buyer_id);
        const sellerProfile = profiles?.find(profile => profile.id === conversation.seller_id);

        return {
          ...conversation,
          car_listings: carListing ? {
            make: carListing.make,
            model: carListing.model,
            year: carListing.year,
            price: carListing.price
          } : undefined,
          buyer_profile: buyerProfile ? {
            first_name: buyerProfile.first_name || '',
            last_name: buyerProfile.last_name || ''
          } : undefined,
          seller_profile: sellerProfile ? {
            first_name: sellerProfile.first_name || '',
            last_name: sellerProfile.last_name || ''
          } : undefined
        };
      });

      setConversations(enrichedConversations);
    } catch (error) {
      console.error('Error in fetchConversations:', error);
      toast.error('An error occurred while loading conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      console.log('Fetching messages for conversation:', conversationId);
      setCurrentConversationId(conversationId);

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
      console.log('Sending message to conversation:', conversationId);
      
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

      // Note: We don't need to manually refresh messages here because 
      // the real-time subscription will automatically add the new message
      console.log('Message sent successfully');
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
