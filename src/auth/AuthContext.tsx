import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { setAuthToken, initAuthFromStorage, setAuthFailureHandler } from '../api/client';
import appEvents from '../utils/appEvents';
import { socketClient } from '../socket/client';
import { getWallet } from '../api/wallet';

type User = {
  id: string;
  phone?: string;
  displayName?: string;
  role?: string;
  canManageWallets?: boolean;
  balance?: number;
} | null;

interface AuthContextValue {
  user: User;
  loading: boolean;
  login: (token: string, user?: User, redirectPath?: string, redirectState?: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
  const [ user, setUser ] = useState<User>(null);
  const [ loading, setLoading ] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // restore token from storage (safe lazy init)
    let timedOut = false;
    const safety = setTimeout(() => {
      // If auth check hasn't completed in reasonable time, stop loading to avoid white-screen
      timedOut = true;
      setLoading(false);
    }, 7000);

    try {
      initAuthFromStorage();
      // optional: fetch current user from API
      api.get('/auth/me').then(async res => {
        if (!timedOut) {
          const userData = res.data?.user || null;
          setUser(userData);
          // Fetch balance after setting user
          if (userData) {
            try {
              const walletRes = await getWallet();
              setUser(prev => prev ? { ...prev, balance: walletRes.wallet.balance } : null);
            } catch (e) {
              // ignore balance fetch error
            }
          }
        }
      }).catch(() => {
        if (!timedOut) setUser(null);
      }).finally(() => {
        if (!timedOut) setLoading(false);
        clearTimeout(safety);
      });
    } catch (e) {
      clearTimeout(safety);
      setLoading(false);
    }

    // Listen for real-time balance updates
    const handleWalletUpdated = (payload: { balance: number; }) => {
      setUser(prev => prev ? { ...prev, balance: payload.balance } : null);
    };
    socketClient.on('wallet-updated', handleWalletUpdated);

    return () => {
      clearTimeout(safety);
      socketClient.off('wallet-updated', handleWalletUpdated);
    };
  }, []);

  const location = useLocation();

  useEffect(() => {
    // register auth failure handler so API client can request logout on unrecoverable auth errors
    setAuthFailureHandler(() => {
      setAuthToken(null);
      setUser(null);
      // notify UI that auth failed (so components like ProtectedRoute can redirect or modals can show)
      import('../utils/appEvents').then(({ default: e }) => e.emit('auth:failure', { path: location.pathname })).catch(() => {});
    });
    return () => setAuthFailureHandler(null);
  }, [ location.pathname ]);

  const login = async (token: string, u?: User, redirectPath?: string, redirectState?: any) => {
    setAuthToken(token);
    if (u) setUser(u);
    // Fetch balance
    try {
      const walletRes = await getWallet();
      setUser(prev => prev ? { ...prev, balance: walletRes.wallet.balance } : u ? { ...u, balance: walletRes.wallet.balance } : null);
    } catch (e) {
      // ignore
    }
    // Emit an auth event for other systems (e.g., socket reconnection)
    try { appEvents.emit('auth:login', token); } catch (e) { /* ignore */ }
    if (redirectPath) navigate(redirectPath, { state: redirectState });
    else navigate('/');
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    navigate('/login');
  };

  const value = useMemo(() => ({ user, loading, login, logout }), [ user, loading ]);

  return <AuthContext.Provider value={ value }>{ children }</AuthContext.Provider>;
};

export default AuthProvider;
