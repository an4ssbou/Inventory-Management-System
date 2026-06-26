import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiBox, FiGrid, FiLogOut, FiMenu, FiMoon, FiSun, FiUser, FiX } from 'react-icons/fi';
import Logo from '../assets/CHU-Logo.png';
import { api, authHeaders } from '../utils/api';
import { clearToken, decodeToken, getToken } from '../utils/auth';

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-bold transition ${isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`;

const Component = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'));
  const token = getToken();

  useEffect(() => {
    let active = true;

    const getUserInfo = async () => {
      const decoded = decodeToken(token);
      if (!decoded?.id) {
        setUser(null);
        return;
      }

      try {
        const response = await api.get(`/user/${decoded.id}`, authHeaders(token));
        if (active) setUser(response.data.user);
      } catch {
        if (active) setUser(null);
      }
    };

    getUserInfo();
    return () => { active = false; };
  }, [token]);

  const handleLogout = () => {
    clearToken();
    setUser(null);
    navigate('/login');
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setDark(document.documentElement.classList.contains('dark'));
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/92 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <nav className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="Accueil CHU Inventory">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <img src={Logo} className="h-7 w-7" alt="CHU Logo" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-extrabold text-slate-950 dark:text-white">CHU Inventory</span>
            <span className="hidden text-xs font-semibold text-slate-500 sm:block">Gestion du matériel hospitalier</span>
          </span>
        </Link>

        {user && (
          <div className="hidden items-center gap-1 md:flex">
            <NavLink to="/" className={navLinkClass}>Accueil</NavLink>
            <NavLink to="/material" className={navLinkClass}>Matériel</NavLink>
            <NavLink to="/requests" className={navLinkClass}>Mes demandes</NavLink>
            {user.Role === 'Admin' && <NavLink to="/dashboard/users" className={navLinkClass}>Dashboard</NavLink>}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button type="button" onClick={toggleTheme} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" aria-label="Changer le thème">
            {dark ? <FiSun /> : <FiMoon />}
          </button>
          {user ? (
            <div className="hidden items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex">
              <FiUser className="text-teal-700" />
              <div className="max-w-[170px] leading-tight">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{user.nom} {user.prénom}</p>
                <p className="truncate text-xs text-slate-500">{user.Role}</p>
              </div>
              <button type="button" onClick={handleLogout} className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-700" aria-label="Se déconnecter">
                <FiLogOut />
              </button>
            </div>
          ) : null}
          {user && (
            <button type="button" onClick={() => setOpen(!open)} className="rounded-md border border-slate-200 p-2 text-slate-700 dark:border-slate-700 dark:text-slate-100 md:hidden" aria-label="Menu mobile">
              {open ? <FiX /> : <FiMenu />}
            </button>
          )}
        </div>
      </nav>

      {open && user && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 shadow-lg dark:border-slate-800 dark:bg-slate-950 md:hidden">
          <div className="grid gap-2">
            <NavLink to="/" className={navLinkClass} onClick={() => setOpen(false)}>Accueil</NavLink>
            <NavLink to="/material" className={navLinkClass} onClick={() => setOpen(false)}>Matériel</NavLink>
            <NavLink to="/requests" className={navLinkClass} onClick={() => setOpen(false)}>Mes demandes</NavLink>
            {user.Role === 'Admin' && <NavLink to="/dashboard/users" className={navLinkClass} onClick={() => setOpen(false)}><FiGrid className="inline" /> Dashboard</NavLink>}
            <button type="button" onClick={handleLogout} className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-bold text-red-700 hover:bg-red-50">
              <FiLogOut /> Se déconnecter
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Component;
