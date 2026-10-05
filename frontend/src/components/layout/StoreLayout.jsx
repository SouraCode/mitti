import { Outlet, useLocation } from 'react-router-dom';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import Footer from './Footer';
import ProductSearchBar from '../common/ProductSearchBar';
import MobileBottomNav from './MobileBottomNav';
export default function StoreLayout() {
  const { pathname } = useLocation();
  const authScreen = [
    '/login',
    '/register',
    '/forgot-password',
    '/verify-email',
    '/reset-password',
  ].includes(pathname);
  const showSearch =
    !['/our-story', '/ritual-guide', '/contact'].includes(pathname) &&
    !pathname.startsWith('/account') &&
    !authScreen;
  return (
    <>
      <AnnouncementBar />
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
