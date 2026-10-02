import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "@/lib/store";

type CartLine = { product: Product; quantity: number };
type StoreContext = {
  cart: CartLine[];
  add: (product: Product, quantity?: number) => void;
  update: (id: string, quantity: number) => void;
  clear: () => void;
  wishlist: string[];
  toggleWish: (id: string) => void;
};
const Context = createContext<StoreContext | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("but-cart");
      if (stored) setCart(JSON.parse(stored));
      const saved = localStorage.getItem("but-wishlist");
      if (saved) setWishlist(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem("but-cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem("but-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);
  const add = (product: Product, quantity = 1) =>
    setCart((current) => {
      const found = current.find((item) => item.product.id === product.id);
      return found
        ? current.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
              : item,
          )
        : [...current, { product, quantity }];
    });
  const update = (id: string, quantity: number) =>
    setCart((current) =>
      current
        .map((item) => (item.product.id === id ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    );
  const toggleWish = (id: string) =>
    setWishlist((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  return (
    <Context.Provider value={{ cart, add, update, clear: () => setCart([]), wishlist, toggleWish }}>
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const value = useContext(Context);
  if (!value) throw new Error("Store provider missing");
  return value;
}
