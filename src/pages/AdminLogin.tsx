import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, Cpu, Mail } from 'lucide-react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { cn } from '../utils/cn';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, isAdmin, user } = useSupabaseAuth();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (isLoading) return; // Wait for auth state to be confirmed

    if (user && isAdmin) {
      navigate('/admin');
    } else if (user && !isAdmin) {
      setError('You do not have admin privileges.');
    }
  }, [user, isAdmin, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        setError('Invalid email or password.');
      }
      // Success will trigger the useEffect above
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-circuit opacity-30 pointer-events-none" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#3b82f6]/5 rounded-full blur-[120px]" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#22c55e]/5 rounded-full blur-[100px]" />

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#3b82f6] to-[#a855f7] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#3b82f6]/20">
              <Cpu className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Admin Login</h1>
            <p className="text-sm text-[#71717a]">Zulfiqar Computers</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />
              <p className="text-sm text-[#ef4444]">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm text-[#71717a] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@zulfiqarpc.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#18181b] border border-[#27272a] rounded-lg text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-[#71717a] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 bg-[#18181b] border border-[#27272a] rounded-lg text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className={cn(
                "w-full py-3 px-4 bg-[#3b82f6] text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2",
                (isLoading || !email || !password)
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[#2563eb] hover:shadow-lg hover:shadow-[#3b82f6]/25"
              )}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Setup Instructions */}
          <div className="mt-6 pt-6 border-t border-[#27272a]">
            <p className="text-xs text-[#52525b] text-center">
              First time? Run the SQL setup in Supabase Dashboard.
              <br />
              See <code className="text-[#3b82f6]">supabase/auth-setup.sql</code>
            </p>
          </div>
        </div>

        {/* Back to Store */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-[#71717a] hover:text-[#3b82f6] transition-colors"
          >
            ← Back to Store
          </a>
        </div>
      </div>
    </div>
  );
}
