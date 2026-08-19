"use client"

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Rocket, Briefcase } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

const passwordSchema = z.string()
  .min(8, "Must be at least 8 characters")
  .max(64, "Cannot exceed 64 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

const nameSchema = z.string()
  .min(2, "Must be at least 2 characters")
  .max(50, "Cannot exceed 50 characters")
  .regex(/^[a-zA-Z]/, "Must start with a letter");

const companySchema = z.string()
  .min(2, "Must be at least 2 characters")
  .max(60, "Cannot exceed 60 characters")
  .regex(/^[a-zA-Z]/, "Must start with a letter");

const startupSchema = z.object({
  companyName: companySchema,
  industry: z.string().min(1, "Please select an industry"),
  stage: z.string().min(1, "Please select a funding stage"),
  revenue: z.string().max(20, "Revenue input cannot exceed 20 characters").optional(),
  email: z.string().email("Invalid email address").max(100, "Email cannot exceed 100 characters"),
  password: passwordSchema,
});
type StartupFormValues = z.infer<typeof startupSchema>;

const investorSchema = z.object({
  fullName: nameSchema,
  firmName: companySchema,
  ticketSize: z.string().min(1, "Please select a ticket size"),
  focus: z.string().max(150, "Focus description cannot exceed 150 characters").optional(),
  email: z.string().email("Invalid email address").max(100, "Email cannot exceed 100 characters"),
  password: passwordSchema,
});
type InvestorFormValues = z.infer<typeof investorSchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const getDeviceFingerprint = () => {
  if (typeof window === "undefined") return "unknown";
  return btoa(navigator.userAgent + window.screen.width + window.screen.height).substring(0, 32);
};

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"startup" | "investor" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const startupForm = useForm<StartupFormValues>({
    resolver: zodResolver(startupSchema),
  });

  const investorForm = useForm<InvestorFormValues>({
    resolver: zodResolver(investorSchema),
  });

  const submitToBackend = async (payload: any) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-fingerprint": getDeviceFingerprint()
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }
      
      alert("Registration successful! Please login.");
      router.push("/login");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onStartupSubmit = (data: StartupFormValues) => {
    submitToBackend({
      email: data.email,
      password: data.password,
      full_name: data.companyName, // Map companyName to full_name for backend
      role: "startup"
    });
  };

  const onInvestorSubmit = (data: InvestorFormValues) => {
    submitToBackend({
      email: data.email,
      password: data.password,
      full_name: data.fullName,
      role: "investor"
    });
  };

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

      {errorMsg && (
        <div className="mb-6 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={startupForm.handleSubmit(onStartupSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Company Name <span className="text-red-500">*</span></label>
            <input maxLength={60} {...startupForm.register("companyName")} type="text" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="Axiom Corp" />
            {startupForm.formState.errors.companyName && <p className="text-red-500 text-xs mt-1">{startupForm.formState.errors.companyName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Industry / Sector <span className="text-red-500">*</span></label>
            <select {...startupForm.register("industry")} defaultValue="" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]">
              <option value="" disabled>Select an industry...</option>
              <option value="fintech">FinTech</option>
              <option value="healthtech">HealthTech</option>
              <option value="saas">Enterprise SaaS</option>
              <option value="ai">Artificial Intelligence</option>
              <option value="cleantech">CleanTech</option>
            </select>
            {startupForm.formState.errors.industry && <p className="text-red-500 text-xs mt-1">{startupForm.formState.errors.industry.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Current Stage <span className="text-red-500">*</span></label>
            <select {...startupForm.register("stage")} defaultValue="" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]">
              <option value="" disabled>Select funding stage...</option>
              <option value="pre-seed">Pre-Seed</option>
              <option value="seed">Seed</option>
              <option value="series-a">Series A</option>
              <option value="series-b">Series B+</option>
            </select>
            {startupForm.formState.errors.stage && <p className="text-red-500 text-xs mt-1">{startupForm.formState.errors.stage.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Annual Revenue (ARR)</label>
            <input 
              maxLength={20} 
              {...startupForm.register("revenue")} 
              onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, ''); }}
              type="text" 
              className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" 
              placeholder="500000" 
            />
            {startupForm.formState.errors.revenue && <p className="text-red-500 text-xs mt-1">{startupForm.formState.errors.revenue.message}</p>}
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-6">
          <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Account Credentials</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Founder Email <span className="text-red-500">*</span></label>
              <input maxLength={100} {...startupForm.register("email")} type="email" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="founder@company.com" />
              {startupForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{startupForm.formState.errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password <span className="text-red-500">*</span></label>
              <input maxLength={64} {...startupForm.register("password")} type="password" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="••••••••" />
              {startupForm.formState.errors.password && <p className="text-red-500 text-xs mt-1">{startupForm.formState.errors.password.message}</p>}
            </div>
          </div>
        </div>

        <button disabled={isSubmitting} type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-brand-emerald)] hover:bg-[var(--color-brand-emerald-hover)] transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
          {isSubmitting ? "Submitting..." : "Submit Application"}
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

      {errorMsg && (
        <div className="mb-6 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={investorForm.handleSubmit(onInvestorSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name <span className="text-red-500">*</span></label>
            <input maxLength={50} {...investorForm.register("fullName")} type="text" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="Jane Doe" />
            {investorForm.formState.errors.fullName && <p className="text-red-500 text-xs mt-1">{investorForm.formState.errors.fullName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Investment Firm <span className="text-red-500">*</span></label>
            <input maxLength={60} {...investorForm.register("firmName")} type="text" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="Quantum Capital" />
            {investorForm.formState.errors.firmName && <p className="text-red-500 text-xs mt-1">{investorForm.formState.errors.firmName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Preferred Ticket Size <span className="text-red-500">*</span></label>
            <select {...investorForm.register("ticketSize")} defaultValue="" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]">
              <option value="" disabled>Select ticket size...</option>
              <option value="micro">$50k - $250k</option>
              <option value="small">$250k - $1M</option>
              <option value="medium">$1M - $5M</option>
              <option value="large">$5M+</option>
            </select>
            {investorForm.formState.errors.ticketSize && <p className="text-red-500 text-xs mt-1">{investorForm.formState.errors.ticketSize.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Investment Focus (Comma separated)</label>
            <input maxLength={150} {...investorForm.register("focus")} type="text" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="FinTech, SaaS, AI" />
            {investorForm.formState.errors.focus && <p className="text-red-500 text-xs mt-1">{investorForm.formState.errors.focus.message}</p>}
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-6">
          <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Account Credentials</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Institutional Email <span className="text-red-500">*</span></label>
              <input maxLength={100} {...investorForm.register("email")} type="email" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="jane@quantum.com" />
              {investorForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{investorForm.formState.errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password <span className="text-red-500">*</span></label>
              <input maxLength={64} {...investorForm.register("password")} type="password" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="••••••••" />
              {investorForm.formState.errors.password && <p className="text-red-500 text-xs mt-1">{investorForm.formState.errors.password.message}</p>}
            </div>
          </div>
        </div>

        <button disabled={isSubmitting} type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-brand-emerald)] hover:bg-[var(--color-brand-emerald-hover)] transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
          {isSubmitting ? "Registering..." : "Complete Registration"}
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
