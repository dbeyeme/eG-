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
    if (appConfig.authMode === 'jwt') {
      const token = sessionStorage.getItem(TOKEN_KEY) || agent.token;
      if (!token) return null;
      return { ...agent, token };
    }
    // Mode prod (agent) : session locale sans JWT voyageur241.com
    if (!agent.identifier) return null;
    return agent;
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

async function loginJwt(identifier: string, password: string): Promise<Agent | null> {
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

  if (!res.ok) return null;
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

  if (!data.ok || !data.user || !data.token) return null;

  return {
    identifier: data.user.agentId || data.user.username,
    displayName: data.user.displayName,
    role: data.user.role,
    agenceId: data.user.agenceId,
    agenceCode: data.user.agenceCode,
    token: data.token,
  };
}

/** Connexion agent locale pour prod voyageur241.com (contrat agentId). */
function loginAgentLocal(identifier: string): Agent | null {
  const id = identifier.trim();
  if (!id) return null;
  return {
    identifier: id,
    displayName: id,
    role: 'agent',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [agent, setAgent] = useState<Agent | null>(() => loadAgent());

  const value = useMemo<AuthContextValue>(
    () => ({
      agent,
      login: async (identifier, password) => {
        if (!identifier.trim()) return false;

        try {
          let next: Agent | null = null;

          if (appConfig.authMode === 'jwt') {
            if (!password.trim()) return false;
            next = await loginJwt(identifier, password);
            if (!next?.token) return false;
            sessionStorage.setItem(TOKEN_KEY, next.token);
          } else {
            next = loginAgentLocal(identifier);
            if (!next) return false;
            sessionStorage.removeItem(TOKEN_KEY);
          }

          sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
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
