import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Car, MessagesSquare } from "lucide-react";
import { useFeatureMode } from "@/hooks/useFeatureMode";
import { formatListedAgo } from "@/lib/format";
import { STAGES } from "@/lib/wavechat";
import { waveChatService } from "@/services/wavechat";
import { WaveChatThread } from "./WaveChatThread";

const stageLabel = (stage: string) => STAGES.find((item) => item.id === stage)?.label ?? stage;

/** Every conversation the person is in, each carrying its car, beside the open conversation. */
export const WaveChatInbox = ({ userId }: { userId: string }) => {
  const mode = useFeatureMode("wavechat");
  const [params, setParams] = useSearchParams();
  const openId = params.get("c");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["wavechat", "list", userId],
    queryFn: () => waveChatService(mode).listConversations(userId),
    refetchInterval: 30_000,
  });

  const open = (id: string | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set("c", id);
    else next.delete("c");
    setParams(next, { replace: !id });
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
      <aside className={`${openId ? "hidden lg:block" : ""}`} aria-label="Conversations">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          {isLoading && <div className="m-3 h-40 animate-pulse rounded-xl bg-muted" />}
          {isError && <p className="p-4 text-sm text-muted-foreground">Your conversations couldn't be loaded.</p>}
          {data && data.length === 0 && (
            <div className="flex flex-col items-center gap-2 p-8 text-center">
              <MessagesSquare className="h-8 w-8 text-muted-foreground" />
              <p className="font-semibold">No conversations yet</p>
              <p className="text-sm text-muted-foreground">Open any car and ask the seller a question to start one.</p>
            </div>
          )}
          <ul className="divide-y">
            {data?.map((conversation) => (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => open(conversation.id)}
                  className={`flex w-full items-center gap-3 p-3 text-left transition hover:bg-muted/60 ${conversation.id === openId ? "bg-muted" : ""}`}
                >
                  <div className="h-12 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {conversation.car?.imageUrl ? (
                      <img src={conversation.car.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground"><Car className="h-4 w-4" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{conversation.car?.title ?? "Car no longer listed"}</p>
                      {conversation.unread > 0 && (
                        <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">{conversation.unread}</span>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{conversation.otherName} · {stageLabel(conversation.stage)}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {conversation.lastMessage ?? "No messages yet"} · {formatListedAgo(conversation.updatedAt)}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className={openId ? "" : "hidden lg:block"}>
        {openId ? (
          <WaveChatThread key={openId} conversationId={openId} userId={userId} onBack={() => open(null)} />
        ) : (
          <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-card p-8 text-center">
            <MessagesSquare className="h-10 w-10 text-muted-foreground" />
            <p className="font-semibold">Choose a conversation</p>
            <p className="max-w-sm text-sm text-muted-foreground">Each conversation keeps its car in view, from the first question to the receipt.</p>
          </div>
        )}
      </section>
    </div>
  );
};
