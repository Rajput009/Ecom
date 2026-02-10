import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, Cpu } from 'lucide-react';
import { adminAuth, startSessionTimer } from '../services/adminAuth';
import { cn } from '../utils/cn';

export function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    if (adminAuth.isLoggedIn()) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  // Lock out after 5 failed attempts
  useEffect(() => {
    if (attempts >= 5) {
      setIsLocked(true);
      setError('Too many failed attempts. Please wait 5 minutes.');
      
      const timer = setTimeout(() => {
        setIsLocked(false);
        setAttempts(0);
        setError('');
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearTimeout(timer);
    }
  }, [attempts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) return;
    
    setIsLoading(true);
    setError('');

    try {
      const isValid = await adminAuth.verifyPassword(password);
      
      if (isValid) {
        adminAuth.createSession();
        
        // Start session timer
        const cleanup = startSessionTimer(() => {
          alert('Your admin session has expired. Please log in again.');
          navigate('/admin/login');
        });

        // Store cleanup function (optional - for manual cleanup)
        (window as any).adminSessionCleanup = cleanup;
        
        navigate('/admin/dashboard');
      } else {
        setAttempts(prev => prev + 1);
        setError(`Invalid password. ${5 - attempts - 1} attempts remaining.`);
        setPassword('');
      }
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
            <div>
              <label className="block text-sm text-[#71717a] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  disabled={isLocked || isLoading}
                  className={cn(
                    "w-full pl-10 pr-12 py-3 bg-[#18181b] border rounded-lg text-white placeholder:text-[#52525b] focus:outline-none transition-colors",
                    isLocked 
                      ? "border-[#ef4444]/30 cursor-not-allowed" 
                      : "border-[#27272a] focus:border-[#3b82f6]"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLocked}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white transition-colors disabled:cursor-not-allowed"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-[#52525b] mt-2">
                Contact your administrator for access
              </p>
            </div>

            <button
              type="submit"
              disabled={isLocked || isLoading || !password}
              className={cn(
                "w-full py-3 px-4 bg-[#3b82f6] text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2",
                (isLocked || isLoading || !password)
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[#2563eb] hover:shadow-lg hover:shadow-[#3b82f6]/25"
              )}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-[#27272a]">
            <p className="text-xs text-[#52525b] text-center">
              This is a secure area. Unauthorized access is prohibited.
              <br />
              All login attempts are logged.
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
