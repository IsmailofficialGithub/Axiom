import Link from "next/link";
import { ArrowRight, BarChart3, Shield, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-24 md:py-32 lg:py-40 bg-[var(--background)]">
        <div className="container mx-auto px-4 md:px-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-800 px-3 py-1 text-sm text-[var(--color-brand-emerald)] font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-[var(--color-brand-emerald)] mr-2"></span>
            Axiom Platform v1.0 is Live
          </div>
          
          <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl mb-8 text-balance">
            Connecting Startups with <span className="text-[var(--color-brand-emerald)]">Smart Capital</span>
          </h1>
          
          <p className="max-w-2xl text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 text-balance">
            The premier platform empowering scalable growth through strategic institutional funding, precise analytics, and secure deal rooms.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              href="/register" 
              className="inline-flex h-12 items-center justify-center rounded-md bg-[var(--color-brand-emerald)] px-8 text-sm font-medium text-white shadow transition-colors hover:bg-[var(--color-brand-emerald-hover)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-brand-emerald)]"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link 
              href="/login" 
              className="inline-flex h-12 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 bg-[var(--background)] px-8 text-sm font-medium shadow-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300"
            >
              Institutional Login
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="w-full py-20 bg-[var(--card-bg)] border-y border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-brand-emerald)]/10 text-[var(--color-brand-emerald)]">
                <BarChart3 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Data-Driven Deals</h3>
              <p className="text-slate-600 dark:text-slate-400">Advanced metrics and portfolio analytics to ensure capital goes where it grows.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-brand-emerald)]/10 text-[var(--color-brand-emerald)]">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Secure Deal Rooms</h3>
              <p className="text-slate-600 dark:text-slate-400">Enterprise-grade encryption and granular permissions for sensitive document sharing.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-brand-emerald)]/10 text-[var(--color-brand-emerald)]">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Curated Network</h3>
              <p className="text-slate-600 dark:text-slate-400">Direct access to vetted institutional investors and high-growth technology startups.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
