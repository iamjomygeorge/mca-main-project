"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const isAuthorSignUp = role === 'author';

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const userData = {
      fullName,
      email,
      password,
      role: isAuthorSignUp ? 'AUTHOR' : 'READER',
      ...(isAuthorSignUp && { username }),
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const firstError = errorData.errors[0];
        const errorMessage = Object.values(firstError)[0];
        throw new Error(errorMessage);
      }
      
      router.push('/login');

    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <h2 className="text-center text-3xl font-bold tracking-tight">
          {isAuthorSignUp ? 'Create an Author Account' : 'Create an Account'}
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Or{' '}
          <Link href="/login" className="font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300">
            log in to your existing account
          </Link>
        </p>
      </div>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && <p className="text-center text-sm text-red-500">{error}</p>}
        
        <div>
          <label htmlFor="full-name" className="block text-sm font-medium">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input id="full-name" name="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="block w-full appearance-none rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"/>
          </div>
        </div>

        {isAuthorSignUp && (
          <div>
            <label htmlFor="username" className="block text-sm font-medium">
              Username <span className="text-red-500">*</span>
            </label>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">This will be your unique, public handle (e.g., @johndoe).</p>
            <div className="mt-1">
              <input id="username" name="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="block w-full appearance-none rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"/>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="email-address" className="block text-sm font-medium">
            Email address <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input id="email-address" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className="block w-full appearance-none rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"/>
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative">
            <input 
              id="password" 
              name="password" 
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              autoComplete="new-password" 
              required 
              className="block w-full appearance-none rounded-md border border-zinc-300 bg-zinc-50 py-2 pl-3 pr-10 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute inset-y-0 right-0 z-20 flex items-center px-3 text-zinc-500 hover:text-zinc-700"
            >
              {/* SVG icon for password visibility toggle */}
            </button>
          </div>
        </div>

        <div>
          <button type="submit" className="flex w-full justify-center rounded-md border border-transparent bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
            {isAuthorSignUp ? 'Create Author Account' : 'Sign Up'}
          </button>
        </div>
      </form>
    </div>
  );
}