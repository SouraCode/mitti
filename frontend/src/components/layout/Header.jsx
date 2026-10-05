import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const links = [
  ['/', 'Home'],
  ['/shop', 'Shop'],
  ['/our-story', 'Our story'],
  ['/ritual-guide', 'Ritual guide'],
  ['/contact', 'Contact'],
];

function Icon({ name }) {
  const paths = {
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
      </>
    ),
    heart: <path d="M20.8 8.8c0 5-8.8 10.7-8.8 10.7S3.2 13.8 3.2 8.8A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.8 2.2Z" />,
    bag: (
      <>
        <path d="M5 8h14l1 12H4L5 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, loading } = useAuth();
  const closeMenu = () => setOpen(false);

  return (
    <header className={`site-header${open ? ' menu-is-open' : ''}`}>
      <div className="header-inner">
        <button
          className={`menu-button${open ? ' is-open' : ''}`}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          aria-controls="primary-navigation"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            {open ? (
              <path d="M5 5l14 14M19 5 5 19" />
            ) : (
              <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" />
            )}
          </svg>
        </button>
        <Link className="brand" to="/" onClick={closeMenu} aria-label="Mitti Rituals home">
          <span>MITTI</span>
          <small>BOTANICAL RITUALS</small>
        </Link>
        <nav
          className={`primary-nav${open ? ' open' : ''}`}
          id="primary-navigation"
          aria-label="Main navigation"
        >
          {links.map(([to, label]) => (
            <NavLink onClick={closeMenu} key={to} to={to} end={to === '/'}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <Link
            className="header-icon-link wishlist-link"
            aria-label={`Your wishlist, ${wishlistCount} products`}
            to="/wishlist"
            onClick={closeMenu}
          >
            <Icon name="heart" />
            <span className="action-label">Wishlist</span>
          </Link>
          <Link
            className="header-icon-link account-link"
            aria-label={user ? 'Your account' : 'Sign in'}
            to={user ? '/account' : '/login'}
            onClick={closeMenu}
          >
            <Icon name="user" />
            <span className="action-label">
              {loading ? 'Account' : user ? 'Profile' : 'Sign in'}
            </span>
          </Link>
          <Link
            className="header-bag"
            aria-label={`Your bag, ${count} products`}
            to="/cart"
            onClick={closeMenu}
          >
            <Icon name="bag" />
            <span className="action-label">Bag</span>
            {count > 0 && (
              <b key={count} className="cart-count-pop">
                {count > 99 ? '99+' : count}
              </b>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
