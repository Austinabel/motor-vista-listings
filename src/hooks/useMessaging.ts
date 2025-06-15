import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Store channel in a ref so it's not recreated/subscribed repeatedly
  const channelRef = useRef<any>(null);

  // Set up real-time subscription for messages
  useEffect(() => {
    if (!user) return;

    // Only create and subscribe ONCE per user
    if (channelRef.current) {
      // Clean up existing channel if any
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    console.log('Setting up real-time subscription for user:', user.id);

    const channel = supabase
      .channel(`messages-channel-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message received via real-time:', payload);
          const newMessage = payload.new as Message;

          setMessages(prevMessages => {
            // Check if message already exists to avoid duplicates
            const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
            if (!messageExists) {
              console.log('Adding new message to state');
              return [...prevMessages, newMessage].sort((a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
            }
            return prevMessages;
          });
        }
      )
      .subscribe((status: any) => {
        console.log('Real-time subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        console.log('Cleaning up real-time subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
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

      const listingIds = conversationsData.map(conv => conv.listing_id);
      const { data: carListings, error: carListingsError } = await supabase
        .from('car_listings')
        .select('id, make, model, year, price')
        .in('id', listingIds);

      if (carListingsError) {
        console.error('Error fetching car listings:', carListingsError);
      }

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

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      console.log('Fetching messages for conversation:', conversationId);

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

      console.log('Fetched messages:', data);
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
  }, [user]);

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
      
      // Create optimistic message
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
        is_read: false,
        created_at: new Date().toISOString()
      };

      // Add optimistic message immediately
      setMessages(prevMessages => [...prevMessages, optimisticMessage]);
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim()
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        // Remove optimistic message on error
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg.id !== optimisticMessage.id)
        );
        toast.error('Failed to send message');
        return false;
      }

      console.log('Message sent successfully:', data);
      
      // Replace optimistic message with real message
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === optimisticMessage.id ? data : msg
        )
      );
      
      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

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
