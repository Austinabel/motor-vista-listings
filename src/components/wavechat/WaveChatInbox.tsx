import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Car, MessagesSquare, Search } from "lucide-react";
import { useFeatureMode } from "@/hooks/useFeatureMode";
import { formatListedAgo } from "@/lib/format";
import { STAGES } from "@/lib/wavechat";
import { waveChatService } from "@/services/wavechat";
import { WaveChatThread } from "./WaveChatThread";

const stageLabel = (stage: string) => STAGES.find((item) => item.id === stage)?.label ?? stage;

/** Every conversation the person is in, each carrying its car, beside the open conversation. Fills its parent's height. */
export const WaveChatInbox = ({ userId }: { userId: string }) => {
  const mode = useFeatureMode("wavechat");
  const [params, setParams] = useSearchParams();
  const openId = params.get("c");
  const [filter, setFilter] = useState("");

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

  const words = filter.trim().toLowerCase();
  const shown = words
    ? data?.filter((conversation) =>
        [conversation.car?.title, conversation.otherName, conversation.lastMessage].some((text) => text?.toLowerCase().includes(words))
      )
    : data;

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[360px_1fr] lg:gap-4">
      <aside
        className={`${openId ? "hidden lg:flex" : "flex"} min-h-0 flex-col overflow-hidden bg-card lg:rounded-2xl lg:border lg:shadow-sm`}
        aria-label="Conversations"
      >
        <div className="border-b p-3">
          <h1 className="text-xl font-extrabold">WaveChat</h1>
          <label className="relative mt-2 block">
            <span className="sr-only">Search conversations</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Search by car or name"
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading && <div className="m-3 h-40 animate-pulse rounded-xl bg-muted" />}
          {isError && <p className="p-4 text-sm text-muted-foreground">Your conversations couldn't be loaded.</p>}
          {data && data.length === 0 && (
            <div className="flex flex-col items-center gap-2 p-8 text-center">
              <MessagesSquare className="h-8 w-8 text-muted-foreground" />
              <p className="font-semibold">No conversations yet</p>
              <p className="text-sm text-muted-foreground">Open any car and press "Chat with the seller" to start one.</p>
            </div>
          )}
          {data && data.length > 0 && shown?.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">No conversation matches "{filter.trim()}".</p>
          )}
          <ul className="divide-y">
            {shown?.map((conversation) => (
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
                      <p className="truncate text-sm font-semibold">{conversation.otherName}</p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{formatListedAgo(conversation.updatedAt)}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {conversation.car?.title ?? "Car no longer listed"} · {stageLabel(conversation.stage)}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-muted-foreground">{conversation.lastMessage ?? "No messages yet"}</p>
                      {conversation.unread > 0 && (
                        <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">{conversation.unread}</span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <section className={`${openId ? "flex" : "hidden lg:flex"} min-h-0 flex-col`}>
        {openId ? (
          <WaveChatThread key={openId} conversationId={openId} userId={userId} onBack={() => open(null)} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-card p-8 text-center">
            <MessagesSquare className="h-10 w-10 text-muted-foreground" />
            <p className="font-semibold">Choose a conversation</p>
            <p className="max-w-sm text-sm text-muted-foreground">Each conversation keeps its car in view, from the first question to the receipt.</p>
          </div>
        )}
      </section>
    </div>
  );
};
