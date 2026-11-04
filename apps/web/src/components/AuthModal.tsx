import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register, switchUser, user } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegisterMode) {
        const success = await register(email, username, password, name);
        if (success) {
          onClose();
        } else {
          setError('Registration failed. Username or email may already be taken.');
        }
      } else {
        const success = await login(username, password);
        if (success) {
          onClose();
        } else {
          setError('Invalid login credentials.');
        }
      }
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0E0F10] border border-[#242424] rounded-2xl shadow-2xl p-6 overflow-hidden">
        
        {/* Technical Corner Accents */}
        <span className="absolute top-2 left-2 text-[10px] font-mono text-neutral-600 select-none">+</span>
        <span className="absolute top-2 right-2 text-[10px] font-mono text-neutral-600 select-none">+</span>
        <span className="absolute bottom-2 left-2 text-[10px] font-mono text-neutral-600 select-none">+</span>
        <span className="absolute bottom-2 right-2 text-[10px] font-mono text-neutral-600 select-none">+</span>

        <div className="flex items-center justify-between pb-4 border-b border-[#242424]">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-[#09AE5B]/20 border border-[#09AE5B]/30 flex items-center justify-center text-[#09AE5B]">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">
                {isRegisterMode ? 'Create DevOrbit Account' : 'Sign in to DevOrbit'}
              </h2>
              <p className="text-xs text-neutral-400">Multi-User Developer Intelligence OS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/[0.05] text-neutral-400 hover:text-white transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Demo Fast Account Switching Section */}
        <div className="mt-4 p-3 rounded-xl bg-[#181819] border border-[#242424]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold mb-2">
            Instant Demo Account Switching
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={async () => {
                await switchUser('alex_developer');
                onClose();
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] transition-colors text-left"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=faces"
                alt="Alex"
                className="size-6 rounded-full"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">Alex Rivera</div>
                <div className="text-[10px] text-emerald-400 font-mono">Full-Stack / Admin</div>
              </div>
            </button>

            <button
              type="button"
              onClick={async () => {
                await switchUser('sara_chen');
                onClose();
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-[#242424] hover:bg-[#2e2e2e] transition-colors text-left"
            >
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop&crop=faces"
                alt="Sara"
                className="size-6 rounded-full"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">Sara Chen</div>
                <div className="text-[10px] text-cyan-400 font-mono">Systems / Rust</div>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3 py-2 rounded-lg bg-[#181819] border border-[#242424] text-white text-sm focus:outline-none focus:border-[#09AE5B]"
              />
            </div>
          )}

          {isRegisterMode && (
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#181819] border border-[#242424] text-white text-sm focus:outline-none focus:border-[#09AE5B]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              {isRegisterMode ? 'Username' : 'Username or Email'}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 size-4 text-neutral-500" />
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={isRegisterMode ? 'jane_developer' : 'alex_developer'}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#181819] border border-[#242424] text-white text-sm focus:outline-none focus:border-[#09AE5B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-neutral-500" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#181819] border border-[#242424] text-white text-sm focus:outline-none focus:border-[#09AE5B]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-lg bg-[#09AE5B] hover:bg-[#078F4A] text-white font-semibold text-sm transition-colors shadow-lg shadow-[#09AE5B]/20 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isRegisterMode ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError(null);
            }}
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            {isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}
