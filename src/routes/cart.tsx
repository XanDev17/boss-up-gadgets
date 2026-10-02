import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreLayout } from "@/components/store-layout";
import { useStore } from "@/components/store-context";
import { imageFor, money, whatsappLink } from "@/lib/store";
import { placeOrder } from "@/lib/store.functions";
export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart | Boss Up Trades" },
      { name: "description", content: "Review your Boss Up Trades gadgets and place your order." },
      { property: "og:title", content: "Your Cart | Boss Up Trades" },
      { property: "og:description", content: "Review your selected gadgets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cart,
});
function Cart() {
  const { cart, update, clear } = useStore();
  const [checkout, setCheckout] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [complete, setComplete] = useState<string | null>(null);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const whatsapp = whatsappLink(
    `Hi Boss Up Trades, I'd like to order:\n${cart.map((item) => `${item.quantity} × ${item.product.name} — ${money(item.product.price * item.quantity)}`).join("\n")}\nTotal: ${money(subtotal)}\nPlease confirm availability and delivery.`,
  );
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const result = await placeOrder({
        data: {
          customer_name: String(form.get("name")),
          email: String(form.get("email")),
          phone: String(form.get("phone")),
          address: String(form.get("address")),
          items: cart.map((item) => ({ id: item.product.id, quantity: item.quantity })),
        },
      });
      setComplete(result.id);
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place your order.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <StoreLayout>
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-accent-foreground">
          Your selection
        </p>
        <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
          Your cart<span className="text-accent-foreground">.</span>
        </h1>
        {complete ? (
          <div className="mx-auto max-w-lg py-24 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-accent-foreground" />
            <h2 className="mt-5 text-2xl font-bold">Order received</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Thank you. Your order reference is{" "}
              <strong className="text-foreground">{complete.slice(0, 8).toUpperCase()}</strong>. The
              store will follow up to confirm availability, delivery and payment details.
            </p>
            <Button asChild className="mt-7">
              <Link to="/shop">
                Keep shopping <ArrowRight />
              </Link>
            </Button>
          </div>
        ) : cart.length === 0 ? (
          <div className="py-24 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" strokeWidth={1.4} />
            <h2 className="mt-5 text-2xl font-bold">Your cart is empty</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A great find is just around the corner.
            </p>
            <Button asChild className="mt-7">
              <Link to="/shop">
                Explore gadgets <ArrowRight />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_330px]">
            <div>
              <div className="border-b border-border pb-3 text-xs font-bold uppercase tracking-widest">
                Products ({cart.reduce((n, item) => n + item.quantity, 0)})
              </div>
              {cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="grid grid-cols-[90px_minmax(0,1fr)] gap-4 border-b border-border py-6 sm:grid-cols-[120px_minmax(0,1fr)_auto]"
                >
                  <Link
                    to="/product/$slug"
                    params={{ slug: product.slug }}
                    className="aspect-square bg-secondary"
                  >
                    <img
                      src={imageFor(product.image_position)}
                      alt={product.name}
                      width={600}
                      height={600}
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-accent-foreground">
                      {product.category}
                    </p>
                    <Link
                      to="/product/$slug"
                      params={{ slug: product.slug }}
                      className="mt-1 block font-bold"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-2 text-sm font-semibold">{money(product.price)}</p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex items-center border border-border">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => update(product.id, quantity - 1)}
                          aria-label={`Decrease ${product.name} quantity`}
                        >
                          <Minus />
                        </Button>
                        <span className="w-6 text-center text-xs font-bold">{quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => update(product.id, Math.min(product.stock, quantity + 1))}
                          aria-label={`Increase ${product.name} quantity`}
                        >
                          <Plus />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => update(product.id, 0)}
                        aria-label={`Remove ${product.name}`}
                        title="Remove item"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                  <span className="col-span-2 text-right font-bold sm:col-span-1">
                    {money(product.price * quantity)}
                  </span>
                </div>
              ))}
              <Link
                to="/shop"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-accent-foreground"
              >
                Continue shopping <ArrowRight size={16} />
              </Link>
            </div>
            <aside className="self-start border border-border bg-secondary p-6">
              <h2 className="text-xl font-bold">Order summary</h2>
              <div className="mt-6 flex justify-between border-b border-border pb-5 text-sm">
                <span>Subtotal</span>
                <span className="font-bold">{money(subtotal)}</span>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Shipping and payment arrangements will be confirmed by the store.
              </p>
              <div className="mt-6 flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{money(subtotal)}</span>
              </div>
              {!checkout ? (
                <Button className="mt-7 w-full" size="lg" onClick={() => setCheckout(true)}>
                  Continue to checkout <ArrowRight />
                </Button>
              ) : (
                <form onSubmit={submit} className="mt-7 space-y-4">
                  <h3 className="text-sm font-bold">Your details</h3>
                  {[
                    { name: "name", label: "Full name", type: "text", auto: "name" },
                    { name: "email", label: "Email address", type: "email", auto: "email" },
                    { name: "phone", label: "Phone number", type: "tel", auto: "tel" },
                  ].map((field) => (
                    <label key={field.name} className="block text-xs font-semibold">
                      {field.label}
                      <input
                        name={field.name}
                        type={field.type}
                        autoComplete={field.auto}
                        required
                        minLength={field.name === "phone" ? 7 : 2}
                        className="mt-2 w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                      />
                    </label>
                  ))}
                  <label className="block text-xs font-semibold">
                    Delivery address
                    <textarea
                      name="address"
                      required
                      minLength={8}
                      rows={3}
                      className="mt-2 w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  {error && (
                    <p role="alert" className="text-xs text-destructive">
                      {error}
                    </p>
                  )}
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? "Placing order…" : "Place order"}
                  </Button>
                </form>
              )}
              <div className="mt-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <Button asChild variant="outline" className="mt-4 w-full">
                <a href={whatsapp} target="_blank" rel="noreferrer">
                  <MessageCircle /> Order via WhatsApp
                </a>
              </Button>
            </aside>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
