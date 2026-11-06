import React, { useState } from 'react';
import { 
  ArrowRight, 
  Lock, 
  User, 
  Mail, 
  ShieldCheck, 
  AlertCircle, 
  ArrowLeft,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { DevOrbitLogo } from '../components/DevOrbitLogo.js';
import { useAuth } from '../context/AuthContext.js';

interface RegisterPageProps {
  onNavigate: (route: string) => void;
  onSuccess?: () => void;
}

export function RegisterPage({ onNavigate, onSuccess }: RegisterPageProps) {
  const { register, authError } = useAuth();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !username.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const result = await register(email.trim(), username.trim(), password, name.trim());
      if (result.ok) {
        if (onSuccess) onSuccess();
        else onNavigate('dashboard');
      } else {
        setError(result.error || authError || 'Registration could not be completed. Please check your inputs.');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Username or email may already be registered.');
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
            <span className="text-[#64748B] hidden sm:inline">Already have an account?</span>
            <button
              onClick={() => onNavigate('login')}
              className="font-semibold text-[#8B5CF6] hover:text-[#7C3AED] transition-colors"
            >
              Sign in →
            </button>
          </div>
        </div>
      </header>

      {/* Main Registration Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 sm:p-8 space-y-6">
          
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[#0E121B]">
              Create your account
            </h1>
            <p className="text-xs text-[#64748B]">
              Start with only the profile information your workspace needs.
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
                Full Name (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Developer"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#0E121B] placeholder-[#94A3B8] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all pl-9"
                />
                <User className="size-4 text-[#94A3B8] absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0E121B] block">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#0E121B] placeholder-[#94A3B8] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all pl-9"
                />
                <Mail className="size-4 text-[#94A3B8] absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0E121B] block">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. janedev"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#0E121B] placeholder-[#94A3B8] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all pl-9"
                />
                <User className="size-4 text-[#94A3B8] absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0E121B] block">
                Password (min 8 characters)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-xs text-[#0E121B] placeholder-[#94A3B8] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all pl-9"
                />
                <Lock className="size-4 text-[#94A3B8] absolute left-3 top-3" />
              </div>
            </div>

            {/* Privacy highlights */}
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-[11px] text-[#64748B]">
              <div className="flex items-center gap-1.5 text-[#0E121B] font-medium">
                <ShieldCheck className="size-3.5 text-[#22C55E]" />
                <span>Local-first Security Guarantees</span>
              </div>
              <p>Account credentials are saved to your local SQLite database using bcrypt. No telemetry or cloud syncing.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#0E121B] hover:bg-[#1F2430] text-white text-xs font-bold transition-all shadow-sm active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>

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
