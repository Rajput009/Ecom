import { useState, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { cn } from '../utils/cn';

type AuthMode = 'login' | 'signup';

export const CustomerAuthPage = memo(function CustomerAuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn, signUp } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError.message || 'Failed to sign in');
        } else {
          navigate(from, { replace: true });
        }
      } else {
        const { error: signUpError } = await signUp(email, password, name.trim() || undefined);
        if (signUpError) {
          setError(signUpError.message || 'Failed to create account');
        } else {
          setSuccess('Account created! Please check your email to verify your account.');
          setMode('login');
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-[#71717a] text-sm mt-2 font-mono">
            {mode === 'login' 
              ? 'Sign in to track your orders and repairs' 
              : 'Join us for a better shopping experience'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name field (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-[10px] font-mono font-bold text-[#71717a] uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-[#3f3f46] focus:outline-none focus:border-[#3b82f6] transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-[#71717a] uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-[#3f3f46] focus:outline-none focus:border-[#3b82f6] transition-colors"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-[#71717a] uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-[#3f3f46] focus:outline-none focus:border-[#3b82f6] transition-colors"
                />
              </div>
            </div>

            {/* Confirm Password field (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-[10px] font-mono font-bold text-[#71717a] uppercase tracking-widest mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-[#18181b] border border-[#27272a] rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-[#3f3f46] focus:outline-none focus:border-[#3b82f6] transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm font-mono">{error}</p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <p className="text-green-400 text-sm font-mono">{success}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-widest transition-all",
                isSubmitting 
                  ? "bg-[#27272a] text-[#71717a] cursor-not-allowed"
                  : "bg-[#3b82f6] text-white hover:bg-[#2563eb] shadow-lg shadow-blue-500/20"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-6 pt-6 border-t border-[#27272a] text-center">
            <p className="text-[#71717a] text-sm">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={toggleMode}
                className="ml-2 text-[#3b82f6] hover:text-[#60a5fa] font-medium transition-colors"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        {/* Continue as guest */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(from, { replace: true })}
            className="text-[#71717a] text-sm hover:text-white transition-colors"
          >
            Continue as guest →
          </button>
        </div>
      </div>
    </div>
  );
});

export default CustomerAuthPage;
