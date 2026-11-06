import React, { useState } from 'react';
import { 
  ArrowRight, 
  Lock, 
  User, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { DevOrbitLogo } from '../components/DevOrbitLogo.js';
import { useAuth } from '../context/AuthContext.js';

interface LoginPageProps {
  onNavigate: (route: string) => void;
  onSuccess?: () => void;
}

export function LoginPage({ onNavigate, onSuccess }: LoginPageProps) {
  const { login, demoLogin, authError } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!usernameOrEmail.trim() || !password) {
      setError('Please provide both username/email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(usernameOrEmail.trim(), password);
      if (result.ok) {
        if (onSuccess) onSuccess();
        else onNavigate('dashboard');
      } else {
        setError(result.error || authError || 'Invalid username or password. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await demoLogin();
      if (result.ok) {
        if (onSuccess) onSuccess();
        else onNavigate('dashboard');
      } else {
        setError(result.error || authError || 'Could not initialize demo session.');
      }
    } catch (err: any) {
      setError('Failed to log in to demo mode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0E121B] flex flex-col justify-between selection:bg-[#8B5CF6]/20 font-sans">
      
      {/* Top Header */}
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <button 
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 focus:outline-none"
          >
            <DevOrbitLogo variant="light" size="md" showBadge={false} />
          </button>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-[#64748B] hidden sm:inline">Don't have an account?</span>
            <button
              onClick={() => onNavigate('register')}
              className="font-semibold text-[#8B5CF6] hover:text-[#7C3AED] transition-colors"
            >
              Get started →
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 sm:p-8 space-y-6">
          
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[#0E121B]">
              Sign in to DevOrbit
            </h1>
            <p className="text-xs text-[#64748B]">
              Access your local-first developer intelligence workspace.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs flex items-center gap-2.5">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0E121B] block">
                Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="username or email"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#0E121B] placeholder-[#94A3B8] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all pl-9"
                />
                <User className="size-4 text-[#94A3B8] absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#0E121B] block">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#0E121B] placeholder-[#94A3B8] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all pl-9 pr-9"
                />
                <Lock className="size-4 text-[#94A3B8] absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#94A3B8] hover:text-[#0E121B]"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#0E121B] hover:bg-[#1F2430] text-white text-xs font-bold transition-all shadow-sm active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Fast Demo Mode Button (only visible if explicitly enabled via VITE_ENABLE_DEMO) */}
          {import.meta.env.VITE_ENABLE_DEMO === 'true' && (
            <>
              <div className="relative flex items-center justify-center">
                <div className="border-t border-[#E2E8F0] w-full" />
                <span className="bg-white px-3 text-[11px] font-mono uppercase text-[#94A3B8] shrink-0">
                  OR EXPLORE OFFLINE
                </span>
              </div>

              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={loading}
                className="w-full py-2.5 px-3 rounded-xl bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 text-[#8B5CF6] text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="size-3.5 text-[#8B5CF6]" />
                <span>Launch Sandbox Session (Test Fixture)</span>
              </button>
            </>
          )}

          <div className="text-center pt-2">
            <button
              onClick={() => onNavigate('landing')}
              className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0E121B] transition-colors"
            >
              <ArrowLeft className="size-3" />
              <span>Back to DevOrbit Home</span>
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-[#94A3B8] border-t border-[#E2E8F0] bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DevOrbit Local-first Architecture • 100% Offline SQLite</span>
          <span>© 2026 DevOrbit. All rights reserved.</span>
        </div>
      </footer>

    </div>
  );
}
