"use client"

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Rocket, Briefcase, Eye, EyeOff, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// =======================
// SCHEMAS
// =======================
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

// Step 1-4 fields
const startupSchema = z.object({
  // Step 1: Core Identity
  companyName: companySchema,
  industry: z.string().min(1, "Please select an industry"),
  stage: z.string().min(1, "Please select a funding stage"),
  email: z.string().email("Invalid email address").max(100, "Email cannot exceed 100 characters"),
  password: passwordSchema,
  // Step 2: Financials
  currentArr: z.string().max(20).optional(),
  lastYearRevenue: z.string().max(20).optional(),
  revenueModel: z.string().max(500).optional(),
  // Step 3: Funding Requirements
  fundingSought: z.string().max(20).optional(),
  primaryUseOfFunds: z.string().max(500).optional(),
  previousFunding: z.string().max(20).optional(),
  // Step 4: Custom Q&A
  customQa: z.array(z.object({
    key: z.string().min(1, "Question cannot be empty"),
    value: z.string().min(1, "Answer cannot be empty")
  })).optional()
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

// =======================
// MAIN COMPONENT
// =======================
export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"startup" | "investor" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const startupForm = useForm<StartupFormValues>({
    resolver: zodResolver(startupSchema),
    mode: "onTouched",
    defaultValues: {
      customQa: [] // initialize empty array for field array
    }
  });

  const { fields: qaFields, append: appendQa, remove: removeQa } = useFieldArray({
    control: startupForm.control,
    name: "customQa"
  });

  const investorForm = useForm<InvestorFormValues>({
    resolver: zodResolver(investorSchema),
  });

  const submitToBackend = async (payload: any) => {
    setIsSubmitting(true);
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
      
      toast.success("Registration successful! Please login.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert string numbers to strict numeric for backend
  const parseNumeric = (val: string | undefined) => val ? Number(val) : undefined;

  const onStartupSubmit = (data: StartupFormValues) => {
    // Format custom QA array into an object/record
    const formattedQa: Record<string, string> = {};
    if (data.customQa) {
      data.customQa.forEach(item => {
        formattedQa[item.key] = item.value;
      });
    }

    const payload = {
      email: data.email,
      password: data.password,
      full_name: data.companyName,
      role: "startup",
      startup_profile: {
        industry: data.industry,
        stage: data.stage,
        current_arr: parseNumeric(data.currentArr),
        last_year_revenue: parseNumeric(data.lastYearRevenue),
        revenue_model: data.revenueModel,
        funding_sought: parseNumeric(data.fundingSought),
        primary_use_of_funds: data.primaryUseOfFunds,
        previous_funding: parseNumeric(data.previousFunding),
        custom_qa: formattedQa
      }
    };
    submitToBackend(payload);
  };

  const onInvestorSubmit = (data: InvestorFormValues) => {
    submitToBackend({
      email: data.email,
      password: data.password,
      full_name: data.fullName,
      role: "investor"
    });
  };

  // Step validation
  const handleNextStep = async () => {
    let fieldsToValidate: any = [];
    if (currentStep === 1) {
      fieldsToValidate = ['companyName', 'industry', 'stage', 'email', 'password'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['currentArr', 'lastYearRevenue', 'revenueModel'];
    } else if (currentStep === 3) {
      fieldsToValidate = ['fundingSought', 'primaryUseOfFunds', 'previousFunding'];
    }

    const isValid = await startupForm.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => setCurrentStep(prev => prev - 1);

  // =======================
  // RENDERERS
  // =======================
  const renderRoleSelection = () => (
    <div className="grid md:grid-cols-2 gap-8">
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

  const renderStartupForm = () => {
    const { register, formState: { errors } } = startupForm;

    return (
      <div className="bg-[var(--card-bg)] py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header & Role Switcher */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-brand-emerald)] text-white">
              <Rocket className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold">Startup Application</h3>
          </div>
          <button onClick={() => {setRole(null); setCurrentStep(1);}} className="text-sm font-medium text-slate-500 hover:text-[var(--color-brand-emerald)] transition-colors">
            Change Role
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 relative">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-200 dark:bg-slate-800">
            <div style={{ width: `${(currentStep / totalSteps) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[var(--color-brand-emerald)] transition-all duration-300"></div>
          </div>
          <div className="flex justify-between text-xs font-medium text-slate-500">
            <span className={currentStep >= 1 ? "text-[var(--color-brand-emerald)]" : ""}>Identity</span>
            <span className={currentStep >= 2 ? "text-[var(--color-brand-emerald)]" : ""}>Financials</span>
            <span className={currentStep >= 3 ? "text-[var(--color-brand-emerald)]" : ""}>Funding</span>
            <span className={currentStep >= 4 ? "text-[var(--color-brand-emerald)]" : ""}>Public Info</span>
          </div>
        </div>

        <form onSubmit={startupForm.handleSubmit(onStartupSubmit)} className="space-y-6">
          
          {/* STEP 1 */}
          <div className={currentStep === 1 ? "block animate-in fade-in duration-300" : "hidden"}>
            <h4 className="text-lg font-semibold mb-6">1. Core Identity & Credentials</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name <span className="text-red-500">*</span></label>
                <input maxLength={60} {...register("companyName")} type="text" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="Axiomra Corp" />
                {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Industry / Sector <span className="text-red-500">*</span></label>
                <select {...register("industry")} defaultValue="" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]">
                  <option value="" disabled>Select an industry...</option>
                  <option value="fintech">FinTech</option>
                  <option value="healthtech">HealthTech</option>
                  <option value="saas">Enterprise SaaS</option>
                  <option value="ai">Artificial Intelligence</option>
                  <option value="cleantech">CleanTech</option>
                  <option value="other">Other</option>
                </select>
                {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current Stage <span className="text-red-500">*</span></label>
                <select {...register("stage")} defaultValue="" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]">
                  <option value="" disabled>Select funding stage...</option>
                  <option value="pre-seed">Pre-Seed</option>
                  <option value="seed">Seed</option>
                  <option value="series-a">Series A</option>
                  <option value="series-b">Series B+</option>
                </select>
                {errors.stage && <p className="text-red-500 text-xs mt-1">{errors.stage.message}</p>}
              </div>
              <div className="col-span-1 md:col-span-2 border-t border-slate-200 dark:border-slate-800 pt-6 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Founder Email <span className="text-red-500">*</span></label>
                    <input maxLength={100} {...register("email")} type="email" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="founder@company.com" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password <span className="text-red-500">*</span></label>
                    <div className="relative rounded-md shadow-sm">
                      <input 
                        maxLength={64} 
                        {...register("password")} 
                        type={showPassword ? "text" : "password"} 
                        className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 pr-10 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" 
                        placeholder="••••••••" 
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </div>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className={currentStep === 2 ? "block animate-in fade-in duration-300" : "hidden"}>
            <h4 className="text-lg font-semibold mb-6">2. Financials & Revenue</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Current Annual Revenue (ARR)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 sm:text-sm">$</span>
                  </div>
                  <input maxLength={20} {...register("currentArr")} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, ''); }} type="text" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent pl-7 pr-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="500000" />
                </div>
                {errors.currentArr && <p className="text-red-500 text-xs mt-1">{errors.currentArr.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Year's Revenue</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 sm:text-sm">$</span>
                  </div>
                  <input maxLength={20} {...register("lastYearRevenue")} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, ''); }} type="text" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent pl-7 pr-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="150000" />
                </div>
                {errors.lastYearRevenue && <p className="text-red-500 text-xs mt-1">{errors.lastYearRevenue.message}</p>}
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium mb-1">Revenue Model / Earning Logic</label>
                <textarea rows={3} maxLength={500} {...register("revenueModel")} className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="B2B SaaS Subscription at $99/mo per seat..." />
                {errors.revenueModel && <p className="text-red-500 text-xs mt-1">{errors.revenueModel.message}</p>}
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className={currentStep === 3 ? "block animate-in fade-in duration-300" : "hidden"}>
            <h4 className="text-lg font-semibold mb-6">3. Funding Requirements</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Total Funding Sought</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 sm:text-sm">$</span>
                  </div>
                  <input maxLength={20} {...register("fundingSought")} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, ''); }} type="text" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent pl-7 pr-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="2000000" />
                </div>
                {errors.fundingSought && <p className="text-red-500 text-xs mt-1">{errors.fundingSought.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Previous Funding Raised</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 sm:text-sm">$</span>
                  </div>
                  <input maxLength={20} {...register("previousFunding")} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, ''); }} type="text" className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent pl-7 pr-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="500000" />
                </div>
                {errors.previousFunding && <p className="text-red-500 text-xs mt-1">{errors.previousFunding.message}</p>}
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium mb-1">Primary Use of Funds</label>
                <textarea rows={3} maxLength={500} {...register("primaryUseOfFunds")} className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" placeholder="60% R&D, 30% Go-to-Market, 10% Ops..." />
                {errors.primaryUseOfFunds && <p className="text-red-500 text-xs mt-1">{errors.primaryUseOfFunds.message}</p>}
              </div>
            </div>
          </div>

          {/* STEP 4 */}
          <div className={currentStep === 4 ? "block animate-in fade-in duration-300" : "hidden"}>
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold">4. Public Custom Q&A</h4>
              <button 
                type="button" 
                onClick={() => appendQa({ key: "", value: "" })}
                className="inline-flex items-center text-sm font-medium text-[var(--color-brand-emerald)] hover:text-[var(--color-brand-emerald-hover)]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Custom Question
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Add specific questions and answers you want investors to see (e.g. "What is our competitive advantage?").
            </p>
            
            <div className="space-y-4">
              {qaFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Question (Key)</label>
                      <input 
                        {...register(`customQa.${index}.key` as const)} 
                        className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" 
                        placeholder="e.g. Target Audience" 
                      />
                      {errors.customQa?.[index]?.key && <p className="text-red-500 text-xs mt-1">{errors.customQa[index]?.key?.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Answer (Value)</label>
                      <input 
                        {...register(`customQa.${index}.value` as const)} 
                        className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" 
                        placeholder="e.g. Gen-Z Retail Investors" 
                      />
                      {errors.customQa?.[index]?.value && <p className="text-red-500 text-xs mt-1">{errors.customQa[index]?.value?.message}</p>}
                    </div>
                  </div>
                  <button type="button" onClick={() => removeQa(index)} className="p-2 text-slate-400 hover:text-red-500 transition-colors mt-6">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {qaFields.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                  <p className="text-sm text-slate-500">No custom questions added yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Form Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 mt-8">
            {currentStep > 1 ? (
              <button type="button" onClick={handlePrevStep} className="px-6 py-2 border border-slate-300 dark:border-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Back
              </button>
            ) : <div></div>}
            
            {currentStep < totalSteps ? (
              <button type="button" onClick={handleNextStep} className="px-6 py-2 bg-[var(--color-brand-emerald)] text-white text-sm font-medium rounded-md hover:bg-[var(--color-brand-emerald-hover)] transition-colors">
                Continue
              </button>
            ) : (
              <button disabled={isSubmitting} type="submit" className="px-6 py-2 bg-[var(--color-brand-emerald)] text-white text-sm font-medium rounded-md hover:bg-[var(--color-brand-emerald-hover)] transition-colors disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center">
                {isSubmitting ? "Submitting..." : <><CheckCircle2 className="w-4 h-4 mr-2" /> Submit Application</>}
              </button>
            )}
          </div>

        </form>
      </div>
    );
  };

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
              <div className="relative rounded-md shadow-sm">
                <input 
                  maxLength={64} 
                  {...investorForm.register("password")} 
                  type={showPassword ? "text" : "password"} 
                  className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 pr-10 focus:border-[var(--color-brand-emerald)] focus:ring-1 focus:ring-[var(--color-brand-emerald)]" 
                  placeholder="••••••••" 
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </div>
              </div>
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
          Join Axiomra to connect with the future of capital.
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
