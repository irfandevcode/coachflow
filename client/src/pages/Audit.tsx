import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CircleHelp, CircleCheck, Loader2, LockKeyhole, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Eyebrow, PageFrame } from "@/components/SiteShell";
import { trpc } from "@/lib/trpc";

type AuditForm = {
  name: string;
  email: string;
  website: string;
  niche: string;
  offer: string;
  price: string;
  monthlyLeads: string;
  bookedCalls: string;
  leadSource: string;
  challenge: string;
};
type Category = { label: string; score: number; explanation: string; opportunity: string };

const initialForm: AuditForm = { name: "", email: "", website: "", niche: "", offer: "", price: "", monthlyLeads: "", bookedCalls: "", leadSource: "", challenge: "" };
const steps = ["Basics", "Offer", "Flow", "Challenge"];

function scoreAudit(form: AuditForm): Category[] {
  const leadVolume = Number(form.monthlyLeads) || 0;
  const bookedCalls = Number(form.bookedCalls) || 0;
  const bookingRate = leadVolume > 0 ? bookedCalls / leadVolume : 0;
  const traffic = form.leadSource ? (form.leadSource === "referrals" || form.leadSource === "content" ? 72 : 58) : 28;
  const capture = form.website && form.offer ? 65 : form.website || form.offer ? 52 : 32;
  const nurturing = form.challenge === "follow-up" ? 28 : form.challenge === "nurture" ? 30 : form.leadSource === "content" ? 52 : 42;
  const booking = bookingRate >= 0.2 ? 78 : bookingRate >= 0.1 ? 63 : form.bookedCalls ? 49 : 34;
  const followUp = form.challenge === "follow-up" ? 26 : form.challenge === "no-shows" ? 31 : form.challenge ? 46 : 39;

  return [
    { label: "Traffic", score: traffic, explanation: traffic >= 60 ? "You have at least one identifiable path bringing attention toward the offer." : "Your primary lead source is still a useful area to make more intentional.", opportunity: "Clarify which source brings the best-fit conversations, not just the most activity." },
    { label: "Lead capture", score: capture, explanation: capture >= 60 ? "Your offer and online presence give you a starting point for capturing interest." : "There may be room to make the first step easier to understand and take.", opportunity: "Give interested prospects one clear next step instead of asking them to figure it out." },
    { label: "Nurturing", score: nurturing, explanation: nurturing >= 50 ? "Some follow-through signals are present, but consistency can still compound." : "The handoff after initial interest looks like a meaningful opportunity.", opportunity: "Build a short, useful follow-up path for people who are not ready today." },
    { label: "Booking", score: booking, explanation: booking >= 60 ? "Your current booked-call pattern suggests there is a path worth strengthening." : "Booking is a useful place to reduce friction and add context for the prospect.", opportunity: "Connect qualification and scheduling so the call feels like the natural next step." },
    { label: "Follow-up", score: followUp, explanation: followUp >= 50 ? "You have a foundation to build on, especially around timing and reminders." : "Post-inquiry or post-booking follow-up is likely an important leak to inspect.", opportunity: "Create clear next steps for no-shows, undecided prospects, and people who need more time." },
  ];
}

export default function Audit() {
  const [form, setForm] = useState<AuditForm>(initialForm);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<Category[] | null>(null);
  const [submitError, setSubmitError] = useState("");
  const submitAudit = trpc.audit.submit.useMutation();
  const categories = useMemo(() => result ?? scoreAudit(form), [form, result]);
  const overall = Math.round(categories.reduce((sum, category) => sum + category.score, 0) / categories.length);
  const update = (key: keyof AuditForm, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const canContinue = step === 0 ? Boolean(form.name && form.email) : step === 1 ? Boolean(form.niche && form.offer) : step === 2 ? Boolean(form.monthlyLeads && form.bookedCalls && form.leadSource) : Boolean(form.challenge);

  async function finish(event?: FormEvent) {
    event?.preventDefault();
    const scored = scoreAudit(form);
    setResult(scored);
    setSubmitError("");
    try {
      await submitAudit.mutateAsync({
        ...form,
        overallScore: Math.round(scored.reduce((sum, category) => sum + category.score, 0) / scored.length),
        categoryScores: scored.map((category) => ({ label: category.label, score: category.score })),
      });
    } catch {
      setSubmitError("Your result is ready. We could not save a copy to the dashboard, but nothing is blocking your review.");
    }
  }

  return (
    <PageFrame>
      <section className="page-hero">
        <div className="container py-16 lg:py-24">
          <Eyebrow>Free client acquisition audit</Eyebrow>
          <h1 className="display-heading mt-6 max-w-3xl text-[#0b1f3a]">Is your coaching business losing potential clients before they <span className="text-[#1261d6]">book a call?</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5b7491]">Answer a few focused questions to get an educational diagnostic of the path from attention to sales conversation.</p>
        </div>
      </section>
      <section className="section-padding bg-white">
        <div className="container">
          {!result ? <AuditFormView form={form} step={step} steps={steps} canContinue={canContinue} update={update} setStep={setStep} finish={finish} isPending={submitAudit.isPending} /> : <AuditResult categories={categories} overall={overall} name={form.name} submitError={submitError} />}
        </div>
      </section>
    </PageFrame>
  );
}

