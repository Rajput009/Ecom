// Admin authentication service
// Uses simple password hashing for security

// Get password hash from environment variable or use default
const ADMIN_PASSWORD_HASH = (import.meta as any).env?.VITE_ADMIN_PASSWORD_HASH || '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // admin123
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

class AdminAuthService {
  private sessionKey = 'zulfiqar_admin_session';

  // Simple hash function (SHA-256)
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Verify admin password
  async verifyPassword(password: string): Promise<boolean> {
    const hashedInput = await this.hashPassword(password);
    return hashedInput === ADMIN_PASSWORD_HASH;
  }

  // Create admin session
  createSession(): void {
    const session = {
      isAdmin: true,
      loginTime: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION,
    };
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
  }

  // Check if admin is logged in
  isLoggedIn(): boolean {
    const sessionStr = localStorage.getItem(this.sessionKey);
    if (!sessionStr) return false;

    try {
      const session = JSON.parse(sessionStr);
      
      // Check if session is expired
      if (Date.now() > session.expiresAt) {
        this.logout();
        return false;
      }

      return session.isAdmin === true;
    } catch {
      return false;
    }
  }

  // Extend session (call this on activity)
  extendSession(): void {
    if (this.isLoggedIn()) {
      this.createSession();
    }
  }

  // Get session info
  getSessionInfo(): { loggedIn: boolean; expiresIn: number } | null {
    const sessionStr = localStorage.getItem(this.sessionKey);
    if (!sessionStr) return null;

    try {
      const session = JSON.parse(sessionStr);
      const expiresIn = session.expiresAt - Date.now();
      
      return {
        loggedIn: session.isAdmin && expiresIn > 0,
        expiresIn: Math.max(0, expiresIn),
      };
    } catch {
      return null;
    }
  }

  // Logout admin
  logout(): void {
    localStorage.removeItem(this.sessionKey);
  }

  // Get time until session expires (in minutes)
  getTimeUntilExpiry(): number {
    const info = this.getSessionInfo();
    if (!info) return 0;
    return Math.floor(info.expiresIn / 60000);
  }
}

// Export singleton
export const adminAuth = new AdminAuthService();

// Auto-logout timer
export function startSessionTimer(onExpire: () => void): () => void {
  const checkInterval = setInterval(() => {
    if (!adminAuth.isLoggedIn()) {
      onExpire();
      clearInterval(checkInterval);
    }
  }, 60000); // Check every minute

  // Return cleanup function
  return () => clearInterval(checkInterval);
}
