import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreLayout } from "@/components/store-layout";
import hero from "@/assets/gadget-hero.jpg";
export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Boss Up Trades | Better Everyday Tech" },
      {
        name: "description",
        content: "Learn about the thoughtful approach behind the Boss Up Trades gadget collection.",
      },
      { property: "og:title", content: "About Boss Up Trades" },
      { property: "og:description", content: "Thoughtfully selected technology for real life." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});
function About() {
  return (
    <StoreLayout>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <section className="max-w-3xl py-20 sm:py-28">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-accent-foreground">
            Our story
          </p>
          <h1 className="mt-5 text-5xl font-bold leading-tight sm:text-6xl">
            Better tech. Better every day<span className="text-accent-foreground">.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            At Boss Up Trades, we believe the best gadgets are the ones you actually love to use. We
            bring together practical, beautifully designed technology that fits into your life and
            helps you do more.
          </p>
          <Button asChild className="mt-8">
            <Link to="/shop">
              Explore the collection <ArrowRight />
            </Link>
          </Button>
        </section>
        <div className="aspect-[16/8] overflow-hidden bg-secondary">
          <img
            src={hero}
            alt="A selection of everyday gadgets"
            width={1600}
            height={900}
            className="h-full w-full object-cover"
          />
        </div>
        <section className="grid gap-10 py-20 sm:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "Thoughtfully chosen",
              text: "A focused selection of useful gadgets, chosen for quality and everyday value.",
            },
            {
              icon: ShieldCheck,
              title: "Quality matters",
              text: "Products that balance considered design, dependable performance and a great experience.",
            },
            {
              icon: Truck,
              title: "Easy to shop",
              text: "A simple way to discover, compare and order the tech that works for you.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="border-t-2 border-primary pt-5">
              <Icon className="mb-6 h-7 w-7 text-accent-foreground" />
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </section>
      </div>
    </StoreLayout>
  );
}
