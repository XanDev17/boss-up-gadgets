import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const getProducts = createServerFn({method:'GET'}).handler(async () => {
  const { createClient } = await import('@supabase/supabase-js');
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('Store catalog is unavailable');
  const client = createClient(url, key, { auth: { persistSession:false, autoRefreshToken:false } });
  const { data, error } = await client.from('products').select('*').order('created_at');
  if (error) throw error;
  return data ?? [];
});

const checkoutSchema = z.object({
  customer_name:z.string().trim().min(2).max(100), email:z.string().email().max(200), phone:z.string().trim().min(7).max(30), address:z.string().trim().min(8).max(500),
  items:z.array(z.object({id:z.string().uuid(),quantity:z.number().int().min(1).max(20)})).min(1).max(40),
});
export const placeOrder = createServerFn({method:'POST'}).inputValidator((data)=>checkoutSchema.parse(data)).handler(async ({data}) => {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const ids = data.items.map(item=>item.id);
  const {data:products,error:productError} = await supabaseAdmin.from('products').select('id,price,stock').in('id',ids);
  if (productError || !products || products.length !== new Set(ids).size) throw new Error('A product is no longer available. Please review your cart.');
  const lines = data.items.map(item=>{const product=products.find(p=>p.id===item.id); if(!product || product.stock<item.quantity) throw new Error('Not enough stock for an item in your cart.'); return {product_id:item.id,quantity:item.quantity,unit_price:Number(product.price)};});
  const total=lines.reduce((sum,item)=>sum+item.unit_price*item.quantity,0);
  const {data:order,error} = await supabaseAdmin.from('orders').insert({customer_name:data.customer_name,email:data.email,phone:data.phone,address:data.address,total,status:'new'}).select('id').single();
  if(error || !order) throw new Error('Could not place your order. Please try again.');
  const {error:itemsError}=await supabaseAdmin.from('order_items').insert(lines.map(line=>({...line,order_id:order.id})));
  if(itemsError) { await supabaseAdmin.from('orders').delete().eq('id',order.id); throw new Error('Could not place your order. Please try again.'); }
  return {id:order.id,total};
});

export const getAdminOverview = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
  const {data:role}=await context.supabase.from('user_roles').select('role').eq('user_id',context.userId).eq('role','admin').maybeSingle();
  if(!role) throw new Error('Access denied');
  const [orders,products] = await Promise.all([context.supabase.from('orders').select('id,customer_name,total,status,created_at').order('created_at',{ascending:false}),context.supabase.from('products').select('id,name,stock,price').order('stock')]);
  if(orders.error || products.error) throw new Error('Could not load dashboard');
  return {orders:orders.data??[],products:products.data??[]};
});
