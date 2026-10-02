import headphones from "@/assets/headphones.jpg";
import camera from "@/assets/camera.jpg";
import watch from "@/assets/watch.jpg";
import speaker from "@/assets/speaker.jpg";

export type { Product } from "./db";
export const imageFor = (position: string) =>
  ({ "top left": headphones, "top right": camera, "bottom left": watch, "bottom right": speaker })[
    position
  ] || headphones;
export const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
export const categories = ["All products", "Audio", "Cameras", "Wearables", "Smart Home"];
export const whatsappLink = (message: string) =>
  `https://wa.me/?text=${encodeURIComponent(message)}`;
