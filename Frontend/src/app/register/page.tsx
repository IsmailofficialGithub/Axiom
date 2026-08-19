"use client"

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Rocket, Briefcase, Building, Mail, Lock, DollarSign, Target } from "lucide-react";

export default function RegisterPage() {
  const [role, setRole] = useState<"startup" | "investor" | null>(null);

  const renderRoleSelection = () => (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Startup Card */}
      <button 
        onClick={() => setRole("startup")}
        className="text-left cursor-pointer border-2 border-slate-200 dark:border-slate-800 rounded-xl p-8 hover:border-[var(--color-brand-emerald)] dark:hover:border-[var(--color-brand-emerald)] transition-all relative group bg-[var(--card-bg)] shadow-sm hover:shadow-md"
      >
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white group-hover:bg-[var(--color-brand-emerald)] group-hover:text-white transition-colors">
            <Rocket className="h-7 w-7" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">STARTUP</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Apply as an innovative company seeking institutional investment. Provide your metrics and gain access to smart capital.
        </p>
      </button>

      {/* Investor Card */}
      <button 
        onClick={() => setRole("investor")}
        className="text-left cursor-pointer border-2 border-slate-200 dark:border-slate-800 rounded-xl p-8 hover:border-[var(--color-brand-emerald)] dark:hover:border-[var(--color-brand-emerald)] transition-all relative group bg-[var(--card-bg)] shadow-sm hover:shadow-md"
      >
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white group-hover:bg-[var(--color-brand-emerald)] group-hover:text-white transition-colors">
            <Briefcase className="h-7 w-7" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">INVESTOR</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Join as an institutional or accredited investor. Discover curated, data-driven deals and manage your portfolio.
        </p>
      </button>
    </div>
  );

  const renderStartupForm = () => (
    <div className="bg-[var(--card-bg)] py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-brand-emerald)] text-white">
            <Rocket className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold">Startup Application</h3>
        </div>
        <button onClick={() => setRole(null)} className="text-sm font-medium text-slate-500 hover:text-[var(--color-brand-emerald)] transition-colors">
          Change Role
        </button>
      </div>

      <form action="#" method="POST" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <input type="text" required className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="Axiom Corp" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Industry / Sector</label>
            <select required defaultValue="" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]">
              <option value="" disabled>Select an industry...</option>
              <option value="fintech">FinTech</option>
              <option value="healthtech">HealthTech</option>
              <option value="saas">Enterprise SaaS</option>
              <option value="ai">Artificial Intelligence</option>
              <option value="cleantech">CleanTech</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Current Stage</label>
            <select required defaultValue="" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]">
              <option value="" disabled>Select funding stage...</option>
              <option value="pre-seed">Pre-Seed</option>
              <option value="seed">Seed</option>
              <option value="series-a">Series A</option>
              <option value="series-b">Series B+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Annual Revenue (ARR)</label>
            <input type="text" required className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="$500,000" />
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-6">
          <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Account Credentials</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Founder Email</label>
              <input type="email" required className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="founder@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" required className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="••••••••" />
            </div>
          </div>
        </div>

        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-colors">
          Submit Application
        </button>
      </form>
    </div>
  );

  const renderInvestorForm = () => (
    <div className="bg-[var(--card-bg)] py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-brand-emerald)] text-white">
            <Briefcase className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold">Investor Registration</h3>
        </div>
        <button onClick={() => setRole(null)} className="text-sm font-medium text-slate-500 hover:text-[var(--color-brand-emerald)] transition-colors">
          Change Role
        </button>
      </div>

      <form action="#" method="POST" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" required className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="Jane Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Investment Firm</label>
            <input type="text" required className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="Quantum Capital" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Preferred Ticket Size</label>
            <select required defaultValue="" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]">
              <option value="" disabled>Select ticket size...</option>
              <option value="micro">$50k - $250k</option>
              <option value="small">$250k - $1M</option>
              <option value="medium">$1M - $5M</option>
              <option value="large">$5M+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Investment Focus (Comma separated)</label>
            <input type="text" required className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="FinTech, SaaS, AI" />
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-6">
          <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Account Credentials</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Institutional Email</label>
              <input type="email" required className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="jane@quantum.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" required className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="••••••••" />
            </div>
          </div>
        </div>

        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-brand-emerald)] hover:bg-[var(--color-brand-emerald-hover)] transition-colors">
          Complete Registration
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[var(--background)] min-h-[calc(100vh-64px)]">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl px-4">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-[var(--color-brand-emerald)] transition-colors mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Create your account</h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-10">
          Join Axiom to connect with the future of capital.
        </p>

        {!role && renderRoleSelection()}
        {role === "startup" && renderStartupForm()}
        {role === "investor" && renderInvestorForm()}

        <div className="mt-8 text-sm text-slate-500">
          <p>
            By continuing, you agree to our{" "}
            <a href="#" className="font-medium text-[var(--color-brand-emerald)] hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="font-medium text-[var(--color-brand-emerald)] hover:underline">
              Privacy Policy
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
