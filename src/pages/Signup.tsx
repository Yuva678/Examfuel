import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

const COLLEGES = ['Kishkinda University', 'Others'];

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [customCollege, setCustomCollege] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const selectedCollege = college === 'Others' ? customCollege.trim() : college;

    if (!selectedCollege) {
      setError('Please select your college.');
      setLoading(false);
      return;
    }
    
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          college: selectedCollege,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError('An account with this email already exists.');
    } else {
      setMessage('Signup successful! Check your email for the confirmation link.');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-transparent relative z-10">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-surface-100 p-8 shadow-soft border border-gold-border">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Or{' '}
            <Link to="/login" className="font-medium text-brand-400 hover:text-brand-300 underline transition-colors">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="rounded-xl bg-red-500/10 p-4 border border-red-500/20">
            <p className="text-sm text-red-400 text-center font-medium">{error}</p>
          </div>
        )}

        {message && (
          <div className="rounded-xl bg-green-500/10 p-4 border border-green-500/20">
            <p className="text-sm text-green-400 text-center font-medium">{message}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleEmailSignup}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full appearance-none rounded-xl border border-gold-border bg-black px-4 py-3 text-white placeholder-gray-500 focus:z-10 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:text-sm shadow-sm transition-all duration-200"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full appearance-none rounded-xl border border-gold-border bg-black px-4 py-3 text-white placeholder-gray-500 focus:z-10 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:text-sm shadow-sm transition-all duration-200"
                placeholder="Password (min 6 characters)"
              />
            </div>

            {/* College Dropdown */}
            <div className="relative">
              <label htmlFor="college" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
                College / University
              </label>
              <button
                type="button"
                id="college"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="relative flex w-full items-center justify-between rounded-xl border border-gold-border bg-black px-4 py-3 text-left focus:z-10 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:text-sm shadow-sm transition-all duration-200"
              >
                <span className={college ? 'text-white font-medium' : 'text-gray-500'}>
                  {college || 'Select your college'}
                </span>
                <ChevronDown className={`h-4 w-4 text-brand-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute left-0 right-0 mt-2 z-50 rounded-xl border border-gold-border/30 bg-[#111111]/95 backdrop-blur-xl shadow-2xl py-1 overflow-hidden">
                    {COLLEGES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCollege(c);
                          setDropdownOpen(false);
                          if (c !== 'Others') setCustomCollege('');
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                          college === c
                            ? 'text-brand-400 bg-brand-500/10 font-semibold'
                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Custom college input — shown when "Others" is selected */}
            {college === 'Others' && (
              <div>
                <input
                  type="text"
                  value={customCollege}
                  onChange={(e) => setCustomCollege(e.target.value)}
                  required
                  className="relative block w-full appearance-none rounded-xl border border-gold-border bg-black px-4 py-3 text-white placeholder-gray-500 focus:z-10 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 sm:text-sm shadow-sm transition-all duration-200"
                  placeholder="Enter your college name"
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3 text-sm font-bold text-black hover:shadow-gold focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] shadow-gold-soft"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
