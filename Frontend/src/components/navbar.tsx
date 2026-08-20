"use client"

import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"

import { useAuth } from "@/contexts/AuthContext"

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-[var(--background)]/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight">AXIOM <span className="text-[var(--color-brand-emerald)]">//</span></span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <Link href="/opportunities" className="transition-colors hover:text-[var(--color-brand-emerald)]">Opportunities</Link>
            <Link href="/network" className="transition-colors hover:text-[var(--color-brand-emerald)]">Network</Link>
            <Link href="/insights" className="transition-colors hover:text-[var(--color-brand-emerald)]">Insights</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {!user && (
            <>
              <Link href="/login" className="text-sm font-medium hover:text-[var(--color-brand-emerald)] transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-md bg-[var(--color-brand-emerald)] px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-[var(--color-brand-emerald-hover)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-brand-emerald)]">
                Request Access
              </Link>
            </>
          )}
          {user && (
            <Link href="/dashboard" className="text-sm font-medium hover:text-[var(--color-brand-emerald)] transition-colors">
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
