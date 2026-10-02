import { Link } from '@tanstack/react-router';
import { ArrowUpRight, Heart, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from './store-context';
import { imageFor, money, type Product } from '@/lib/store';

export function ProductCard({product,mode='grid'}:{product:Product;mode?:'grid'|'list'}) {
 const {add,wishlist,toggleWish}=useStore();
 const sale=product.original_price && product.original_price>product.price;
 return <article className={mode==='list'?'group grid grid-cols-[110px_minmax(0,1fr)] gap-4 border-b border-border py-5 sm:grid-cols-[180px_minmax(0,1fr)_auto] sm:gap-7':'group min-w-0'}>
  <Link to="/product/$slug" params={{slug:product.slug}} className={`relative block overflow-hidden bg-secondary ${mode==='list'?'aspect-square':'aspect-[4/4.3]'}`}><img src={imageFor(product.image_position)} alt={product.name} loading="lazy" width={600} height={600} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />{sale && mode==='grid' && <span className="absolute left-3 top-3 bg-background px-2 py-1 text-[10px] font-bold uppercase text-foreground">Sale</span>}</Link>
  <div className={mode==='list'?'min-w-0 self-center':'pt-3'}><div className="flex items-center justify-between gap-2"><span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{product.category}</span><Button variant="ghost" size="icon" aria-label={wishlist.includes(product.id)?'Remove from wishlist':'Save to wishlist'} title={wishlist.includes(product.id)?'Remove from wishlist':'Save to wishlist'} onClick={()=>toggleWish(product.id)} className="h-8 w-8"><Heart className={wishlist.includes(product.id)?'fill-current text-primary':'text-muted-foreground'} /></Button></div>
  <Link to="/product/$slug" params={{slug:product.slug}} className="block text-sm font-semibold leading-snug text-foreground hover:text-accent-foreground sm:text-base">{product.name}</Link>
  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Star className="h-3 w-3 fill-current text-accent-foreground" />{product.rating.toFixed(1)} <span className="ml-1 hidden sm:inline">· In stock</span></div>
  <div className="mt-3 flex flex-wrap items-baseline gap-2"><span className="text-base font-bold text-foreground">{money(product.price)}</span>{sale && <span className="text-xs text-muted-foreground line-through">{money(product.original_price!)}</span>}</div>
  {mode==='list' && <p className="mt-2 hidden max-w-xl text-sm leading-relaxed text-muted-foreground sm:block">{product.description}</p>}</div>
  {mode==='list' && <div className="col-span-2 flex items-center gap-2 sm:col-span-1 sm:self-center"><Button onClick={()=>add(product)} disabled={!product.stock} className="flex-1 sm:flex-none"><ShoppingBag /> Add to cart</Button><Button variant="outline" size="icon" asChild title="View product"><Link to="/product/$slug" params={{slug:product.slug}}><ArrowUpRight /></Link></Button></div>}
 </article>;
}
