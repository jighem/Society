'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginDtoInput } from '@society/shared';
import { KeyRound, Mail, AlertTriangle, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Setup React Hook Form with shared Zod validator payload
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginDtoInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginDtoInput) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Simulate/Trigger live connection to the backend REST endpoint
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccessMessage(`Welcome back, ${result.data.user.firstName}! Sign-in approved (Role: ${result.data.user.role}).`);
        // Store JWT credentials securely
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('refreshToken', result.data.refreshToken);
        localStorage.setItem('currentUser', JSON.stringify(result.data.user));
      } else {
        setErrorMessage(result.message || 'Login failed. Please inspect your email/password criteria.');
      }
    } catch (err) {
      // Offline fallback indicator for Phase 2 development evaluation
      console.warn('Network API fallback mode trigger:', err);
      // Fallback response for rapid mock trials
      if (data.email === 'superadmin@example.com' && data.password === 'Admin@123') {
        setSuccessMessage('Welcome back, Albus! (SaaS Dev Offline Validation Approved)');
        localStorage.setItem('accessToken', 'mock_super_access_token');
        localStorage.setItem('currentUser', JSON.stringify({ email: data.email, role: 'SUPER_ADMIN' }));
      } else {
        setErrorMessage('Unable to connect to NestJS. Make sure Docker PostgreSQL container is active at port 5432.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const autofillCredentials = (email: string, pass: string) => {
    setValue('email', email);
    setValue('password', pass);
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-xl">
          CS
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
          Access Member Workspace
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Housing Administration, Billing Audits & Resident Ledger
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0f172a] py-8 px-4 border border-slate-800 shadow-2xl rounded-2xl sm:px-10 space-y-6">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Email field */}
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
                  {...register('email')}
                  className="bg-slate-900/60 block w-full pl-10 pr-3 py-3 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm transition-all"
                  placeholder="name@society.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="h-4.5 w-4.5" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  className="bg-slate-900/60 block w-full pl-10 pr-3 py-3 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {errors.password.message}
                </p>
              )}
            </div>

            {/* Feedback Banners */}
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-300 flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-xs text-emerald-300 flex gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? 'Verifying Credentials...' : 'Sign In Now'}
              </button>
            </div>
          </form>

          {/* Quick Sandbox Seeder helper widgets */}
          <div className="border-t border-slate-800 pt-6">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Developer Quick Entry Accounts
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                onClick={() => autofillCredentials('superadmin@example.com', 'Admin@123')}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 p-2.5 rounded-lg border border-slate-800 text-left hover:border-slate-700 transition-all flex items-center gap-1.5"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">Super Admin</div>
                  <div className="text-slate-500">superadmin@example.com</div>
                </div>
              </button>
              <button
                onClick={() => autofillCredentials('admin@society.com', 'Admin@123')}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 p-2.5 rounded-lg border border-slate-800 text-left hover:border-slate-700 transition-all flex items-center gap-1.5"
              >
                <UserCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">Society Admin</div>
                  <div className="text-slate-500">admin@society.com</div>
                </div>
              </button>
              <button
                onClick={() => autofillCredentials('owner@example.com', 'Owner@123')}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 p-2.5 rounded-lg border border-slate-800 text-left hover:border-slate-700 transition-all flex items-center gap-1.5"
              >
                <UserCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">Owner User</div>
                  <div className="text-slate-500">owner@example.com</div>
                </div>
              </button>
              <button
                onClick={() => autofillCredentials('tenant@example.com', 'Tenant@123')}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 p-2.5 rounded-lg border border-slate-800 text-left hover:border-slate-700 transition-all flex items-center gap-1.5"
              >
                <UserCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-slate-200">Tenant User</div>
                  <div className="text-slate-500">tenant@example.com</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
