import { BrandLogo } from './BrandLogo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { IconMoon, IconSun } from './Icons';
import { appConfig } from '../config/env';

type Props = {
  title?: string;
};

/** Compact top bar — primary nav lives in BottomNav on mobile. */
export function AppHeader({ title }: Props) {
  const { agent } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <BrandLogo size="sm" />
        <div className="app-header__copy">
          {title ? <h1 className="app-header__title">{title}</h1> : null}
          {agent ? (
            <p className="app-header__agent">
              <span className={`channel-badge channel-badge--${appConfig.channel}`}>
                {appConfig.channel === 'lab' ? 'LAB' : 'PROD'}
              </span>
              {' '}
              {agent.identifier} · v{appConfig.version}
            </p>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      >
        {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
      </button>
    </header>
  );
}
