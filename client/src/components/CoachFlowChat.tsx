import { useState } from "react";
import { ArrowRight, Bot, CalendarDays, MessageCircle, Sparkles, X } from "lucide-react";
import { Link } from "wouter";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";

type QualificationKey = "goal" | "offer" | "leadFlow" | "timeline";
type Qualification = { stage: number; answers: Partial<Record<QualificationKey, string>> };

const qualificationSteps: Array<{ key: QualificationKey; label: string }> = [
  { key: "goal", label: "Your coaching" },
  { key: "offer", label: "Your offer" },
  { key: "leadFlow", label: "Lead flow" },
  { key: "timeline", label: "Timeline" },
];

const welcomeMessage: Message = {
  role: "assistant",
  content: "Hi — I’m the CoachFlow assistant. I’ll ask four quick questions to understand your acquisition flow, then I’ll point you toward the most useful next step.\n\nFirst, what kind of coaching do you offer, and who do you most want to help?",
};

const suggestedPrompts = [
  "I help health and fitness clients",
  "I help founders grow their businesses",
  "I’m not sure where my funnel is leaking",
];

export function CoachFlowChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [qualification, setQualification] = useState<Qualification>({ stage: 0, answers: {} });
  const chat = trpc.ai.chat.useMutation();

  function sendMessage(content: string) {
    const currentStep = qualificationSteps[qualification.stage];
    const nextQualification: Qualification = currentStep
      ? { stage: Math.min(qualification.stage + 1, qualificationSteps.length), answers: { ...qualification.answers, [currentStep.key]: content } }
      : qualification;
    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setQualification(nextQualification);
    chat.mutate(
      {
        messages: nextMessages.filter((message): message is Message & { role: "user" | "assistant" } => message.role !== "system"),
        qualification: nextQualification,
      },
      {
        onSuccess: (response) => setMessages((current) => [...current, { role: "assistant", content: response.content }]),
        onError: (error) => setMessages((current) => [...current, { role: "assistant", content: error.message || "I’m having trouble connecting right now. Please try again in a moment." }]),
      },
    );
  }

  return <div className="coach-chat-root">
    {open && <div className="coach-chat-panel" role="dialog" aria-label="CoachFlow AI assistant">
      <div className="coach-chat-header"><div className="flex items-center gap-3"><div className="coach-chat-avatar"><Bot size={18} /></div><div><p className="text-sm font-extrabold text-white">CoachFlow assistant</p><p className="mt-0.5 text-[11px] font-semibold text-[#b9d7ff]">A quick path to your next step</p></div></div><button type="button" className="coach-chat-close" onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button></div>
      <div className="coach-chat-progress" aria-label={`${qualification.stage} of 4 qualifying questions answered`}><div className="flex items-center justify-between"><span>Consultation fit check</span><strong>{qualification.stage}/4</strong></div><div className="coach-chat-progress-track"><span style={{ width: `${qualification.stage * 25}%` }} /></div><div className="coach-chat-progress-steps">{qualificationSteps.map((step, index) => <span key={step.key} className={index < qualification.stage ? "is-complete" : ""}>{step.label}</span>)}</div></div>
      <AIChatBox
        messages={messages}
        onSendMessage={sendMessage}
        isLoading={chat.isPending}
        height="min(455px, calc(100vh - 260px))"
        placeholder={qualification.stage < 4 ? "Answer the question above..." : "Ask a follow-up question..."}
        emptyStateMessage="Answer four quick questions and we’ll point you toward the best next step."
        suggestedPrompts={qualification.stage === 0 ? suggestedPrompts : undefined}
        className="coach-chat-box"
      />
      {qualification.stage >= 4 && <div className="coach-chat-booking"><div className="coach-chat-booking-icon"><CalendarDays size={17} /></div><div className="min-w-0 flex-1"><p className="text-sm font-extrabold text-[#0b1f3a]">Ready to make this practical?</p><p className="mt-0.5 text-xs leading-5 text-[#6d849e]">Bring your answers to a focused consultation about your acquisition path.</p></div><Link href="/book" className="coach-chat-booking-link">Book <ArrowRight size={14} /></Link></div>}
      <div className="coach-chat-disclaimer"><Sparkles size={13} /> Helpful guidance, no pressure, no guaranteed results.</div>
    </div>}
    <button type="button" className={`coach-chat-trigger ${open ? "is-open" : ""}`} onClick={() => setOpen((value) => !value)} aria-label={open ? "Close CoachFlow assistant" : "Open CoachFlow assistant"} aria-expanded={open}>
      {open ? <X size={21} /> : <MessageCircle size={21} />}<span>{open ? "Close" : "Ask CoachFlow"}</span>{!open && <span className="coach-chat-live-dot" />}
    </button>
  </div>;
}
