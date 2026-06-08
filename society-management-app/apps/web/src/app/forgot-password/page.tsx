'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !email.includes('@')) {
      setError('Please provide a valid registered email address.');
      return;
    }
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Reset Your Access Credential
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Enter your registered email address to receive secure OTP verification logs
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0f172a] py-8 px-4 border border-slate-800 shadow-2xl rounded-2xl sm:px-10 space-y-6">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-900/60 block w-full pl-10 pr-3 py-3 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm transition-all"
                    placeholder="name@society.com"
                  />
                </div>
                {error && (
                  <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 text-red-500" /> {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] transition-all focus:outline-none"
              >
                Send Password Reset link
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Reset Link Dispatched</h3>
              <p className="text-sm text-slate-400">
                A verification token code hash was transmitted to <span className="text-emerald-400 font-semibold">{email}</span>. Please verify your spam box if it doesn't arrive within 2 minutes.
              </p>
              <div className="pt-2">
                <Link
                  href="/reset-password"
                  className="text-xs text-emerald-400 hover:underline font-semibold block mb-2"
                >
                  Proceed with security Reset Token ->
                </Link>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800/80 flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
