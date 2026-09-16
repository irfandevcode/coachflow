import { ArrowRight, BarChart3, CalendarCheck2, Check, ChevronRight, CircleCheck, Clock3, Filter, Layers3, Mail, MessageCircleMore, MousePointerClick, Play, RefreshCw, ShieldCheck, Sparkles, Target, Zap } from "lucide-react";
import { Link } from "wouter";
import { Eyebrow, PageFrame, PrimaryButton, SecondaryButton, SectionIntro, SectionRule } from "@/components/SiteShell";

const pipeline = [
  { label: "Attract", detail: "Content / outreach / ads", icon: Target, tone: "blue" },
  { label: "Capture", detail: "Landing page / lead magnet", icon: MousePointerClick, tone: "sky" },
  { label: "Nurture", detail: "Email / SMS / follow-up", icon: Mail, tone: "blue" },
  { label: "Qualify", detail: "Application / questions", icon: ShieldCheck, tone: "sky" },
  { label: "Book", detail: "Calendar / appointment", icon: CalendarCheck2, tone: "blue" },
  { label: "Follow up", detail: "Reminders / re-engagement", icon: RefreshCw, tone: "sky" },
  { label: "Convert", detail: "Sales conversation", icon: BarChart3, tone: "blue" },
];

const services = [
  { icon: Layers3, name: "Strategy", body: "Turn audience, offer, and customer insight into an acquisition path that makes sense." },
  { icon: Filter, name: "Funnel build", body: "Create the pages and touchpoints that move a curious prospect toward a qualified conversation." },
  { icon: Zap, name: "Automation", body: "Keep the right follow-up moving without asking you to manually chase every inquiry." },
  { icon: Sparkles, name: "Conversion", body: "Clarify your message, calls to action, and booking experience so good-fit prospects can act." },
];

const leaks = ["DMs become the default destination", "Interested prospects disappear after asking", "Your link-in-bio sends people everywhere", "People who are not ready today receive no next step"];

