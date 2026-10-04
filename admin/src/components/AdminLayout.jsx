import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RouteErrorBoundary from './RouteErrorBoundary';

const links = [
  ['/admin', 'Overview'],
  ['/admin/products', 'Products'],
  ['/admin/inventory', 'Inventory'],
  ['/admin/offers', 'Offers'],
  ['/admin/orders', 'Orders'],
  ['/admin/reviews', 'Reviews'],
];
const titles = {
  '/admin': 'Overview',
  '/admin/products': 'Products',
  '/admin/inventory': 'Inventory',
  '/admin/offers': 'Offers',
  '/admin/orders': 'Orders',
  '/admin/reviews': 'Reviews',
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const initials = (user?.name || 'Admin')
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <NavLink className="admin-brand" to="/admin" aria-label="Mitti Rituals admin home">
          MITTI <small>RITUALS / ADMIN</small>
        </NavLink>
        <nav aria-label="Admin navigation">
          {links.map(([to, label]) => (
            <NavLink key={to} end={to === '/admin'} to={to}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-user">
          <span className="admin-avatar" aria-hidden="true">
            {initials}
          </span>
          <span className="admin-user-copy">
            <strong>{user?.name}</strong>
            <small>Administrator</small>
          </span>
          <button onClick={logout}>Sign out</button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">Store management</p>
            <h1>{titles[location.pathname] || 'Admin studio'}</h1>
          </div>
          <span className="admin-topbar-name">{user?.name}</span>
        </header>
        <RouteErrorBoundary key={location.pathname}>
          <Outlet />
        </RouteErrorBoundary>
      </main>
    </div>
  );
}
