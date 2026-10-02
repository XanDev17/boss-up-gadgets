import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

type Message = { role: "bot" | "user"; text: string };

const BOT_RESPONSES: Record<string, string> = {
  default: "Thanks for reaching out! 😊 You can browse our shop, check product details, or place an order. How can I help?",
  hello: "Hey there! 👋 Welcome to Boss Up Trades. Are you looking for something specific today?",
  hi: "Hi! 👋 Welcome to Boss Up Trades. Are you looking for something specific today?",
  price: "Our products are priced competitively! Head to the Shop page to see all prices and deals. 🛍️",
  shipping: "We arrange delivery for all orders. Once you place an order, we'll get in touch to sort out the details. 📦",
  return: "Returns are handled by agreement. Reach out to us after your purchase and we'll work it out! 🔄",
  order: "To place an order, browse the shop, add items to your cart, and checkout. It's that simple! 🛒",
  payment: "We accept payments at checkout. Add items to your cart and you'll see the options there! 💳",
  stock: "Check individual product pages for live stock info. Low stock items are flagged! ⚡",
  contact: "You can reach us via the WhatsApp button on any product page, or just chat right here! 💬",
  discount: "We run promotions from time to time. Check out the featured and sale items on our shop! 🏷️",
  help: "I can help with: shipping, returns, orders, stock, payments, and more! Just ask away. 😊",
  product: "We sell premium gadgets including headphones, cameras, smartwatches, and smart home speakers. Check out the shop! 🎧",
  audio: "We carry top-tier headphones and speakers. Head to the Audio category in our shop! 🎵",
  camera: "We have great cameras for every level. Check the Cameras section in our shop! 📸",
  watch: "Our wearables section has smartwatches and fitness bands. Go check them out! ⌚",
};

function getBotReply(input: string): string {
  const lower = input.toLowerCase();
  for (const key of Object.keys(BOT_RESPONSES)) {
    if (key !== "default" && lower.includes(key)) {
      return BOT_RESPONSES[key];
    }
  }
  return BOT_RESPONSES.default;
}

export function ChatBot() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hey! 👋 I'm the Boss Up Trades assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Show bot when near bottom of page
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      setVisible(scrolled > total - 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: "bot", text: getBotReply(text) }]);
    }, 900);
  };

  if (!visible && !open) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex w-80 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:w-96 animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-foreground/20">
              <Bot size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Boss Up Assistant</p>
              <p className="text-[11px] opacity-75">● Online · Replies instantly</p>
            </div>
            <button onClick={() => setOpen(false)} className="opacity-75 hover:opacity-100 transition-opacity" aria-label="Close chat">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex max-h-72 flex-col gap-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "bot" && (
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground mt-1">
                    <Bot size={14} />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === "bot"
                    ? "rounded-tl-none bg-secondary text-foreground"
                    : "rounded-tr-none bg-primary text-primary-foreground"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2 justify-start">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground mt-1">
                  <Bot size={14} />
                </div>
                <div className="rounded-2xl rounded-tl-none bg-secondary px-4 py-3">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div className="flex flex-wrap gap-2 px-4 pb-2">
            {["Shipping", "Returns", "Orders", "Products"].map((q) => (
              <button
                key={q}
                onClick={() => { setInput(q); }}
                className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t border-border p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <Button size="icon" className="h-8 w-8 shrink-0 rounded-full" onClick={send} disabled={!input.trim()}>
              <Send size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat with us"
        className="group relative grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-transform hover:scale-110 active:scale-95"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 ring-2 ring-background animate-pulse" />
        )}
      </button>
    </div>
  );
}