function AuditFormView({ form, step, steps, canContinue, update, setStep, finish, isPending }: { form: AuditForm; step: number; steps: string[]; canContinue: boolean; update: (key: keyof AuditForm, value: string) => void; setStep: React.Dispatch<React.SetStateAction<number>>; finish: (event?: FormEvent) => void; isPending: boolean }) {
  return <div className="mx-auto max-w-3xl">
    <div className="mb-8 flex items-center justify-between gap-4"><div><p className="text-sm font-bold text-[#163453]">Step {step + 1} of {steps.length}</p><div className="mt-3 flex gap-2">{steps.map((label, index) => <div key={label} className={`h-1.5 w-14 rounded-full sm:w-20 ${index <= step ? "bg-[#1261d6]" : "bg-[#e4edf7]"}`} title={label} />)}</div></div><span className="text-xs font-semibold text-[#91a5bd]">About 3 minutes</span></div>
    <form className="audit-form" onSubmit={finish}>
      <div className="mb-8 border-b border-[#e7eff8] pb-7"><h2 className="text-2xl font-bold text-[#0b1f3a]">{step === 0 ? "Let’s start with the basics." : step === 1 ? "Tell us about the offer." : step === 2 ? "What happens in the flow today?" : "Where would more support help?"}</h2><p className="mt-2 text-sm leading-6 text-[#7890aa]">{step === 0 ? "We use this to tailor the result and send it to you." : step === 1 ? "A little context helps separate a real opportunity from a generic suggestion." : step === 2 ? "Approximate numbers are fine — this is a diagnostic, not an exam." : "Choose the closest match. You can add more detail if you want."}</p></div>
      {step === 0 && <div className="grid gap-5 sm:grid-cols-2"><Field label="Your name" value={form.name} onChange={(value) => update("name", value)} placeholder="Jane Smith" required /><Field label="Email address" type="email" value={form.email} onChange={(value) => update("email", value)} placeholder="jane@yourbusiness.com" required /><Field label="Website or profile link" value={form.website} onChange={(value) => update("website", value)} placeholder="https://" /><SelectField label="Primary niche" value={form.niche} onChange={(value) => update("niche", value)} options={["Online fitness coaching", "Nutrition coaching", "Strength & performance", "Wellness coaching", "Other health coaching"]} placeholder="Choose a niche" /></div>}
      {step === 1 && <div className="grid gap-5"><Field label="What do you sell?" value={form.offer} onChange={(value) => update("offer", value)} placeholder="e.g. 12-week 1:1 coaching" required /><div className="grid gap-5 sm:grid-cols-2"><SelectField label="Typical offer price" value={form.price} onChange={(value) => update("price", value)} options={["Under $500", "$500–$1,500", "$1,500–$3,000", "$3,000+"]} placeholder="Choose a range" /><Field label="Who is it for?" value={form.niche} onChange={(value) => update("niche", value)} placeholder="e.g. busy professionals" required /></div></div>}
      {step === 2 && <div className="grid gap-5 sm:grid-cols-2"><SelectField label="Approx. monthly leads" value={form.monthlyLeads} onChange={(value) => update("monthlyLeads", value)} options={["1–10", "11–25", "26–50", "51–100", "100+"]} placeholder="Choose a range" required /><SelectField label="Approx. monthly booked calls" value={form.bookedCalls} onChange={(value) => update("bookedCalls", value)} options={["0", "1–5", "6–10", "11–20", "20+"]} placeholder="Choose a range" required /><SelectField label="Primary lead source" value={form.leadSource} onChange={(value) => update("leadSource", value)} options={["content", "referrals", "paid ads", "cold outreach", "other"]} placeholder="Choose a source" required /><div className="rounded-2xl bg-[#f5f9fe] p-4 text-sm leading-6 text-[#6c849f]"><CircleHelp size={17} className="mb-2 text-[#1261d6]" />Use your best estimate. We are looking for patterns worth exploring, not perfect reporting.</div></div>}
      {step === 3 && <div className="grid gap-3">{[{ value: "capture", label: "Turning attention into identifiable leads" }, { value: "nurture", label: "Following up when people are not ready" }, { value: "booking", label: "Getting qualified prospects to book" }, { value: "follow-up", label: "Staying on top of no-shows and open loops" }, { value: "clarity", label: "Knowing which part to improve first" }].map((option) => <label key={option.value} className={`choice-card ${form.challenge === option.value ? "is-selected" : ""}`}><input type="radio" name="challenge" value={option.value} checked={form.challenge === option.value} onChange={(event) => update("challenge", event.target.value)} /><span className="choice-radio" /><span className="text-sm font-semibold text-[#365372]">{option.label}</span></label>)}</div>}
      <div className="mt-9 flex flex-col-reverse justify-between gap-3 border-t border-[#e7eff8] pt-6 sm:flex-row">{step > 0 ? <button type="button" className="button button-secondary" onClick={() => setStep((current) => current - 1)}><ArrowLeft size={16} /> Back</button> : <span />}{step < steps.length - 1 ? <button type="button" className="button button-primary" disabled={!canContinue} onClick={() => setStep((current) => current + 1)}>Continue <ArrowRight size={16} /></button> : <button type="submit" className="button button-primary" disabled={!canContinue || isPending}>{isPending ? <><Loader2 size={16} className="animate-spin" /> Building your audit</> : <>See my audit <ArrowRight size={16} /></>}</button>}</div>
      <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-[#91a5bd]"><LockKeyhole size={14} /> Your information is only used to prepare your requested result.</div>
    </form>
  </div>;
}

function AuditResult({ categories, overall, name, submitError }: { categories: Category[]; overall: number; name: string; submitError: string }) {
  const label = overall <= 20 ? "Major opportunity" : overall <= 40 ? "Needs improvement" : overall <= 60 ? "Developing" : overall <= 80 ? "Strong foundation" : "Advanced";
  return <div className="mx-auto max-w-5xl"><div className="result-header"><div><Eyebrow>Automated diagnostic</Eyebrow><h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-[#0b1f3a]">Your client acquisition score<span className="text-[#1261d6]">.</span></h2><p className="mt-2 text-sm text-[#7188a3]">Prepared for {name || "your coaching business"}</p></div><div className="result-score"><span>{overall}</span><small>/100</small></div></div><div className="mt-7 inline-flex rounded-full bg-[#eaf3ff] px-4 py-2 text-sm font-bold text-[#1261d6]">{label}</div><div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <div key={category.label} className="result-card"><div className="flex items-center justify-between"><span className="text-sm font-bold text-[#365372]">{category.label}</span><span className="text-xl font-black text-[#1261d6]">{category.score}</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e6eff9]"><div className="h-full rounded-full bg-[#1261d6]" style={{ width: `${category.score}%` }} /></div><p className="mt-5 text-sm leading-6 text-[#7188a3]">{category.explanation}</p><p className="mt-4 border-t border-[#e7eff8] pt-4 text-xs font-semibold leading-5 text-[#4e6885]">Opportunity: {category.opportunity}</p></div>)}</div>{submitError && <p className="mt-6 rounded-xl bg-[#fff7e8] px-4 py-3 text-sm font-semibold text-[#956a15]">{submitError}</p>}<div className="mt-10 grid gap-5 lg:grid-cols-2"><div className="result-callout"><Sparkles className="text-[#1261d6]" size={20} /><div><h3 className="font-bold text-[#163453]">What’s working</h3><p className="mt-2 text-sm leading-6 text-[#7188a3]">Your result is a starting point. The strongest signals are the areas with a clear path already in motion — now they can support the weaker handoffs.</p></div></div><div className="result-callout"><CircleCheck className="text-[#1261d6]" size={20} /><div><h3 className="font-bold text-[#163453]">Where to look next</h3><p className="mt-2 text-sm leading-6 text-[#7188a3]">Use the lowest category as a conversation starter, not a verdict. A human review can add context this automated diagnostic cannot.</p></div></div></div><div className="mt-10 flex flex-col gap-3 sm:flex-row"><Link href="/book" className="button button-primary">Review my acquisition system <ArrowRight size={17} /></Link><Link href="/contact" className="button button-secondary">Ask a question <ArrowRight size={17} /></Link></div><p className="mt-6 text-xs leading-6 text-[#91a5bd]">This score is an educational diagnostic based only on the information you provided. It is not a guarantee or prediction of business performance, lead volume, revenue, or client results.</p></div>;
}

function Field({ label, value, onChange, placeholder, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; required?: boolean }) { return <label className="form-label">{label}<input className="input-field" type={type} value={value} placeholder={placeholder} required={required} onChange={(event) => onChange(event.target.value)} /></label>; }
function SelectField({ label, value, onChange, options, placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; options: string[]; placeholder: string; required?: boolean }) { return <label className="form-label">{label}<select className="input-field" value={value} required={required} onChange={(event) => onChange(event.target.value)}><option value="">{placeholder}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
