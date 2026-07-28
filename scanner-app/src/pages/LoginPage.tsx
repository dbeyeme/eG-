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
  const needsPassword = appConfig.authMode === 'jwt';

  if (agent) return <Navigate to="/scan" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!identifier.trim()) {
      setError('Identifiant agent requis.');
      return;
    }
    if (needsPassword && !password.trim()) {
      setError('Identifiant et mot de passe requis.');
      return;
    }
    setLoading(true);
    const ok = await login(identifier, password);
    setLoading(false);
    if (!ok) {
      setError(
        needsPassword
          ? 'Identifiants invalides ou API indisponible.'
          : 'Impossible de démarrer la session agent.',
      );
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
          <p className={`login-hero__version channel-badge channel-badge--${appConfig.channel}`}>
            {appConfig.versionLabel}
          </p>
          {appConfig.isLab ? (
            <p className="login-hero__channel-hint">Mode laboratoire — API Railway / données de test</p>
          ) : (
            <p className="login-hero__channel-hint">Production — API voyageur241.com</p>
          )}
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
                placeholder={needsPassword ? 'v241 ou Premium-transport' : 'Agent_1'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                required
              />
            </span>
          </label>
          {needsPassword ? (
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
          ) : null}
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
