'use client';

import React, { useState } from 'react';
import { KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length >= 6 && token) {
      setIsSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Establish New Password
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Enter your recovery verification token code along with your new secret credentials
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0f172a] py-8 px-4 border border-slate-800 shadow-2xl rounded-2xl sm:px-10 space-y-6">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Verification Token OTP
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 948120"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="bg-slate-900/60 block w-full px-3 py-3 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm transition-all text-center tracking-widest font-mono text-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  New Secret Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-900/60 block w-full pl-10 pr-3 py-3 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] transition-all focus:outline-none"
              >
                Apply credentials reset
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Reset Completed</h3>
              <p className="text-sm text-slate-400">
                Your credentials are successfully updated in database. You may now utilize the new criteria to safely access your portal.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 rounded-lg bg-emerald-400 text-slate-950 text-sm font-bold hover:bg-emerald-300 transition-all font-sans"
                >
                  Return to Sign In <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
