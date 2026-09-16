import { useState } from "react";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";

const welcomeMessage: Message = {
  role: "assistant",
  content: "Hi — I’m the CoachFlow assistant. I can help you spot leaks in your client acquisition flow, think through funnels and follow-up, or explain the free acquisition audit. What are you working on right now?",
};

const suggestedPrompts = [
  "Where might my funnel be leaking?",
  "How should I follow up with new leads?",
  "What is the free acquisition audit?",
];

export function CoachFlowChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const chat = trpc.ai.chat.useMutation();

  function sendMessage(content: string) {
    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    chat.mutate(
      { messages: nextMessages.filter((message): message is Message & { role: "user" | "assistant" } => message.role !== "system") },
      {
        onSuccess: (response) => setMessages((current) => [...current, { role: "assistant", content: response.content }]),
        onError: (error) => setMessages((current) => [...current, { role: "assistant", content: error.message || "I’m having trouble connecting right now. Please try again in a moment." }]),
      },
    );
  }

  return <div className="coach-chat-root">
    {open && <div className="coach-chat-panel" role="dialog" aria-label="CoachFlow AI assistant">
      <div className="coach-chat-header"><div className="flex items-center gap-3"><div className="coach-chat-avatar"><Bot size={18} /></div><div><p className="text-sm font-extrabold text-white">CoachFlow assistant</p><p className="mt-0.5 text-[11px] font-semibold text-[#b9d7ff]">AI guidance for your acquisition flow</p></div></div><button type="button" className="coach-chat-close" onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button></div>
      <AIChatBox
        messages={messages}
        onSendMessage={sendMessage}
        isLoading={chat.isPending}
        height="min(540px, calc(100vh - 170px))"
        placeholder="Ask about your client acquisition flow..."
        emptyStateMessage="Start with a question about your acquisition system."
        suggestedPrompts={suggestedPrompts}
        className="coach-chat-box"
      />
      <div className="coach-chat-disclaimer"><Sparkles size={13} /> Helpful guidance, not guaranteed business results.</div>
    </div>}
    <button type="button" className={`coach-chat-trigger ${open ? "is-open" : ""}`} onClick={() => setOpen((value) => !value)} aria-label={open ? "Close CoachFlow assistant" : "Open CoachFlow assistant"} aria-expanded={open}>
      {open ? <X size={21} /> : <MessageCircle size={21} />}<span>{open ? "Close" : "Ask CoachFlow"}</span>{!open && <span className="coach-chat-live-dot" />}
    </button>
  </div>;
}
