import fs from "fs/promises";
import path from "path";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  original_price: number | null;
  rating: number;
  description: string;
  features: string[];
  image_position: string;
  image_url?: string;
  stock: number; // Total stock
  stock_accra?: number;
  stock_bolga?: number;
  featured: boolean;
  new_arrival: boolean;
  store_location: "Accra" | "Bolgatanga" | "Both";
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Database {
  products: Product[];
  orders: Order[];
  order_items: OrderItem[];
  admins: { username: string; password: string }[];
}

const DB_PATH = path.join(process.cwd(), "demo-db.json");

const defaultDb: Database = {
  products: [
    {
      id: "1",
      slug: "studio-wireless-headphones",
      name: "Studio Wireless Headphones",
      category: "Audio",
      price: 189,
      original_price: 229,
      rating: 4.9,
      description:
        "Immerse yourself in rich, balanced sound with all-day comfort and seamless wireless listening.",
      features: [
        "Active noise cancellation",
        "Up to 40 hours battery life",
        "Ultra-soft memory foam cushions",
        "Fast USB-C charging",
      ],
      image_position: "top left",
      stock: 18,
      stock_accra: 10,
      stock_bolga: 8,
      featured: true,
      new_arrival: false,
      store_location: "Both",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      slug: "compact-mirrorless-camera",
      name: "Compact Mirrorless Camera",
      category: "Cameras",
      price: 749,
      original_price: 899,
      rating: 4.8,
      description: "Capture every detail with a compact camera designed for everyday creativity.",
      features: [
        "24MP high-resolution sensor",
        "4K video recording",
        "Fast autofocus",
        "Lightweight travel-ready design",
      ],
      image_position: "top right",
      stock: 7,
      stock_accra: 7,
      stock_bolga: 0,
      featured: true,
      new_arrival: true,
      store_location: "Accra",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  orders: [],
  order_items: [],
  admins: [{ username: "admin", password: "admin" }],
};

export async function readDb(): Promise<Database> {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, create it with default data
    await writeDb(defaultDb);
    return defaultDb;
  }
}

export async function writeDb(db: Database): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}
