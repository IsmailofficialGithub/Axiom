import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
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
            <form action="#" method="POST" className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Institutional Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full appearance-none rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 placeholder-slate-400 focus:border-[var(--color-brand-emerald)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-emerald)] sm:text-sm"
                    placeholder="example@quantum.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full appearance-none rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 placeholder-slate-400 focus:border-[var(--color-brand-emerald)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-emerald)] sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
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
                  className="flex w-full justify-center rounded-md border border-transparent bg-[var(--color-brand-emerald)] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[var(--color-brand-emerald-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-emerald)] focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Graphic Section */}
      <div className="hidden lg:flex relative flex-1 bg-[var(--background)] items-center justify-center p-12">
        <div className="w-full h-full max-w-2xl max-h-[600px] border border-slate-200 dark:border-slate-800 rounded-2xl bg-[var(--card-bg)] shadow-2xl overflow-hidden relative opacity-60 flex items-center justify-center">
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-[var(--color-brand-emerald)] rounded-full opacity-20"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-[var(--color-brand-emerald)] rounded-full opacity-10"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
