import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { DevOrbitLogo } from './DevOrbitLogo.js';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#12151D] border border-[#1F2430] rounded-2xl shadow-2xl shadow-black/90 p-6 overflow-hidden">
        
        {/* Subtle Violet Accent Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-[#1F2430]">
          <div className="flex items-center gap-2">
            <DevOrbitLogo size="sm" showBadge={false} />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#181C26] text-[#686D79] hover:text-[#F8FAFC] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4">
          <h2 className="text-base font-bold text-[#F8FAFC] font-display">
            {isRegisterMode ? 'Create DevOrbit Account' : 'Authenticate Session'}
          </h2>
          <p className="text-xs text-[#686D79]">Local-first Multi-User Developer Intelligence OS</p>
        </div>

        {/* Demo Fast Account Switching Section */}
        <div className="mt-4 p-3 rounded-xl bg-[#0B0D12] border border-[#1F2430]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#686D79] font-semibold mb-2">
            Instant Identity Switch
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={async () => {
                await switchUser('alex_developer');
                onClose();
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] hover:border-[#8B5CF6]/40 transition-all text-left group"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=faces"
                alt="Alex"
                className="size-6 rounded-full border border-[#8B5CF6]/40"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-[#F8FAFC] truncate group-hover:text-[#A78BFA] transition-colors">Alex Rivera</div>
                <div className="text-[10px] text-[#A78BFA] font-mono">Full-Stack Admin</div>
              </div>
            </button>

            <button
              type="button"
              onClick={async () => {
                await switchUser('sara_chen');
                onClose();
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-[#181C26] hover:bg-[#202431] border border-[#1F2430] hover:border-[#8B5CF6]/40 transition-all text-left group"
            >
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&h=60&fit=crop&crop=faces"
                alt="Sara"
                className="size-6 rounded-full border border-[#60A5FA]/40"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-[#F8FAFC] truncate group-hover:text-[#60A5FA] transition-colors">Sara Chen</div>
                <div className="text-[10px] text-[#60A5FA] font-mono">Systems / Rust</div>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-medium text-[#C5C8D0] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Elena Rostova"
                className="w-full px-3 py-2 rounded-lg bg-[#181C26] border border-[#1F2430] text-[#F8FAFC] text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>
          )}

          {isRegisterMode && (
            <div>
              <label className="block text-xs font-medium text-[#C5C8D0] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-[#686D79]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="developer@devorbit.local"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#181C26] border border-[#1F2430] text-[#F8FAFC] text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#C5C8D0] mb-1">
              {isRegisterMode ? 'Username' : 'Username or Email'}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 size-4 text-[#686D79]" />
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={isRegisterMode ? 'elena_vanguard' : 'alex_developer'}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#181C26] border border-[#1F2430] text-[#F8FAFC] text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#C5C8D0] mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-[#686D79]" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#181C26] border border-[#1F2430] text-[#F8FAFC] text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-lg bg-[#8B5CF6] hover:bg-[#A78BFA] text-white font-semibold text-sm transition-all shadow-sm shadow-[#8B5CF6]/20 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <span>{loading ? 'Authenticating...' : isRegisterMode ? 'Create Identity' : 'Sign In'}</span>
            <ArrowRight className="size-4" />
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError(null);
            }}
            className="text-xs text-[#686D79] hover:text-[#F8FAFC] transition-colors"
          >
            {isRegisterMode ? 'Already have an account? Sign in' : "New to DevOrbit? Create an isolated account"}
          </button>
        </div>
      </div>
    </div>
  );
}
