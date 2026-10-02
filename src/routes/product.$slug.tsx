import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Check,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreLayout } from "@/components/store-layout";
import { ProductCard } from "@/components/store-ui";
import { useStore } from "@/components/store-context";
import { getProducts } from "@/lib/store.functions";
import { imageFor, money, whatsappLink } from "@/lib/store";
const query = { queryKey: ["products"], queryFn: () => getProducts() };
export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }) => {
    const products = await context.queryClient.ensureQueryData(query);
    const product = products.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.name} | Boss Up Trades`
          : "Product not found | Boss Up Trades",
      },
      {
        name: "description",
        content: loaderData?.description || "Explore gadgets at Boss Up Trades.",
      },
      { property: "og:title", content: loaderData?.name || "Product not found" },
      {
        property: "og:description",
        content: loaderData?.description || "Explore gadgets at Boss Up Trades.",
      },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});
function ProductPage() {
  const product = Route.useLoaderData();
  const { data: products } = useSuspenseQuery(query);
  const { add, wishlist, toggleWish } = useStore();
  const [quantity, setQuantity] = useState(1),
    [added, setAdded] = useState(false);
  return (
    <StoreLayout>
      <div className="mx-auto max-w-7xl px-5 pt-7 sm:px-8 lg:px-12">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} /> Back to shop
        </Link>
        <div className="mt-7 grid gap-8 md:grid-cols-2 md:gap-12 lg:gap-20">
          <div className="aspect-square overflow-hidden bg-secondary">
            <img
              src={product.image_url || imageFor(product.image_position)}
              alt={product.name}
              width={600}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="py-2">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-accent-foreground">
              {product.category}
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">{product.name}</h1>
            <div className="mt-4 flex items-center gap-1 text-sm">
              <Star size={16} className="fill-current text-accent-foreground" />
              <span className="font-bold">{product.rating.toFixed(1)}</span>
              <span className="ml-2 text-muted-foreground">Customer favorite</span>
            </div>
            <div className="mt-7 flex items-baseline gap-3">
              <span className="text-3xl font-bold">{money(Number(product.price))}</span>
              {product.original_price && (
                <span className="text-lg text-muted-foreground line-through">
                  {money(Number(product.original_price))}
                </span>
              )}
            </div>
            <p className="mt-7 max-w-lg text-sm leading-7 text-muted-foreground">
              {product.description}
            </p>
            <div className="mt-8 border-y border-border py-6">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest">Features</h2>
              <ul className="grid gap-3">
                {product.features.map((feature: string) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check size={16} className="text-accent-foreground" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-6 text-sm font-semibold">
              {product.stock > 0 ? (
                <span className="text-accent-foreground">
                  ● In stock · {product.stock} available
                </span>
              ) : (
                <span className="text-destructive">Out of stock</span>
              )}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex h-11 items-center border border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus />
                </Button>
                <span className="w-9 text-center text-sm font-bold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  aria-label="Increase quantity"
                >
                  <Plus />
                </Button>
              </div>
              <Button
                className="h-11 flex-1 sm:flex-none"
                disabled={!product.stock}
                onClick={() => {
                  add(product, quantity);
                  setAdded(true);
                }}
              >
                <ShoppingBag /> {added ? "Added to cart" : "Add to cart"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={() => toggleWish(product.id)}
                aria-label={
                  wishlist.includes(product.id) ? "Remove from wishlist" : "Save to wishlist"
                }
                title="Save to wishlist"
              >
                <Heart
                  className={wishlist.includes(product.id) ? "fill-current text-primary" : ""}
                />
              </Button>
            </div>
            {added && (
              <Link to="/cart" className="mt-3 inline-block text-sm font-semibold underline">
                View cart →
              </Link>
            )}
            <a
              href={whatsappLink(
                `Hi Boss Up Trades, I'd like to order ${quantity} × ${product.name}.`,
              )}
              target="_blank"
              rel="noreferrer"
              className="mt-5 flex items-center gap-2 text-sm font-semibold text-accent-foreground hover:underline"
            >
              <MessageCircle size={17} /> Order via WhatsApp
            </a>
          </div>
        </div>
        <section className="mt-20 border-t border-border pt-12">
          <h2 className="mb-7 text-2xl font-bold">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {products
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </section>
      </div>
    </StoreLayout>
  );
}
