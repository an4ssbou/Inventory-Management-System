import { NavLink, useLocation } from 'react-router-dom';
import { FiBox, FiCheckCircle, FiClipboard, FiTool, FiUsers } from 'react-icons/fi';

const items = [
  { to: '/dashboard/users', label: 'Utilisateurs', icon: FiUsers },
  { to: '/dashboard/material', label: 'Matériel', icon: FiTool },
  { to: '/dashboard/loans', label: 'Emprunts', icon: FiCheckCircle },
  { to: '/dashboard/requests', label: 'Demandes', icon: FiClipboard },
];

const Component = () => {
  const location = useLocation();

  return (
    <aside className="dashboard-card shrink-0 p-3 lg:sticky lg:top-[84px] lg:h-[calc(100vh-96px)] lg:w-64">
      <div className="mb-3 hidden px-3 py-2 lg:block">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">Administration</p>
        <h2 className="mt-1 text-lg font-black text-slate-950">Centre de contrôle</h2>
      </div>
      <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1" aria-label="Navigation administration">
        {items.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <NavLink key={item.to} to={item.to} className={`flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-extrabold transition ${active ? 'bg-teal-700 text-white shadow-lg shadow-teal-700/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}>
              <Icon />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-4 hidden rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500 lg:block">
        <FiBox className="mb-2 text-teal-700" />
        Les actions sensibles sont réservées aux administrateurs connectés.
      </div>
    </aside>
  );
};

export default Component;
