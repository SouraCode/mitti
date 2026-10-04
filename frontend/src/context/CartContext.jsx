import { createContext, useContext, useEffect, useMemo, useState } from 'react';
const CartContext = createContext();
export const useCart = () => useContext(CartContext);
function readCart() {
  try {
    const stored = JSON.parse(localStorage.getItem('mitti-cart') || '[]');
    if (!Array.isArray(stored)) return [];
    return stored.reduce((unique, item) => {
      if (!item?.id) return unique;
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const existing = unique.find((entry) => entry.id === item.id);
      if (existing) existing.quantity += quantity;
      else unique.push({ ...item, quantity });
      return unique;
    }, []);
  } catch {
    return [];
  }
}
export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  useEffect(() => {
    localStorage.setItem('mitti-cart', JSON.stringify(items));
  }, [items]);
  const value = useMemo(
    () => ({
      items,
      count: items.length,
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      add: (product) =>
        setItems((all) => {
          const existing = all.find((item) => item.id === product.id);
          return existing
            ? all.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              )
            : [...all, { ...product, quantity: 1 }];
        }),
      remove: (id) => setItems((all) => all.filter((item) => item.id !== id)),
      update: (id, quantity) =>
        setItems((all) =>
          quantity < 1
            ? all.filter((item) => item.id !== id)
            : all.map((item) => (item.id === id ? { ...item, quantity } : item))
        ),
      clear: () => setItems([]),
    }),
    [items]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
