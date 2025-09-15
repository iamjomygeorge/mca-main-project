"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log in');
      }

      const data = await response.json();
      login(data.token);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Log in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Or{' '}
          <Link href="/register" className="font-medium text-sky-600 hover:text-sky-500">
            create a new account
          </Link>
        </p>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && <p className="text-center text-sm text-red-500">{error}</p>}
        <div>
          <label htmlFor="email-address" className="block text-sm font-medium">
            Email address <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input id="email-address" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="block w-full appearance-none rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"/>
          </div>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="block w-full appearance-none rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"/>
          </div>
        </div>
        <div>
          <button type="submit" className="flex w-full justify-center rounded-md border border-transparent bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
            Log In
          </button>
        </div>
      </form>
    </div>
  );
}