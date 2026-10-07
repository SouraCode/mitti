import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const CartContext = createContext();
const MAX_PER_PRODUCT = 4;

export const useCart = () => useContext(CartContext);

export function purchaseLimit(item) {
  if (item?.stockQuantity === null || item?.stockQuantity === undefined || item?.stockQuantity === '')
    return MAX_PER_PRODUCT;
  const stock = Number(item?.stockQuantity);
  return Number.isFinite(stock)
    ? Math.min(MAX_PER_PRODUCT, Math.max(0, stock))
    : MAX_PER_PRODUCT;
}

function limitMessage(item) {
  if (item?.stockQuantity === null || item?.stockQuantity === undefined || item?.stockQuantity === '')
    return `Maximum ${MAX_PER_PRODUCT} units allowed per product.`;
  const stock = Number(item?.stockQuantity);
  if (Number.isFinite(stock) && stock <= MAX_PER_PRODUCT)
    return stock === 1 ? 'Only 1 left in stock.' : `Only ${stock} left in stock.`;
  return `Maximum ${MAX_PER_PRODUCT} units allowed per product.`;
}

function readCart() {
  try {
    const stored = JSON.parse(localStorage.getItem('mitti-cart') || '[]');
    if (!Array.isArray(stored)) return [];
    return stored.reduce((unique, item) => {
      if (!item?.id) return unique;
      const limit = purchaseLimit(item);
      if (limit < 1) return unique;
      const quantity = Math.min(limit, Math.max(1, Number(item.quantity) || 1));
      const existing = unique.find((entry) => entry.id === item.id);
      if (existing) existing.quantity = Math.min(limit, existing.quantity + quantity);
      else unique.push({ ...item, quantity });
      return unique;
    }, []);
  } catch {
    return [];
  }
}
export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  const [notice, setNotice] = useState(null);
  const noticeTimer = useRef();

  const showNotice = useCallback((productId, message) => {
    window.clearTimeout(noticeTimer.current);
    setNotice({ productId, message, key: Date.now() });
    noticeTimer.current = window.setTimeout(() => setNotice(null), 2800);
  }, []);

  useEffect(() => {
    localStorage.setItem('mitti-cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  const value = useMemo(
    () => ({
      items,
      notice,
      count: items.length,
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      add: (product) => {
        const limit = purchaseLimit(product);
        const existing = items.find((item) => item.id === product.id);
        if (limit < 1 || (existing && existing.quantity >= limit)) {
          showNotice(product.id, limit < 1 ? 'This product is out of stock.' : limitMessage(product));
          return false;
        }
        setItems((all) =>
          existing
            ? all.map((item) =>
                item.id === product.id
                  ? { ...item, ...product, quantity: Math.min(limit, item.quantity + 1) }
                  : item
              )
            : [...all, { ...product, quantity: 1 }]
        );
        setNotice(null);
        return true;
      },
      remove: (id) => setItems((all) => all.filter((item) => item.id !== id)),
      update: (id, requestedQuantity) => {
        const item = items.find((entry) => entry.id === id);
        if (!item) return false;
        if (requestedQuantity < 1) {
          setItems((all) => all.filter((entry) => entry.id !== id));
          return true;
        }
        const limit = purchaseLimit(item);
        const quantity = Math.min(requestedQuantity, limit);
        if (requestedQuantity > limit) showNotice(id, limitMessage(item));
        setItems((all) =>
          all.map((entry) => (entry.id === id ? { ...entry, quantity } : entry))
        );
        return requestedQuantity <= limit;
      },
      clear: () => {
        setItems([]);
        setNotice(null);
      },
    }),
    [items, notice, showNotice]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
