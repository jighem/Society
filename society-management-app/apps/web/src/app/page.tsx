import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col justify-between p-8 font-sans">
      <header className="max-w-5xl w-full mx-auto flex justify-between items-center py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold p-2.5 rounded-lg text-lg tracking-wider">
            CS
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Green Heights Co-op</h1>
            <p className="text-xs text-slate-400">Society Workspace Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs bg-emerald-500/10 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/20 font-medium">
            Multi-Platform Suite · Active
          </span>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto my-12 flex-1 flex flex-col justify-center">
        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-6">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
              Cooperative Housing <br />
              <span className="text-emerald-400">Society Management</span>
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              This Next.js web application handles portal administration, billing models, expense auditing, and resident ledgers concurrently with the companion Android Applet and NestJS API. Click below to enter the workspace dashboard.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/login"
                className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-sm py-3 px-6 rounded-xl transition-all shadow-lg active:scale-95"
              >
                Sign In to Portal
              </Link>
              
              <Link
                href="/dashboard"
                className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-extrabold text-sm py-3 px-6 rounded-xl transition-all active:scale-95"
              >
                Enter Sandbox Desk
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <span className="bg-slate-900/60 text-slate-300 px-3.5 py-1.5 rounded-lg text-xs border border-slate-800">TypeScript</span>
              <span className="bg-slate-900/60 text-slate-300 px-3.5 py-1.5 rounded-lg text-xs border border-slate-800">Tailwind CSS</span>
              <span className="bg-slate-900/60 text-slate-300 px-3.5 py-1.5 rounded-lg text-xs border border-slate-800">Next.js 14 App Router</span>
              <span className="bg-slate-900/60 text-slate-300 px-3.5 py-1.5 rounded-lg text-xs border border-slate-800">Prisma Seeded</span>
            </div>
          </div>

          <div className="md:col-span-5 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-semibold text-white text-base border-b border-slate-800 pb-2">Completed Phases & Modules</h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✔</span> Web/Browser Administration Portal Dashboard
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✔</span> Companion Android App Workspace Sync
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✔</span> Docker Sandbox with PostgreSQL & NestJS REST API
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✔</span> Real-time Monthly Invoice Calculator (fixed rate rules)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✔</span> Interactive Resident Complaint Ticketing Desk
              </li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="max-w-5xl w-full mx-auto text-center py-4 text-xs text-slate-500 border-t border-slate-800">
        © 2026 Housing Society Management Inc. All rights reserved. Configured for local development.
      </footer>
    </div>
  );
}
