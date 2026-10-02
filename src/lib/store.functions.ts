import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { readDb, writeDb, Product } from "./db";

export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
  const db = await readDb();
  return db.products.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
});

const checkoutSchema = z.object({
  customer_name: z.string().trim().min(1).max(100),
  email: z.string().email().max(200),
  phone: z.string().trim().min(1).max(30),
  address: z.string().trim().min(1).max(500),
  items: z
    .array(z.object({ id: z.string(), quantity: z.number().int().min(1).max(20) }))
    .min(1)
    .max(40),
});

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((data) => checkoutSchema.parse(data))
  .handler(async ({ data }) => {
    const db = await readDb();

    const ids = data.items.map((item) => item.id);
    const products = db.products.filter((p) => ids.includes(p.id));

    if (products.length !== new Set(ids).size)
      throw new Error("A product is no longer available. Please review your cart.");

    const lines = data.items.map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product || product.stock < item.quantity)
        throw new Error("Not enough stock for an item in your cart.");
      return {
        id: Math.random().toString(36).slice(2),
        product_id: item.id,
        quantity: item.quantity,
        unit_price: Number(product.price),
      };
    });

    const total = lines.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
    const orderId = Math.random().toString(36).slice(2);

    const order = {
      id: orderId,
      customer_name: data.customer_name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      total,
      status: "new",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Deduct stock
    data.items.forEach((item) => {
      const p = db.products.find((p) => p.id === item.id);
      if (p) p.stock -= item.quantity;
    });

    db.orders.push(order);
    lines.forEach((line) => {
      db.order_items.push({ ...line, order_id: orderId });
    });

    await writeDb(db);

    return { id: orderId, total };
  });

export const getAdminOverview = createServerFn({ method: "GET" }).handler(async () => {
  const db = await readDb();
  const sortedOrders = [...db.orders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const sortedProducts = [...db.products].sort((a, b) => a.stock - b.stock);
  return { orders: sortedOrders, products: sortedProducts };
});

const newProductSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  price: z.number().min(0),
  stock_accra: z.number().int().min(0).default(0),
  stock_bolga: z.number().int().min(0).default(0),
  description: z.string(),
  featured: z.boolean().default(false),
  new_arrival: z.boolean().default(false),
  store_location: z.enum(["Accra", "Bolgatanga", "Both"]).default("Both"),
  image_url: z.string().url().optional().or(z.literal('')),
});

export const addProduct = createServerFn({ method: "POST" })
  .inputValidator((data) => newProductSchema.parse(data))
  .handler(async ({ data }) => {
    const db = await readDb();
    const newProduct: Product = {
      id: Math.random().toString(36).slice(2),
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: data.name,
      category: data.category,
      price: data.price,
      original_price: null,
      rating: 5.0,
      description: data.description,
      features: [],
      image_position: "center",
      image_url: data.image_url || undefined,
      stock: data.stock_accra + data.stock_bolga,
      stock_accra: data.stock_accra,
      stock_bolga: data.stock_bolga,
      featured: data.featured,
      new_arrival: data.new_arrival,
      store_location: data.store_location,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    db.products.push(newProduct);
    await writeDb(db);
    return newProduct;
  });

const editProductSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  category: z.string().min(2),
  price: z.number().min(0),
  stock_accra: z.number().int().min(0).default(0),
  stock_bolga: z.number().int().min(0).default(0),
  description: z.string(),
  featured: z.boolean().default(false),
  new_arrival: z.boolean().default(false),
  store_location: z.enum(["Accra", "Bolgatanga", "Both"]).default("Both"),
  image_url: z.string().url().optional().or(z.literal('')),
});

export const editProduct = createServerFn({ method: "POST" })
  .inputValidator((data) => editProductSchema.parse(data))
  .handler(async ({ data }) => {
    const db = await readDb();
    const productIndex = db.products.findIndex((p) => p.id === data.id);
    if (productIndex === -1) throw new Error("Product not found");

    db.products[productIndex] = {
      ...db.products[productIndex],
      name: data.name,
      category: data.category,
      price: data.price,
      stock: data.stock_accra + data.stock_bolga,
      stock_accra: data.stock_accra,
      stock_bolga: data.stock_bolga,
      description: data.description,
      featured: data.featured,
      new_arrival: data.new_arrival,
      store_location: data.store_location,
      image_url: data.image_url || undefined,
      updated_at: new Date().toISOString(),
    };

    await writeDb(db);
    return db.products[productIndex];
  });

const loginSchema = z.object({ username: z.string(), password: z.string() });
export const loginAdmin = createServerFn({ method: "POST" })
  .inputValidator(data => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const db = await readDb();
    const admin = db.admins?.find(a => a.username === data.username && a.password === data.password);
    if (!admin) throw new Error("Invalid username or password");
    return true;
  });

export const addAdmin = createServerFn({ method: "POST" })
  .inputValidator(data => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const db = await readDb();
    if (!db.admins) db.admins = [];
    if (db.admins.find(a => a.username === data.username)) throw new Error("Username already exists");
    db.admins.push({ username: data.username, password: data.password });
    await writeDb(db);
    return true;
  });
