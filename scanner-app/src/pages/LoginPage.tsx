import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BrandLogo } from '../components/BrandLogo';
import { IconLock, IconLogin, IconMoon, IconSun, IconUser } from '../components/Icons';
import { appConfig } from '../config/env';

export function LoginPage() {
  const { agent, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  if (agent) return <Navigate to="/scan" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password.trim()) {
      setError('Identifiant et mot de passe requis.');
      return;
    }
    setLoading(true);
    const ok = await login(identifier, password);
    setLoading(false);
    if (!ok) {
      setError('Identifiants invalides ou API indisponible.');
      return;
    }
    navigate('/scan');
  }

  return (
    <div className="page page-login">
      <button
        type="button"
        className="theme-toggle theme-toggle--floating"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      >
        {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
      </button>

      <div className="hero-banner" aria-hidden>
        <img src="/assets/banner-road.png" alt="" className="hero-banner__img" />
        <div className="hero-banner__shade" />
      </div>

      <div className="login-panel">
        <div className="login-hero">
          <BrandLogo size="lg" className="brand-logo--hero" />
          <p className="login-hero__tagline">Scan d&apos;embarquement</p>
          <p className="login-hero__sub">
            Authentifiez les billets voyageur241 en un geste à l&apos;embarquement.
          </p>
          <p className="login-hero__version">v{appConfig.version}</p>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <h1>
            <IconUser size={22} />
            Connexion agent
          </h1>
          <label>
            Identifiant
            <span className="input-with-icon">
              <IconUser size={18} />
              <input
                type="text"
                placeholder="v241 ou Premium-transport"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                required
              />
            </span>
          </label>
          <label>
            Mot de passe
            <span className="input-with-icon">
              <IconLock size={18} />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </span>
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <IconLogin size={18} />
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
