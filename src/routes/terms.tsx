import { createFileRoute } from "@tanstack/react-router";
import { StoreLayout } from "@/components/store-layout";
export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | Boss Up Trades" },
      { name: "description", content: "Terms and order information for Boss Up Trades." },
      { property: "og:title", content: "Terms & Conditions | Boss Up Trades" },
      { property: "og:description", content: "Order information and terms." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <StoreLayout>
      <section className="mx-auto max-w-3xl px-5 py-20">
        <h1 className="text-4xl font-bold">Terms & conditions</h1>
        <p className="mt-6 leading-relaxed text-muted-foreground">
          Product details and prices shown in this sample storefront are illustrative. Final
          availability, delivery terms and payment arrangements must be confirmed by Boss Up Trades
          before an order is fulfilled.
        </p>
      </section>
    </StoreLayout>
  ),
});
