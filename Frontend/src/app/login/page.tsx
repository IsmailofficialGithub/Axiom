"use client"

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").max(100, "Email cannot exceed 100 characters"),
  password: z.string().min(1, "Password is required").max(64, "Password cannot exceed 64 characters"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const getDeviceFingerprint = () => {
  if (typeof window === "undefined") return "unknown";
  return btoa(navigator.userAgent + window.screen.width + window.screen.height).substring(0, 32);
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-fingerprint": getDeviceFingerprint()
        },
        body: JSON.stringify(data)
      });
      
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Login failed");
      }
      
      // Save auth state
      login(resData.access_token, resData.user);
      
      toast.success("Login successful!");
      router.push(`/${resData.user.role}/dashboard`);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row flex-1 min-h-[calc(100vh-64px)]">
      {/* Left Form Section */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-[480px] xl:w-[560px] lg:px-20 xl:px-24 bg-[var(--card-bg)] border-r border-slate-200 dark:border-slate-800">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-[var(--color-brand-emerald)] transition-colors mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Access your institutional dashboard.
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Institutional Email <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    {...register("email")}
                    id="email"
                    type="email"
                    maxLength={100}
                    autoComplete="email"
                    className="block w-full appearance-none rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 placeholder-slate-400 focus:border-[var(--color-brand-emerald)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-emerald)] sm:text-sm"
                    placeholder="example@quantum.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    {...register("password")}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    maxLength={64}
                    autoComplete="current-password"
                    className="block w-full appearance-none rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 pr-10 placeholder-slate-400 focus:border-[var(--color-brand-emerald)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-emerald)] sm:text-sm"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </div>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-[var(--color-brand-emerald)] focus:ring-[var(--color-brand-emerald)] bg-transparent accent-[var(--color-brand-emerald)]"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 dark:text-slate-400">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-[var(--color-brand-emerald)] hover:text-[var(--color-brand-emerald-hover)]">
                    Forgot password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full justify-center rounded-md border border-transparent bg-[var(--color-brand-emerald)] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-brand-emerald-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-emerald)] focus:ring-offset-2 dark:focus:ring-offset-slate-900 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Graphic Section */}
      <div className="hidden lg:flex relative flex-1 bg-[var(--background)] items-center justify-center p-12">
        <div className="w-full h-full max-w-2xl max-h-[600px] border border-slate-200 dark:border-slate-800 rounded-2xl bg-[var(--card-bg)] shadow-2xl overflow-hidden relative flex items-center justify-center">
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-[var(--color-brand-emerald)] rounded-full opacity-20 animate-pulse" style={{ animationDuration: '4s' }}></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-[var(--color-brand-emerald)] rounded-full opacity-10 animate-pulse" style={{ animationDuration: '6s' }}></div>
           <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent"></div>
           <div className="relative z-10 flex flex-col items-center max-w-sm text-center px-6">
             <img 
               src="/logo-light-theme.png" 
               alt="Axiomra Logo" 
               className="w-[280px] h-auto drop-shadow-[0_0_20px_rgba(0,209,209,0.15)] transition-transform duration-700 hover:scale-105 block dark:hidden" 
             />
             <img 
               src="/logo-dark-theme.png" 
               alt="Axiomra Logo" 
               className="w-[280px] h-auto drop-shadow-[0_0_20px_rgba(0,209,209,0.25)] transition-transform duration-700 hover:scale-105 hidden dark:block" 
             />
             <p className="text-slate-400 text-sm mt-6 font-light tracking-wide leading-relaxed">
               Connecting institutional scale capital with next-generation growth enterprises.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
