import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

const navItems = [
  { to: '/telimler', label: 'Təlimlər' },
  { to: '/resurslar', label: 'Resurs Bankı' },
  { to: '/sinaqlar', label: 'Sınaqlar' },
  { to: '/promptlar', label: 'Prompt Kitabxanası' },
  { to: '/haqqimizda', label: 'Haqqımızda' },
];

export function Header() {
  const { user, isAuthenticated, panelPath, logout } = useAuth();
  const { count } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    toast('Çıxış edildi.');
    navigate('/');
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-pill px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-brand-chipBg text-brand-blue'
        : 'text-brand-slate hover:bg-brand-hoverBg hover:text-brand-blue'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-brand-borderLight bg-brand-surface/95 backdrop-blur">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Link to="/" className="font-heading text-lg font-bold tracking-tight text-brand-navy">
          MIMEDU<span className="text-brand-blue">.AZ</span>
        </Link>

        <nav aria-label="Əsas naviqasiya" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Link
              to="/sebet"
              aria-label={`Səbət, ${count} məhsul`}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-brand-slate transition hover:bg-brand-hoverBg"
            >
              <span aria-hidden className="text-lg">
                &#128722;
              </span>
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-pill bg-brand-blue px-1 text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-pill border border-brand-border px-1.5 py-1.5 transition hover:border-[#c9d8ef] hover:bg-brand-hoverBg"
              >
                <Avatar name={user?.fullName} size="sm" />
                <span className="hidden max-w-[120px] truncate pr-2 text-sm font-medium text-brand-slate sm:block">
                  {user?.fullName}
                </span>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+8px)] w-56 overflow-hidden rounded-2xl border border-brand-border bg-white py-2 shadow-card"
                >
                  <Link
                    role="menuitem"
                    to={panelPath}
                    className="block px-4 py-2.5 text-sm text-brand-slate hover:bg-brand-hoverBg"
                  >
                    Panelim
                  </Link>
                  <Link
                    role="menuitem"
                    to="/sifarisler"
                    className="block px-4 py-2.5 text-sm text-brand-slate hover:bg-brand-hoverBg"
                  >
                    Sifarişlərim
                  </Link>
                  <button
                    role="menuitem"
                    type="button"
                    onClick={handleLogout}
                    className="block w-full px-4 py-2.5 text-left text-sm text-danger-text hover:bg-danger-bg"
                  >
                    Çıxış
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button size="sm" onClick={() => navigate('/giris')}>
              Daxil ol
            </Button>
          )}

          <button
            type="button"
            aria-label="Menyu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-brand-slate transition hover:bg-brand-hoverBg lg:hidden"
          >
            <span aria-hidden className="text-lg">
              {mobileOpen ? '✕' : '☰'}
            </span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav aria-label="Mobil naviqasiya" className="border-t border-brand-borderLight lg:hidden">
          <ul className="shell flex flex-col py-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className="block px-1 py-3 text-sm font-medium text-brand-slate"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
