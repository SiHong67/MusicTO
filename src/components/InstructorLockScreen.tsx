import React, { useState } from 'react';
import {
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Volume2,
  Sun,
  Moon,
} from 'lucide-react';
import { StationId, ThemePreference } from '../types';

interface InstructorLockScreenProps {
  onUnlock: (department: StationId | 'general') => void;
  theme: ThemePreference;
  onToggleTheme: () => void;
}

export const InstructorLockScreen: React.FC<InstructorLockScreenProps> = ({
  onUnlock,
  theme,
  onToggleTheme,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Strict password verification: 'musicto123'
    if (password === 'musicto123') {
      onUnlock('general');
    } else {
      setErrorMessage('Incorrect password');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200">
      {/* Top Header Bar */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            <Volume2 className="w-5 h-5" />
          </div>
          <span className="text-base font-bold tracking-tight uppercase dark:text-white text-slate-900">
            MusicTO
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button
          id="btn-lockscreen-theme-toggle"
          type="button"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12121A] text-slate-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white transition-all shadow-sm text-xs font-mono"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dark</span>
            </>
          )}
        </button>
      </div>

      {/* Main Center Password Card */}
      <div className="w-full max-w-sm mx-auto my-auto">
        <div
          className={`rounded-2xl p-6 sm:p-7 border shadow-xl transition-all duration-200 bg-white dark:bg-[#0F0F16] border-slate-200 dark:border-white/10 ${
            isShaking ? 'animate-shake ring-2 ring-red-500/50' : ''
          }`}
        >
          {/* Lock Icon & Title */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/10 dark:bg-indigo-600/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold dark:text-white text-slate-900 tracking-tight uppercase">
              Music Tryouts
            </h1>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
              Enter instructor password to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Input with show/hide toggle */}
            <div>
              <div className="relative">
                <input
                  id="input-instructor-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoFocus
                  placeholder="Enter password..."
                  required
                  className="w-full pl-3.5 pr-10 py-3 bg-slate-50 dark:bg-[#1A1A24] border border-slate-300 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                />
                <button
                  type="button"
                  id="btn-toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-500/40 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-300 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-sans font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Enter Button */}
            <button
              id="btn-unlock-portal"
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.35)] border border-indigo-400/30 transition-all cursor-pointer"
            >
              <span>Enter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Subtle Footer */}
      <div className="w-full max-w-md mx-auto text-center py-2">
        <p className="text-[11px] font-mono text-slate-400 dark:text-gray-600">
          MusicTO Tryouts Scouting System
        </p>
      </div>
    </div>
  );
};
