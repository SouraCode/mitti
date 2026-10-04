import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

function savePosition(key) {
  try {
    sessionStorage.setItem(`mitti-scroll:${key}`, String(window.scrollY));
  } catch {
    /* Storage may be unavailable in private browsing. */
  }
}

function scrollImmediately(top) {
  const root = document.documentElement;
  const behavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, top);
  root.style.scrollBehavior = behavior;
}

export default function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const activeKey = useRef(location.key);

  useLayoutEffect(() => {
    const saveCurrent = () => savePosition(activeKey.current);
    window.addEventListener('scroll', saveCurrent, { passive: true });
    window.addEventListener('pagehide', saveCurrent);
    return () => {
      saveCurrent();
      window.removeEventListener('scroll', saveCurrent);
      window.removeEventListener('pagehide', saveCurrent);
    };
  }, []);

  useLayoutEffect(() => {
    const key = location.key;
    activeKey.current = key;
    let top = 0;
    if (navigationType === 'POP') {
      try {
        top = Number(sessionStorage.getItem(`mitti-scroll:${key}`)) || 0;
      } catch {
        top = 0;
      }
    }
    scrollImmediately(top);
    let frame;
    if (navigationType === 'POP') {
      frame = window.requestAnimationFrame(() => scrollImmediately(top));
    }
    return () => {
      savePosition(key);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [location.key, location.pathname, location.search, navigationType]);

  return null;
}
