import { useEffect, useRef, useState } from "react";
import { Mic, Paperclip, Send, Square, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AttachmentType, ChatMessage } from "@/services/wavechat";

const MAX_BYTES = 10 * 1024 * 1024;
const FILE_TYPES = "image/jpeg,image/png,image/webp,image/heic,application/pdf";

interface ChatComposerProps {
  replyingTo: ChatMessage | null;
  onCancelReply: () => void;
  sending: boolean;
  onSendText: (text: string) => void;
  onSendFile: (file: Blob, type: AttachmentType, name: string, duration?: number) => void;
  onTyping: (typing: boolean) => void;
}

/** Text, attachments and voice notes, with the message being replied to shown above. */
export const ChatComposer = ({ replyingTo, onCancelReply, sending, onSendText, onSendFile, onTyping }: ChatComposerProps) => {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const typingTimer = useRef<number | undefined>(undefined);
  const secondsRef = useRef(0);

  useEffect(() => () => {
    window.clearTimeout(typingTimer.current);
    recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => {
      secondsRef.current += 1;
      setSeconds(secondsRef.current);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  const onChange = (value: string) => {
    setText(value);
    onTyping(value.length > 0);
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => onTyping(false), 3000);
  };

  const submit = () => {
    if (!text.trim()) return;
    onSendText(text);
    setText("");
    onTyping(false);
  };

  const pickFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      toast.error("Files can be up to 10 MB.");
      return;
    }
    onSendFile(file, file.type.startsWith("image/") ? "image" : "file", file.name);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("Voice notes aren't supported on this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ["audio/webm", "audio/mp4", "audio/ogg"].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const type = (recorder.mimeType || "audio/webm").split(";")[0];
        const blob = new Blob(chunks, { type });
        const extension = type.split("/")[1] ?? "webm";
        if (blob.size > 0 && blob.size <= MAX_BYTES) onSendFile(blob, "voice", `voice-note.${extension}`, secondsRef.current);
        else if (blob.size > MAX_BYTES) toast.error("That voice note is too long.");
      };
      recorderRef.current = recorder;
      secondsRef.current = 0;
      setSeconds(0);
      recorder.start();
      setRecording(true);
    } catch {
      toast.error("Allow microphone access to record a voice note.");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="border-t">
      {replyingTo && (
        <div className="flex items-center gap-2 bg-muted/60 px-3 py-2 text-sm">
          <p className="min-w-0 flex-1 truncate border-l-2 border-gold pl-2">
            {replyingTo.content || (replyingTo.attachment ? replyingTo.attachment.name : "Message")}
          </p>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Cancel reply" onClick={onCancelReply}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <form
        className="flex items-center gap-2 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept={FILE_TYPES}
          className="hidden"
          onChange={(event) => {
            pickFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <Button type="button" variant="ghost" size="icon" disabled={sending || recording} aria-label="Attach a photo or document" onClick={() => fileRef.current?.click()}>
          <Paperclip className="h-5 w-5" />
        </Button>

        {recording ? (
          <p className="flex flex-1 items-center gap-2 text-sm font-medium text-destructive" aria-live="polite">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-destructive" />
            Recording {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
          </p>
        ) : (
          <Input value={text} onChange={(event) => onChange(event.target.value)} placeholder="Type a message" maxLength={2000} aria-label="Message" />
        )}

        {text.trim() ? (
          <Button type="submit" size="icon" disabled={sending} aria-label="Send"><Send className="h-4 w-4" /></Button>
        ) : recording ? (
          <Button type="button" size="icon" variant="destructive" aria-label="Stop and send voice note" onClick={stopRecording}><Square className="h-4 w-4" /></Button>
        ) : (
          <Button type="button" size="icon" disabled={sending} aria-label="Record a voice note" onClick={startRecording}><Mic className="h-4 w-4" /></Button>
        )}
      </form>
    </div>
  );
};
