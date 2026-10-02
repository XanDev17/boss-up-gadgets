import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingBag, X, ArrowRight } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useStore } from "./store-context";
import { ChatBot } from "./chat-bot";

export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center border-2 border-current text-base font-black leading-none">
        B<span className="absolute ml-4 mt-4 text-[9px]">↗</span>
      </span>
      <span className="text-left text-[15px] font-black uppercase leading-[.85] tracking-wide">
        BOSS UP <span className="block text-[10px] font-bold tracking-[.24em]">TRADES</span>
      </span>
    </span>
  );
}
export function StoreLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { cart } = useStore();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const links = [
    { to: "/" as const, label: "Home" },
    { to: "/shop" as const, label: "Shop" },
    { to: "/about" as const, label: "About" },
  ];
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="bg-primary px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[.16em] text-primary-foreground sm:text-xs">
        Accra · Bolgatanga · Nationwide delivery
      </div>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto grid h-17 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-5 sm:h-20 sm:px-8 lg:px-12">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X /> : <Menu />}
          </Button>
          <Link
            to="/"
            className="justify-self-center text-primary md:justify-self-start"
            aria-label="Boss Up Trades home"
          >
            <Wordmark />
          </Link>
          <nav className="hidden items-center justify-center gap-9 md:flex">
            {links.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-xs font-bold uppercase tracking-widest transition-colors hover:text-accent-foreground ${path === item.to ? "text-primary" : "text-muted-foreground"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/cart"
            className="relative justify-self-end text-primary"
            aria-label={`Cart with ${cart.reduce((n, i) => n + i.quantity, 0)} items`}
          >
            <ShoppingBag size={22} strokeWidth={1.8} />
            {cart.length > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
                {cart.reduce((n, i) => n + i.quantity, 0)}
              </span>
            )}
          </Link>
        </div>
        {open && (
          <nav className="border-t border-border bg-background px-5 py-3 md:hidden">
            {links.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="block border-b border-border py-4 text-sm font-semibold uppercase tracking-wide"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              className="block py-4 text-sm font-semibold uppercase tracking-wide"
            >
              Cart
            </Link>
          </nav>
        )}
      </header>
      <main>{children}</main>
      <footer className="mt-20 bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 sm:px-8 lg:px-12">
          <div>
            <Wordmark />
            <p className="mt-5 max-w-xs text-sm leading-relaxed opacity-70">
              Premium gadgets and thoughtful tech, ready when you are.
            </p>
            <div className="mt-6 flex flex-col gap-2 text-sm font-semibold opacity-80">
              <p>📍 Accra</p>
              <p>📍 Bolgatanga</p>
              <p>🚚 Nationwide delivery</p>
            </div>
          </div>
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-widest">Shop</h3>
            <div className="flex flex-col gap-3 text-sm opacity-80">
              <Link to="/shop" search={{ category: "smartphones" }}>Smartphones</Link>
              <Link to="/shop" search={{ category: "computers" }}>MacBooks</Link>
              <Link to="/shop" search={{ category: "tablets" }}>iPads & Tablets</Link>
              <Link to="/shop" search={{ category: "gaming" }}>PS5 & Gaming</Link>
              <Link to="/shop" search={{ category: "audio" }}>Headphones & Audio</Link>
              <Link to="/shop" search={{ category: "wearables" }}>Apple Watch</Link>
            </div>
          </div>
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-widest">Explore</h3>
            <div className="flex flex-col gap-3 text-sm opacity-80">
              <Link to="/">Home</Link>
              <Link to="/shop">Shop All</Link>
              <a href="#how">How it works</a>
              <a href="#why">Why Boss Up</a>
              <a href="#locations">Locations</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-widest">Connect</h3>
            <div className="flex flex-col gap-3 text-sm opacity-80">
              <a href="https://www.instagram.com/Bossup_trades" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://www.tiktok.com/@Bossup_trades" target="_blank" rel="noreferrer">TikTok</a>
              <a href="https://www.snapchat.com/add/Bossup_trades" target="_blank" rel="noreferrer">Snapchat</a>
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 border-t border-primary-foreground/20 px-6 py-5 text-xs opacity-60 sm:px-8 lg:px-12">
          <span>© {new Date().getFullYear()} Boss Up Trades. All rights reserved.</span>
          <span>Made for everyday possibilities.</span>
        </div>
      </footer>
      <ChatBot />
    </div>
  );
}
export function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { label: string; to: "/shop" };
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-accent-foreground">
          {eyebrow}
        </p>
        <h2 className="text-3xl font-bold tracking-normal sm:text-4xl">{title}</h2>
      </div>
      {action && (
        <Link
          to={action.to}
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-accent-foreground"
        >
          {action.label}
          <ArrowRight size={17} />
        </Link>
      )}
    </div>
  );
}
