import { Link, useLocation } from 'react-router-dom';

const items = [
  ['/', 'Home', <path d="m3.5 10 8.5-7 8.5 7v10.5H14v-6h-4v6H3.5V10Z" />],
  ['/shop', 'Shop', <><path d="M5 8h14l1 12H4L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>],
  ['/ritual-guide', 'Routine', <><path d="M19.5 4.5C11 4.5 5.5 8.7 5.5 15.2c0 2.2 1.4 4.3 3.7 4.3 6.5 0 10.3-7.4 10.3-15Z" /><path d="M4 20c3.3-4 7.2-6.9 12-9" /></>],
  ['/wishlist', 'Wishlist', <path d="M20.8 8.8c0 5-8.8 10.7-8.8 10.7S3.2 13.8 3.2 8.8A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.8 2.2Z" />],
  ['/account', 'Profile', <><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></>],
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="ritual-bottom-nav" aria-label="Quick navigation">
      {items.map(([to, label, path]) => (
        <Link key={to} to={to} className={pathname === to || (to === '/account' && pathname.startsWith('/account')) ? 'active' : ''}>
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
