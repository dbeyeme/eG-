import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { appConfig } from '../config/env';

export type AgentRole = 'admin' | 'agence' | 'agent';

export type Agent = {
  identifier: string;
  displayName?: string;
  role?: AgentRole;
  agenceId?: string | null;
  agenceCode?: string | null;
  token?: string;
};

type AuthContextValue = {
  agent: Agent | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = 'voyageur241_agent';
const TOKEN_KEY = 'voyageur241_token';

function loadAgent(): Agent | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const agent = JSON.parse(raw) as Agent;
    const token = sessionStorage.getItem(TOKEN_KEY) || agent.token;
    if (!token) return null;
    return { ...agent, token };
  } catch {
    return null;
  }
}

function loginUrl(): string {
  const base = appConfig.apiBaseUrl.replace(/\/$/, '');
  return `${base}/api/v1/auth/login`;
}

export function getAuthToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function clearAuthSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [agent, setAgent] = useState<Agent | null>(() => loadAgent());

  const value = useMemo<AuthContextValue>(
    () => ({
      agent,
      login: async (identifier, password) => {
        if (!identifier.trim() || !password.trim()) return false;

        try {
          const res = await fetch(loginUrl(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              username: identifier.trim(),
              password,
            }),
          });

          if (!res.ok) return false;
          const data = (await res.json()) as {
            ok?: boolean;
            token?: string;
            user?: {
              username: string;
              displayName?: string;
              role?: AgentRole;
              agenceId?: string | null;
              agenceCode?: string | null;
              agentId?: string;
            };
          };

          if (!data.ok || !data.user || !data.token) return false;

          const next: Agent = {
            identifier: data.user.agentId || data.user.username,
            displayName: data.user.displayName,
            role: data.user.role,
            agenceId: data.user.agenceId,
            agenceCode: data.user.agenceCode,
            token: data.token,
          };
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
          sessionStorage.setItem(TOKEN_KEY, data.token);
          setAgent(next);
          return true;
        } catch {
          return false;
        }
      },
      logout: () => {
        clearAuthSession();
        setAgent(null);
      },
    }),
    [agent],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
