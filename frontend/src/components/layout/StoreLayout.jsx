import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ProductSearchBar from '../common/ProductSearchBar';
import MobileBottomNav from './MobileBottomNav';
export default function StoreLayout() {
  const { pathname } = useLocation();
  const showSearch =
    pathname === '/shop' ||
    pathname === '/wishlist' ||
    pathname.startsWith('/products/');
  return (
    <>
      <Header />
      <main>
        {showSearch && <ProductSearchBar />}
        <Outlet />
      </main>
      <MobileBottomNav />
      <Footer />
    </>
  );
}
