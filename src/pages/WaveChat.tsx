import { Link, useLocation } from "react-router-dom";
import { MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaveChatInbox } from "@/components/wavechat/WaveChatInbox";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureModes } from "@/hooks/useFeatureMode";
import { usePageMeta } from "@/hooks/usePageMeta";
import { WAVECHAT_PATH } from "@/lib/wavechat";
import { FALLBACK_MODES } from "@/services/platformFeatures";

const Notice = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-20 text-center">
    <MessagesSquare className="h-10 w-10 text-muted-foreground" />
    <h1 className="text-2xl font-extrabold">{title}</h1>
    {children}
  </div>
);

/** WaveChat's own space: the chat list beside the open conversation, filling the screen like a chat app. */
const WaveChat = () => {
  usePageMeta({ title: "WaveChat", noIndex: true });
  const { user, loading } = useAuth();
  const featureModes = useFeatureModes();
  const mode = (featureModes.data?.modes ?? FALLBACK_MODES).wavechat;
  const { search } = useLocation();
  const conversationOpen = new URLSearchParams(search).has("c");

  if (loading || featureModes.isLoading) return null;

  if (mode !== "motorcars" && mode !== "moatwave") {
    return (
      <Notice title="WaveChat isn't on yet">
        <p className="text-muted-foreground">Your messages are still in the inbox.</p>
        <Button asChild><Link to="/messages">Open messages</Link></Button>
      </Notice>
    );
  }

  if (!user) {
    return (
      <Notice title="Sign in to use WaveChat">
        <p className="text-muted-foreground">Chat with sellers about their cars, with offers, inspections and receipts in one place.</p>
        <Button asChild><Link to={`/login?redirect=${encodeURIComponent(WAVECHAT_PATH + search)}`}>Sign in</Link></Button>
      </Notice>
    );
  }

  // Fills the screen below the top bar (64px or 72px, plus its 1px border); on phones the bottom menu hides while a conversation is open
  return (
    <div
      className={`mx-auto flex h-[calc(100dvh-65px)] max-w-7xl flex-col md:h-[calc(100dvh-73px)] lg:px-8 lg:py-4 ${
        conversationOpen ? "" : "pb-[76px] lg:pb-4"
      }`}
    >
      <WaveChatInbox userId={user.id} />
    </div>
  );
};

export default WaveChat;
