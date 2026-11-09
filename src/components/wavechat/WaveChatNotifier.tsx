import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureMode } from "@/hooks/useFeatureMode";
import { WAVECHAT_PATH, waveChatLink } from "@/lib/wavechat";
import { waveChatService } from "@/services/wavechat";

const PREVIEW: Record<string, string> = {
  offer: "New offer",
  quote: "New quote",
  receipt: "New receipt",
  promise: "New payment promise",
};

export const useWaveChatLive = () => {
  const mode = useFeatureMode("wavechat");
  return { mode, live: mode === "motorcars" || mode === "moatwave" };
};

/** Unread WaveChat messages for the badges on the WaveChat links. */
export const useUnreadMessages = () => {
  const { user } = useAuth();
  const { mode, live } = useWaveChatLive();
  const { data } = useQuery({
    queryKey: ["wavechat", "unread", user?.id],
    queryFn: () => waveChatService(mode).countUnread(),
    enabled: live && Boolean(user),
    refetchInterval: 60_000,
    retry: false,
  });
  return data ?? 0;
};

/**
 * Runs while someone is signed in: marks incoming messages delivered, shows a pop-up when a message
 * arrives for a conversation they don't have open, and keeps their last-seen time current.
 */
export const WaveChatNotifier = () => {
  const { user } = useAuth();
  const { mode, live } = useWaveChatLive();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const openConversation = pathname === WAVECHAT_PATH ? new URLSearchParams(search).get("c") : null;

  useEffect(() => {
    if (!live || !userId) return;
    const service = waveChatService(mode);
    service.touchPresence();
    const heartbeat = window.setInterval(() => service.touchPresence(), 60_000);
    return () => window.clearInterval(heartbeat);
  }, [live, mode, userId]);

  useEffect(() => {
    if (!live || !userId) return;
    const service = waveChatService(mode);
    return service.onIncoming(userId, ({ conversationId, content, kind }) => {
      service.markDelivered(conversationId);
      queryClient.invalidateQueries({ queryKey: ["wavechat", "unread"] });
      queryClient.invalidateQueries({ queryKey: ["wavechat", "list"] });
      if (conversationId === openConversation) return;
      toast(PREVIEW[kind] ?? "New message", {
        description: content ? content.slice(0, 80) : "Attachment",
        action: { label: "Open", onClick: () => navigate(waveChatLink(conversationId)) },
      });
    });
  }, [live, mode, userId, openConversation, navigate, queryClient]);

  return null;
};