export default function Home() {
  return (
    <PageFrame>
      <section className="hero-section overflow-hidden">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="container relative grid gap-14 pb-20 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-8 lg:pb-28 lg:pt-24">
          <div className="relative z-10 max-w-2xl">
            <Eyebrow>Client acquisition systems for coaches</Eyebrow>
            <h1 className="display-heading mt-6 max-w-[720px] text-[#0b1f3a]">Turn your coaching expertise into a <span className="text-[#1261d6]">predictable client acquisition system.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#536d8b]">We help coaches build predictable client acquisition systems — combining funnels, automation, lead nurturing, booking, and conversion strategy — so existing attention and inquiries can move toward more qualified sales conversations.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton />
              <SecondaryButton />
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-[#6b819b]">
              <span className="inline-flex items-center gap-2"><CircleCheck size={16} className="text-[#1261d6]" /> No exaggerated promises</span>
              <span className="inline-flex items-center gap-2"><CircleCheck size={16} className="text-[#1261d6]" /> Built around your offer</span>
            </div>
          </div>
          <div className="relative z-10 lg:pl-8">
              <div className="hero-dashboard">
              <div className="flex items-start justify-between border-b border-[#e6eef8] pb-5">
                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8aa2bf]">The acquisition view</p><p className="mt-2 text-lg font-bold text-[#0b1f3a]">A clearer path to the call</p></div>
                <span className="rounded-full bg-[#eaf3ff] px-3 py-1.5 text-xs font-bold text-[#1261d6]">System map</span>
              </div>
              <div className="mt-6 space-y-3">
                {[{ icon: MessageCircleMore, title: "Existing audience", sub: "Content + conversations", stat: "Attention" }, { icon: Filter, title: "Acquisition path", sub: "Capture + nurture + qualify", stat: "Structure" }, { icon: CalendarCheck2, title: "Qualified conversation", sub: "Book + follow up", stat: "Momentum" }].map((item, i) => { const Icon = item.icon; return <div key={item.title} className="flex items-center gap-4 rounded-2xl border border-[#e3edf8] bg-white p-4 shadow-[0_8px_24px_rgba(16,74,139,0.05)]"><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${i === 1 ? "bg-[#1261d6] text-white" : "bg-[#edf5ff] text-[#1261d6]"}`}><Icon size={20} /></div><div className="min-w-0 flex-1"><p className="text-sm font-bold text-[#163453]">{item.title}</p><p className="mt-1 text-xs text-[#7990aa]">{item.sub}</p></div><span className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-[#9ab0c8] sm:block">{item.stat}</span></div> })}
              </div>
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#f3f8fe] px-4 py-3"><div className="flex -space-x-2"><span className="avatar avatar-a">J</span><span className="avatar avatar-b">M</span><span className="avatar avatar-c">A</span></div><p className="text-xs font-semibold leading-5 text-[#59728f]">Your system should make the next step <span className="text-[#1261d6]">obvious.</span></p></div>
            </div>
            <div className="floating-note floating-note-one"><span className="pulse-dot" /> Less manual chasing</div>
            <div className="floating-note floating-note-two"><Clock3 size={14} /> Built to follow through</div>
          </div>
        </div>
        <div className="container pb-7"><div className="brand-strip"><span>For coaches who already have something worth sharing.</span><div className="brand-strip-items"><span>01 — Clarity</span><span>02 — Consistency</span><span>03 — Conversion</span></div></div></div>
      </section>

      <section className="section-padding bg-white">
        <div className="container grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <SectionIntro eyebrow="The opportunity" title={<>Your content may be working. <span className="text-[#1261d6]">Your client journey might not be.</span></>} body="When interest has nowhere clear to go, good-fit prospects can get stuck between discovering you and deciding to talk." />
          <div className="grid gap-3 sm:grid-cols-2">
            {leaks.map((leak, index) => <div key={leak} className="leak-card"><span className="leak-number">0{index + 1}</span><span>{leak}</span><ChevronRight size={17} className="ml-auto text-[#9bb0c8]" /></div>)}
          </div>
        </div>
      </section>

      <section className="section-padding bg-[#f4f8fd]">
        <div className="container"><SectionIntro eyebrow="The Ascendra system" title={<>From scattered touchpoints to a <span className="text-[#1261d6]">connected path.</span></>} body="We design the full journey around the way your prospects actually make decisions — not just a pretty page at the end of the process." />
          <div className="pipeline-wrap mt-14"><div className="pipeline-line" /> <div className="grid gap-4 md:grid-cols-7">{pipeline.map((item, index) => { const Icon = item.icon; return <div key={item.label} className="pipeline-step"><div className={`pipeline-icon ${item.tone}`}><Icon size={21} /></div><span className="mt-4 text-sm font-bold text-[#143455]">{item.label}</span><span className="mt-2 text-xs leading-5 text-[#7890aa]">{item.detail}</span>{index < pipeline.length - 1 && <ArrowRight className="pipeline-arrow" size={16} />}</div> })}</div></div>
          <div className="mt-9 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#dce9f7] bg-white px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eaf3ff] text-[#1261d6]"><Check size={17} /></div><span className="text-sm font-semibold text-[#385676]">One connected system, built around your offer.</span></div><Link href="/system" className="inline-flex items-center gap-2 text-sm font-bold text-[#1261d6]">Explore the system <ArrowRight size={16} /></Link></div>
        </div>
      </section>

      <section className="section-padding bg-[#0b1f3a] text-white">
        <div className="container grid gap-12 lg:grid-cols-[.7fr_1.3fr] lg:items-start"><div><SectionIntro dark eyebrow="What we build" title={<>The pieces work better <span className="text-[#83b8ff]">together.</span></>} body="Ascendra helps you connect the strategy, pages, follow-up, and conversion decisions that create momentum." /></div><div className="grid gap-3 sm:grid-cols-2">{services.map((service, index) => { const Icon = service.icon; return <div key={service.name} className="service-card"><div className="flex items-center justify-between"><div className="service-icon"><Icon size={20} /></div><span className="text-xs font-bold text-[#83b8ff]">0{index + 1}</span></div><h3 className="mt-7 text-xl font-bold text-white">{service.name}</h3><p className="mt-3 text-sm leading-7 text-[#afc4dd]">{service.body}</p></div> })}</div></div>
      </section>

      <section className="section-padding bg-white"><div className="container grid gap-12 lg:grid-cols-[1fr_.9fr] lg:items-center"><div className="relative"><div className="audit-card"><div className="flex items-center justify-between"><div><Eyebrow>Free diagnostic</Eyebrow><h3 className="mt-3 text-2xl font-bold text-[#0b1f3a]">Where is your system strongest?</h3></div><div className="score-ring"><span>54</span><small>/100</small></div></div><div className="mt-7 space-y-4">{["Traffic", "Lead capture", "Nurturing", "Booking", "Follow-up"].map((label, i) => <div key={label}><div className="mb-2 flex justify-between text-xs font-bold text-[#58718f]"><span>{label}</span><span>{[62, 48, 35, 71, 24][i]}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#e9f1fa]"><div className="h-full rounded-full bg-[#1261d6]" style={{ width: `${[62, 48, 35, 71, 24][i]}%` }} /></div></div>)}</div><div className="mt-7 flex items-center gap-2 border-t border-[#e7eff8] pt-5 text-xs font-semibold text-[#7188a3]"><ShieldCheck size={15} className="text-[#1261d6]" /> Educational diagnostic — not a performance guarantee.</div></div><div className="audit-sticker"><Play size={13} fill="currentColor" /> Takes about 3 minutes</div></div><div className="max-w-xl"><SectionIntro eyebrow="Start with clarity" title={<>Before you build more, find the <span className="text-[#1261d6]">leak.</span></>} body="Get a free breakdown of your client acquisition system and see where potential leads may be getting lost — from first touch to booked conversation." /><div className="mt-8"><PrimaryButton href="/audit">Get my free audit</PrimaryButton></div><p className="mt-5 text-sm text-[#8195ad]">No pressure. No generic scorecard. Just a useful starting point for your next decision.</p></div></div></section>

      <section className="section-padding bg-[#f4f8fd]"><div className="container"><div className="cta-panel"><div className="max-w-2xl"><Eyebrow dark>Ready when you are</Eyebrow><h2 className="display-heading mt-5 text-white">Build the path your best prospects deserve.</h2><p className="mt-5 text-lg leading-8 text-[#c4d7ed]">A better client journey starts with understanding what is happening today.</p></div><div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col"><PrimaryButton href="/audit">Find your biggest opportunity</PrimaryButton><SecondaryButton href="/book">Book a strategy call</SecondaryButton></div></div></div></section>
      <SectionRule />
    </PageFrame>
  );
}
