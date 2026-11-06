import React from 'react';
import { Compass, ArrowLeft, Home } from 'lucide-react';
import { DevOrbitLogo } from '../components/DevOrbitLogo.js';

interface NotFoundPageProps {
  onNavigate?: (path: string) => void;
}

export function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  const handleGoHome = () => {
    if (onNavigate) {
      onNavigate('/');
    } else {
      window.location.href = '/';
    }
  };

  const handleGoApp = () => {
    if (onNavigate) {
      onNavigate('/app');
    } else {
      window.location.href = '/app';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#8B5CF6]/20 font-sans p-6">
      {/* Top Bar */}
      <header className="flex items-center justify-between max-w-5xl mx-auto w-full pt-4">
        <DevOrbitLogo size="sm" showBadge />
        <button
          onClick={handleGoHome}
          className="flex items-center gap-2 text-xs font-medium text-[#C5C8D0] hover:text-white transition-colors"
        >
          <Home className="size-4 text-[#8B5CF6]" />
          <span>DevOrbit Home</span>
        </button>
      </header>

      {/* Main 404 Card */}
      <main className="max-w-md mx-auto w-full my-auto text-center space-y-6 py-12">
        <div className="size-16 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center mx-auto text-[#8B5CF6]">
          <Compass className="size-8 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8B5CF6]">404 Not Found</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#F8FAFC] font-display">
            Page Outside Orbit
          </h1>
          <p className="text-sm text-[#C5C8D0] leading-relaxed max-w-sm mx-auto">
            The requested route does not exist or may have been relocated in the DevOrbit workspace architecture.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleGoApp}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#A78BFA] text-white text-xs font-semibold transition-colors shadow-lg shadow-[#8B5CF6]/20"
          >
            Go to Command Center
          </button>
          <button
            onClick={handleGoHome}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#12151D] hover:bg-[#181C26] border border-[#1F2430] text-[#C5C8D0] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            <span>Public Home</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[#686D79] py-4">
        DevOrbit Developer Intelligence OS • Local-first Architecture
      </footer>
    </div>
  );
}
export default NotFoundPage;
