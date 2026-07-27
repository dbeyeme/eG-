import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconHistory, IconLogout, IconScan } from './Icons';

/** Native-style bottom tabs for iPhone (safe-area aware). */
export function BottomNav() {
  const { agent, logout } = useAuth();
  if (!agent) return null;

  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      <NavLink to="/scan" className={({ isActive }) => (isActive ? 'bottom-nav__item is-active' : 'bottom-nav__item')}>
        <IconScan size={22} />
        <span>Scan</span>
      </NavLink>
      <NavLink
        to="/history"
        className={({ isActive }) => (isActive ? 'bottom-nav__item is-active' : 'bottom-nav__item')}
      >
        <IconHistory size={22} />
        <span>Historique</span>
      </NavLink>
      <button type="button" className="bottom-nav__item bottom-nav__item--danger" onClick={logout}>
        <IconLogout size={22} />
        <span>Quitter</span>
      </button>
    </nav>
  );
}
