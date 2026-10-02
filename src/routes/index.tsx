import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Camera,
  Headphones,
  Watch,
  Speaker,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreLayout, SectionTitle } from "@/components/store-layout";
import { ProductCard } from "@/components/store-ui";
import { getProducts } from "@/lib/store.functions";
import { imageFor } from "@/lib/store";
import hero from "@/assets/gadget-hero.jpg";
const query = { queryKey: ["products"], queryFn: () => getProducts() };
export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(query),
  head: () => ({
    meta: [
      { title: "Boss Up Trades | Gadgets for Every Day" },
      {
        name: "description",
        content:
          "Explore thoughtfully chosen gadgets for work, play and everything in between at Boss Up Trades.",
      },
      { property: "og:title", content: "Boss Up Trades | Gadgets for Every Day" },
      {
        property: "og:description",
        content: "Thoughtfully chosen technology for everyday living.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});
function Home() {
  const { data: products } = useSuspenseQuery(query);
  const [slide, setSlide] = useState(0);
  const featured = products.filter((p) => p.featured);
  const current = featured[slide % featured.length];

  useEffect(() => {
    if (featured.length === 0) return;
    const interval = setInterval(() => {
      setSlide((s) => (s + 1) % featured.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [featured.length]);

  return (
    <StoreLayout>
      <section className="relative isolate min-h-[500px] overflow-hidden bg-secondary sm:min-h-[570px]">
        <img
          src={hero}
          alt="A curated collection of headphones, camera, smartwatch and speaker"
          width={1600}
          height={900}
          className="absolute inset-0 h-full w-full object-cover object-[62%_center] opacity-65 sm:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent sm:via-background/65" />
        <div className="relative mx-auto flex min-h-[500px] max-w-7xl items-center px-6 py-16 sm:min-h-[570px] sm:px-8 lg:px-12">
          <div className="max-w-xl">
            <p className="mb-5 text-xs font-bold uppercase tracking-[.22em] text-accent-foreground">
              Welcome to Boss Up Trades
            </p>
            <h1 className="text-5xl font-bold leading-[1.08] sm:text-6xl lg:text-7xl">
              Tech that moves <span className="text-accent-foreground">with you.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              Everyday essentials, thoughtfully chosen. Discover gadgets that do more, wherever life
              takes you.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link to="/shop">
                Shop the collection <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-3 gap-4 border-b border-border py-6 text-center text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
          <span className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <Truck size={19} className="text-accent-foreground" /> Delivery arranged
          </span>
          <span className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <ShieldCheck size={19} className="text-accent-foreground" /> Curated gadgets
          </span>
          <span className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <RotateCcw size={19} className="text-accent-foreground" /> Returns by agreement
          </span>
        </div>
        <section className="py-16 sm:py-20">
          <SectionTitle
            eyebrow="The edit"
            title="Featured right now"
            action={{ label: "Shop all", to: "/shop" }}
          />
          {featured.length > 0 ? (
            <div className="p-4 sm:p-8">
              <div 
                key={current?.id}
                className="grid gap-5 bg-background shadow-2xl rounded-3xl overflow-hidden sm:grid-cols-[1fr_1fr] sm:items-center animate-in slide-in-from-left-12 fade-in duration-500"
              >
                <div className="aspect-[4/3] overflow-hidden sm:aspect-[5/4] relative bg-secondary">
                  <img
                    src={current?.image_url || (current ? imageFor(current.image_position) : hero)}
                    alt={current?.name || "Featured product"}
                    width={600}
                    height={600}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="px-6 pb-8 sm:px-10 sm:py-8">
                <p className="text-xs font-bold uppercase tracking-widest text-accent-foreground">
                  0{slide + 1} / 0{featured.length} · {current?.category}
                </p>
                <h3 className="mt-5 text-3xl font-bold sm:text-4xl">{current?.name}</h3>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {current?.description}
                </p>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <Button asChild>
                    <Link to="/product/$slug" params={{ slug: current?.slug || '' }}>
                      Shop now <ArrowRight />
                    </Link>
                  </Button>
                </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[300px] items-center justify-center bg-secondary text-sm text-muted-foreground">
              No featured products right now. Check back later!
            </div>
          )}
        </section>
        <section className="pb-16 sm:pb-20">
          <SectionTitle eyebrow="Find your fit" title="Browse by category" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
            {[
              { name: "Audio", icon: Headphones },
              { name: "Cameras", icon: Camera },
              { name: "Wearables", icon: Watch },
              { name: "Smart Home", icon: Speaker },
            ].map(({ name, icon: Icon }) => (
              <Link
                key={name}
                to="/shop"
                className="group flex min-h-32 flex-col justify-between border border-border bg-secondary p-5 transition-colors hover:border-primary sm:min-h-40"
              >
                <Icon className="h-7 w-7 text-accent-foreground" strokeWidth={1.5} />
                <span className="flex items-center justify-between text-sm font-bold sm:text-base">
                  {name}
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="pb-16 sm:pb-20">
          <SectionTitle
            eyebrow="Fresh finds"
            title="New arrivals"
            action={{ label: "View all products", to: "/shop" }}
          />
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-7 lg:max-w-4xl">
            {products.filter(p => p.new_arrival).slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {products.filter(p => p.new_arrival).length === 0 && (
              <p className="col-span-2 text-sm text-muted-foreground">More new arrivals coming soon!</p>
            )}
          </div>
        </section>
        <section className="border-t border-border py-14 sm:py-20">
          <SectionTitle eyebrow="The journal" title="Gadget tips & ideas" />
          <div className="grid gap-6 sm:grid-cols-2">
            <article className="border-t-2 border-primary pt-5">
              <p className="text-xs font-bold uppercase tracking-widest text-accent-foreground">
                Buying guide · 5 min read
              </p>
              <h3 className="mt-4 max-w-sm text-2xl font-bold">Find your everyday audio setup</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                From focused listening to room-filling sound, the right device changes how your day
                feels.
              </p>
            </article>
            <article className="border-t-2 border-primary pt-5">
              <p className="text-xs font-bold uppercase tracking-widest text-accent-foreground">
                Gadget tips · 3 min read
              </p>
              <h3 className="mt-4 max-w-sm text-2xl font-bold">Make more of your daily tech</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                Small habits and smart choices to get the most from the gadgets you use every day.
              </p>
            </article>
          </div>
        </section>
        <section className="border-t border-border py-14 sm:py-20" id="locations">
          <SectionTitle eyebrow="Visit us" title="Our Locations" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-secondary p-8 rounded-3xl flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Accra</h3>
              <p className="text-muted-foreground mb-4 flex-1">Come visit our main showroom for the latest tech.</p>
              <div className="text-sm font-semibold mb-4">📍 Accra City</div>
              <div className="h-40 w-full overflow-hidden rounded-xl bg-muted">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127072.18884915654!2d-0.26466981881882046!3d5.591208736341398!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9084b2b7a773%3A0xbed14ed8650e2dd3!2sAccra!5e0!3m2!1sen!2sgh!4v1690000000000!5m2!1sen!2sgh" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
              </div>
            </div>
            <div className="bg-secondary p-8 rounded-3xl flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Bolgatanga</h3>
              <p className="text-muted-foreground mb-4 flex-1">Your northern hub for premium gadgets.</p>
              <div className="text-sm font-semibold mb-4">📍 Bolgatanga</div>
              <div className="h-40 w-full overflow-hidden rounded-xl bg-muted">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126131.78013344192!2d-0.9238384022806659!3d10.785860714472624!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfd40ca5ebc837ad%3A0x446cc2620b784e!2sBolgatanga!5e0!3m2!1sen!2sgh!4v1690000000000!5m2!1sen!2sgh" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
              </div>
            </div>
            <div className="bg-primary text-primary-foreground p-8 rounded-3xl flex flex-col">
              <h3 className="text-2xl font-bold mb-2">Nationwide</h3>
              <p className="text-primary-foreground/80 mb-4 flex-1">Can't make it to a store? We deliver everywhere.</p>
              <div className="text-sm font-bold tracking-widest uppercase mb-4">🚚 Delivery Available</div>
              <div className="h-40 w-full overflow-hidden rounded-xl bg-primary-foreground/10">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4052327.917457934!2d-4.041680587293527!3d7.697664673623631!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfd75acda8dad6c7%3A0x54d7f230d093d236!2sGhana!5e0!3m2!1sen!2sgh!4v1690000000000!5m2!1sen!2sgh" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="opacity-80 mix-blend-luminosity"></iframe>
              </div>
            </div>
          </div>
        </section>
      </div>
    </StoreLayout>
  );
}
