import Link from "next/link";
import { ArrowLeft, Rocket, Briefcase } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[var(--background)] min-h-[calc(100vh-64px)]">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-[var(--color-brand-emerald)] transition-colors mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        <h2 className="text-center text-3xl font-extrabold tracking-tight">Create your account</h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Join Axiom to connect with the future of capital.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-[var(--card-bg)] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200 dark:border-slate-800">
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Startup Card */}
            <div className="border-2 border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-[var(--color-brand-emerald)] dark:hover:border-[var(--color-brand-emerald)] transition-colors relative group">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white group-hover:bg-[var(--color-brand-emerald)] group-hover:text-white transition-colors">
                  <Rocket className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">STARTUP</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Apply as an innovative company seeking institutional investment.
              </p>
              
              <form action="#" method="POST" className="space-y-4">
                <div>
                  <label htmlFor="company-name" className="sr-only">Company Name</label>
                  <input
                    id="company-name"
                    name="company-name"
                    type="text"
                    required
                    className="block w-full appearance-none rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 placeholder-slate-400 focus:border-[var(--color-brand-emerald)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-emerald)] sm:text-sm"
                    placeholder="Company Name"
                  />
                </div>
                <div>
                  <label htmlFor="startup-email" className="sr-only">Founder Email</label>
                  <input
                    id="startup-email"
                    name="email"
                    type="email"
                    required
                    className="block w-full appearance-none rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 placeholder-slate-400 focus:border-[var(--color-brand-emerald)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-emerald)] sm:text-sm"
                    placeholder="Founder Email"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-offset-slate-900 transition-colors"
                >
                  Continue as Startup
                </button>
              </form>
            </div>

            {/* Investor Card */}
            <div className="border-2 border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-[var(--color-brand-emerald)] dark:hover:border-[var(--color-brand-emerald)] transition-colors relative group">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white group-hover:bg-[var(--color-brand-emerald)] group-hover:text-white transition-colors">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">INVESTOR</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Join as an institutional or accredited investor to access deals.
              </p>
              
              <form action="#" method="POST" className="space-y-4">
                <div>
                  <label htmlFor="investor-name" className="sr-only">Full Name</label>
                  <input
                    id="investor-name"
                    name="name"
                    type="text"
                    required
                    className="block w-full appearance-none rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 placeholder-slate-400 focus:border-[var(--color-brand-emerald)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-emerald)] sm:text-sm"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label htmlFor="investor-email" className="sr-only">Institutional Email</label>
                  <input
                    id="investor-email"
                    name="email"
                    type="email"
                    required
                    className="block w-full appearance-none rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 placeholder-slate-400 focus:border-[var(--color-brand-emerald)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-emerald)] sm:text-sm"
                    placeholder="Institutional Email"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-brand-emerald)] hover:bg-[var(--color-brand-emerald-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-emerald)] dark:focus:ring-offset-slate-900 transition-colors"
                >
                  Continue as Investor
                </button>
              </form>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-slate-500">
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
    </div>
  );
}
