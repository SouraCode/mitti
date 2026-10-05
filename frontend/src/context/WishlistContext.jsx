import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const WishlistContext = createContext();

function readWishlist() {
  try {
    const stored = JSON.parse(localStorage.getItem('mitti-wishlist') || '[]');
    return Array.isArray(stored) ? stored.filter((item) => item?.id || item?._id) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(readWishlist);

  useEffect(() => {
    localStorage.setItem('mitti-wishlist', JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    const productId = (product) => product?.id || product?._id;
    return {
      items,
      count: items.length,
      has: (product) => items.some((item) => productId(item) === productId(product)),
      toggle: (product) => {
        const id = productId(product);
        if (!id) return;
        setItems((current) =>
          current.some((item) => productId(item) === id)
            ? current.filter((item) => productId(item) !== id)
            : [...current, product]
        );
      },
      remove: (product) => {
        const id = productId(product);
        setItems((current) => current.filter((item) => productId(item) !== id));
      },
    };
  }, [items]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);
