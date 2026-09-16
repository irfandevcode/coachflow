import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, Menu, X } from "lucide-react";

const navItems = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/system", label: "The system" },
  { href: "/about", label: "About" },
  { href: "/insights", label: "Insights" },
];

export function Logo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label="Ascendra home">
      <span className="logo-mark" aria-hidden="true">A</span>
      <span className="text-[1.05rem] font-bold tracking-[-0.03em] text-[#0b1f3a]">Ascendra</span>
    </Link>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-[#fbfdff] text-[#0b1f3a]">
      <header className="sticky top-0 z-50 border-b border-[#dce8f6]/80 bg-[#fbfdff]/90 backdrop-blur-xl">
        <div className="container flex h-[76px] items-center justify-between gap-6">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${location === item.href ? "is-active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/contact" className="nav-link">Contact</Link>
            <Link href="/audit" className="button button-primary !px-5 !py-3 text-sm">
              Get your free audit <ArrowUpRight size={16} />
            </Link>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce8f6] bg-white text-[#0b1f3a] lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {open && (
          <div className="border-t border-[#dce8f6] bg-white px-4 py-4 lg:hidden">
            <nav className="container flex flex-col gap-1" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold text-[#49627e] hover:bg-[#f1f6fc]">
                  {item.label}
                </Link>
              ))}
              <Link href="/contact" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold text-[#49627e] hover:bg-[#f1f6fc]">Contact</Link>
              <Link href="/audit" onClick={() => setOpen(false)} className="button button-primary mt-2">Get your free audit <ArrowUpRight size={16} /></Link>
            </nav>
          </div>
        )}
      </header>
      <main>{children}</main>
      <footer className="border-t border-[#dce8f6] bg-white">
        <div className="container grid gap-12 py-14 md:grid-cols-[1.3fr_1fr_1fr_1fr] md:py-20">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-7 text-[#627895]">Client acquisition systems for health & fitness coaches who want a clearer path from attention to qualified conversations.</p>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-[#9aaec6]">Built for the next stage</p>
          </div>
          <div>
            <p className="footer-heading">Explore</p>
            <div className="footer-links"><Link href="/how-it-works">How it works</Link><Link href="/system">The system</Link><Link href="/about">About Ascendra</Link><Link href="/insights">Insights</Link></div>
          </div>
          <div>
            <p className="footer-heading">Take action</p>
            <div className="footer-links"><Link href="/audit">Free acquisition audit</Link><Link href="/book">Book a strategy call</Link><Link href="/contact">Contact the team</Link></div>
          </div>
          <div>
            <p className="footer-heading">Fine print</p>
            <div className="footer-links"><Link href="/privacy">Privacy policy</Link><Link href="/terms">Terms of service</Link></div>
            <p className="mt-6 text-sm text-[#91a5bd]">© 2026 Ascendra</p>
          </div>
        </div>
        <div className="border-t border-[#edf3fa] py-4"><div className="container flex flex-col gap-2 text-xs text-[#91a5bd] sm:flex-row sm:items-center sm:justify-between"><span>Thoughtful systems. Better conversations.</span><span>For coaches building with intention.</span></div></div>
      </footer>
    </div>
  );
}

export function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return <p className={`eyebrow ${dark ? "text-[#a9c7f5]" : ""}`}><span className="eyebrow-dot" />{children}</p>;
}

export function SectionIntro({ eyebrow, title, body, align = "left", dark = false }: { eyebrow: string; title: ReactNode; body?: ReactNode; align?: "left" | "center"; dark?: boolean }) {
  return <div className={`${align === "center" ? "mx-auto text-center" : ""} max-w-2xl`}>
    <Eyebrow dark={dark}>{eyebrow}</Eyebrow>
    <h2 className={`display-heading mt-5 ${dark ? "text-white" : "text-[#0b1f3a]"}`}>{title}</h2>
    {body && <p className={`mt-5 text-lg leading-8 ${dark ? "text-[#c7d8ee]" : "text-[#627895]"}`}>{body}</p>}
  </div>;
}

export function PrimaryButton({ href = "/audit", children = "Get your free audit" }: { href?: string; children?: ReactNode }) {
  return <Link href={href} className="button button-primary">{children}<ArrowUpRight size={17} /></Link>;
}

export function SecondaryButton({ href = "/how-it-works", children = "See how it works" }: { href?: string; children?: ReactNode }) {
  return <Link href={href} className="button button-secondary">{children}<ArrowUpRight size={17} /></Link>;
}

export function SectionRule() { return <div className="section-rule" />; }

export function PageFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <SiteShell><div className={className}>{children}</div></SiteShell>;
}
