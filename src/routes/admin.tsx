import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { BarChart3, Boxes, ShoppingBag, TrendingUp, AlertTriangle, LogOut, Plus, Menu, Edit, Users, ArrowLeft, Star } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Wordmark } from '@/components/store-layout';
import { money, imageFor } from '@/lib/store';
import { getAdminOverview, addProduct, editProduct, loginAdmin, addAdmin } from '@/lib/store.functions';
import { Link } from '@tanstack/react-router';

export const Route=createFileRoute('/admin')({
  head:()=>({meta:[{title:'Admin Dashboard | Boss Up Trades'}]}),
  component:Admin
});

type Tab = 'dashboard' | 'products' | 'add_admin';

function Admin(){
  const [session,setSession]=useState(false); 
  const [username, setUsername]=useState('');
  const [password, setPassword]=useState('');
  const [loginError, setLoginError]=useState('');
  
  const [menu,setMenu]=useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [storeFilter, setStoreFilter] = useState('All');
  
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const [productForm, setProductForm] = useState<{ name: string, category: string, price: string, stock_accra: string, stock_bolga: string, description: string, featured: boolean, new_arrival: boolean, store_location: "Accra" | "Bolgatanga" | "Both", image_url: string }>({ name: '', category: 'smartphones', price: '', stock_accra: '', stock_bolga: '', description: '', featured: false, new_arrival: false, store_location: 'Both', image_url: '' });
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [adminMessage, setAdminMessage] = useState('');

  const fetchOverview=useServerFn(getAdminOverview);
  const addProductFn = useServerFn(addProduct);
  const editProductFn = useServerFn(editProduct);
  const loginFn = useServerFn(loginAdmin);
  const addAdminFn = useServerFn(addAdmin);

  const {data,isPending,refetch}=useQuery({
    queryKey:['admin-overview'],
    queryFn:fetchOverview,
    enabled:session
  });

  const loginMutation = useMutation({
    mutationFn: async () => loginFn({ data: { username, password } }),
    onSuccess: () => { setSession(true); setLoginError(''); },
    onError: (err: any) => { setLoginError(err.message || 'Invalid login'); }
  });

  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); loginMutation.mutate(); };
  const handleLogout = () => { setSession(false); setUsername(''); setPassword(''); };

  const addMutation = useMutation({
    mutationFn: async () => addProductFn({ data: { name: productForm.name, category: productForm.category, price: Number(productForm.price), stock_accra: Number(productForm.stock_accra || 0), stock_bolga: Number(productForm.stock_bolga || 0), description: productForm.description, featured: productForm.featured, new_arrival: productForm.new_arrival, store_location: productForm.store_location, image_url: productForm.image_url } }),
    onSuccess: () => { setShowAddProduct(false); setProductForm({name: '', category: 'smartphones', price: '', stock_accra: '', stock_bolga: '', description: '', featured: false, new_arrival: false, store_location: 'Both', image_url: ''}); refetch(); setActiveTab('products'); }
  });

  const editMutation = useMutation({
    mutationFn: async () => editProductFn({ data: { id: editingProduct.id, name: productForm.name, category: productForm.category, price: Number(productForm.price), stock_accra: Number(productForm.stock_accra || 0), stock_bolga: Number(productForm.stock_bolga || 0), description: productForm.description, featured: productForm.featured, new_arrival: productForm.new_arrival, store_location: productForm.store_location, image_url: productForm.image_url } }),
    onSuccess: () => { setEditingProduct(null); setProductForm({name: '', category: 'smartphones', price: '', stock_accra: '', stock_bolga: '', description: '', featured: false, new_arrival: false, store_location: 'Both', image_url: ''}); refetch(); setActiveTab('products'); }
  });

  const addAdminMutation = useMutation({
    mutationFn: async () => addAdminFn({ data: adminForm }),
    onSuccess: () => { setAdminMessage('Admin added successfully!'); setAdminForm({username: '', password: ''}); },
    onError: (err: any) => { setAdminMessage(err.message || 'Error adding admin'); }
  });

  if(!session) return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-10 text-center">
        <Link to="/" className="inline-block mb-8 text-primary mx-auto hover:opacity-80 transition-opacity">
          <Wordmark />
        </Link>
        <h1 className="text-2xl font-bold">Admin sign in</h1>
        <form onSubmit={handleLogin} className="mt-8 space-y-4 text-left">
          <label className="block text-sm font-semibold">Username<input type="text" required value={username} onChange={e=>setUsername(e.target.value)} className="mt-2 w-full border border-border bg-background px-3 py-2 outline-none focus:border-primary"/></label>
          <label className="block text-sm font-semibold">Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full border border-border bg-background px-3 py-2 outline-none focus:border-primary"/></label>
          {loginError && <p role="alert" className="text-sm text-destructive">{loginError}</p>}
          <Button className="w-full" type="submit" disabled={loginMutation.isPending}>{loginMutation.isPending ? 'Signing in...' : 'Sign in'}</Button>
        </form>
        <Link to="/" className="mt-8 inline-flex items-center justify-center gap-2 text-xs text-muted-foreground"><ArrowLeft size={15}/> Back to store</Link>
      </main>
    </div>
  );

  if(isPending || !data) return <div className="grid min-h-screen place-items-center bg-background text-foreground">Loading dashboard…</div>;
  
  const orders=data.orders;
  const products=data.products;
  const revenue=orders.reduce((s,o)=>s+Number(o.total),0);
  const low=products.filter(p=>p.stock<10);
  const days=Array.from({length:7},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-(6-i));
    const key=d.toISOString().slice(0,10);
    return {
      day:d.toLocaleDateString('en-US',{weekday:'short'}),
      sales:orders.filter(o=>o.created_at.slice(0,10)===key).reduce((s,o)=>s+Number(o.total),0),
      orders:orders.filter(o=>o.created_at.slice(0,10)===key).length
    }
  });

  return (
    <div className="min-h-screen bg-secondary text-foreground">
      <header className="sticky top-0 z-30 flex h-17 items-center justify-between border-b border-border bg-background px-5 sm:px-8">
        <div className="flex items-center gap-4 text-primary">
          <Wordmark/>
          <span className="hidden border-l border-border pl-4 text-xs font-bold uppercase tracking-widest text-muted-foreground sm:block">Admin Demo</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={()=>setMenu(!menu)}><Menu/></Button>
          <Button variant="ghost" className="hidden lg:inline-flex" onClick={handleLogout}><LogOut/> Sign out</Button>
        </div>
      </header>
      
      <div className="mx-auto grid max-w-7xl lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className={`${menu?'block':'hidden'} border-b border-border bg-background p-5 lg:block lg:min-h-screen lg:border-b-0 lg:border-r`}>
          <div className="space-y-2">
            <button onClick={() => { setActiveTab('dashboard'); setShowAddProduct(false); setEditingProduct(null); }} className={`w-full flex items-center gap-3 p-3 text-sm font-bold ${activeTab === 'dashboard' ? 'bg-secondary text-primary' : 'text-muted-foreground hover:text-foreground'}`}><BarChart3 size={18}/> Overview</button>
            <button onClick={() => { setActiveTab('products'); setShowAddProduct(false); setEditingProduct(null); }} className={`w-full flex items-center gap-3 p-3 text-sm font-bold ${activeTab === 'products' ? 'bg-secondary text-primary' : 'text-muted-foreground hover:text-foreground'}`}><Boxes size={18}/> Products</button>
            <button onClick={() => { setActiveTab('add_admin'); setShowAddProduct(false); setEditingProduct(null); setAdminMessage(''); }} className={`w-full flex items-center gap-3 p-3 text-sm font-bold ${activeTab === 'add_admin' ? 'bg-secondary text-primary' : 'text-muted-foreground hover:text-foreground'}`}><Users size={18}/> Add Admin</button>
            <Link to="/shop" className="flex items-center gap-3 p-3 text-sm text-muted-foreground hover:text-foreground"><ShoppingBag size={18}/> View store</Link>
            <Button variant="ghost" className="w-full justify-start lg:hidden mt-4" onClick={handleLogout}><LogOut/> Sign out</Button>
          </div>
        </aside>

        <main className="min-w-0 p-5 sm:p-8 lg:p-10">
          {activeTab === 'add_admin' ? (
            <div className="border border-border bg-background p-8 max-w-2xl">
              <h2 className="text-2xl font-bold mb-6">Add New Admin</h2>
              <form onSubmit={e => { e.preventDefault(); addAdminMutation.mutate(); }} className="space-y-4">
                <label className="block text-sm font-semibold">Username<input type="text" required value={adminForm.username} onChange={e=>setAdminForm({...adminForm, username: e.target.value})} className="mt-2 w-full border px-3 py-2 outline-none focus:border-primary"/></label>
                <label className="block text-sm font-semibold">Password<input type="password" required value={adminForm.password} onChange={e=>setAdminForm({...adminForm, password: e.target.value})} className="mt-2 w-full border px-3 py-2 outline-none focus:border-primary"/></label>
                {adminMessage && <p className={`text-sm ${adminMessage.includes('Error') ? 'text-destructive' : 'text-primary'}`}>{adminMessage}</p>}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={addAdminMutation.isPending}>{addAdminMutation.isPending ? 'Adding...' : 'Add Admin'}</Button>
                  <Button type="button" variant="outline" onClick={() => setActiveTab('dashboard')}>Back to Dashboard</Button>
                </div>
              </form>
            </div>
          ) : (showAddProduct || editingProduct) ? (
            <div className="border border-border bg-background p-8 max-w-2xl">
              <h2 className="text-2xl font-bold mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <form onSubmit={e => { e.preventDefault(); editingProduct ? editMutation.mutate() : addMutation.mutate(); }} className="space-y-4">
                <label className="block text-sm font-semibold">Product Name
                  <input type="text" required value={productForm.name} onChange={e=>setProductForm({...productForm, name: e.target.value})} className="mt-2 w-full border px-3 py-2 outline-none focus:border-primary"/>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block text-sm font-semibold">Category
                    <select required value={productForm.category} onChange={e=>setProductForm({...productForm, category: e.target.value})} className="mt-2 w-full border px-3 py-2 outline-none focus:border-primary">
                      <option value="smartphones">Smartphones</option>
                      <option value="computers">MacBooks / Computers</option>
                      <option value="tablets">iPads & Tablets</option>
                      <option value="gaming">PS5 & Gaming</option>
                      <option value="audio">Headphones & Earbuds</option>
                      <option value="wearables">Apple Watch / Wearables</option>
                      <option value="sound">Sound Systems</option>
                      <option value="accessories">Accessories</option>
                      <option value="kids_tablets">Kids Tablets</option>
                    </select>
                  </label>
                  <label className="block text-sm font-semibold">Store Location
                    <select required value={productForm.store_location} onChange={e=>setProductForm({...productForm, store_location: e.target.value as any})} className="mt-2 w-full border px-3 py-2 outline-none focus:border-primary">
                      <option value="Both">Both (Nationwide)</option>
                      <option value="Accra">Accra Only</option>
                      <option value="Bolgatanga">Bolgatanga Only</option>
                    </select>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block text-sm font-semibold">Price
                    <input type="number" required min="0" step="0.01" value={productForm.price} onChange={e=>setProductForm({...productForm, price: e.target.value})} className="mt-2 w-full border px-3 py-2 outline-none focus:border-primary"/>
                  </label>
                  {(productForm.store_location === 'Both' || productForm.store_location === 'Accra') && (
                    <label className="block text-sm font-semibold">Accra Stock
                      <input type="number" required min="0" value={productForm.stock_accra} onChange={e=>setProductForm({...productForm, stock_accra: e.target.value})} className="mt-2 w-full border px-3 py-2 outline-none focus:border-primary"/>
                    </label>
                  )}
                  {(productForm.store_location === 'Both' || productForm.store_location === 'Bolgatanga') && (
                    <label className="block text-sm font-semibold">Bolgatanga Stock
                      <input type="number" required min="0" value={productForm.stock_bolga} onChange={e=>setProductForm({...productForm, stock_bolga: e.target.value})} className="mt-2 w-full border px-3 py-2 outline-none focus:border-primary"/>
                    </label>
                  )}
                </div>
                <label className="block text-sm font-semibold">Description
                  <textarea required value={productForm.description} onChange={e=>setProductForm({...productForm, description: e.target.value})} className="mt-2 w-full border px-3 py-2 outline-none focus:border-primary" rows={3}/>
                </label>
                <label className="block text-sm font-semibold">Image Link (Optional)
                  <input type="url" placeholder="https://example.com/image.jpg" value={productForm.image_url} onChange={e=>setProductForm({...productForm, image_url: e.target.value})} className="mt-2 w-full border px-3 py-2 outline-none focus:border-primary"/>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input type="checkbox" checked={productForm.featured} onChange={e=>setProductForm({...productForm, featured: e.target.checked})} className="w-4 h-4 accent-primary"/>
                    Feature on home page
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                    <input type="checkbox" checked={productForm.new_arrival} onChange={e=>setProductForm({...productForm, new_arrival: e.target.checked})} className="w-4 h-4 accent-primary"/>
                    Mark as New Arrival
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={addMutation.isPending || editMutation.isPending}>{addMutation.isPending || editMutation.isPending ? 'Saving...' : 'Save Product'}</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowAddProduct(false); setEditingProduct(null); }}>Cancel</Button>
                </div>
              </form>
            </div>
          ) : activeTab === 'products' ? (
            <div className="border border-border bg-background p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-xl">Manage Products</h2>
                <div className="flex items-center gap-3 text-sm">
                  <label className="font-semibold text-muted-foreground flex items-center gap-2">
                    Store:
                    <select value={storeFilter} onChange={e=>setStoreFilter(e.target.value)} className="border px-2 py-1 outline-none focus:border-primary">
                      <option value="All">All Stores</option>
                      <option value="Accra">Accra Only</option>
                      <option value="Bolgatanga">Bolgatanga Only</option>
                    </select>
                  </label>
                  <Button onClick={() => { setShowAddProduct(true); setProductForm({ name: '', category: 'smartphones', price: '', stock_accra: '', stock_bolga: '', description: '', featured: false, new_arrival: false, store_location: 'Both', image_url: '' }); }}><Plus size={16} className="mr-2"/> Add Product</Button>
                </div>
              </div>
              <div className="overflow-x-auto space-y-8">
                {Array.from(new Set(products.map(p => p.category))).map(category => {
                  const catProducts = products.filter(p => p.category === category && (storeFilter === 'All' || p.store_location === storeFilter || p.store_location === 'Both'));
                  if (catProducts.length === 0) return null;
                  
                  return (
                    <div key={category}>
                      <h3 className="font-bold text-lg mb-3 capitalize text-primary border-b border-border pb-2">{category.replace('_', ' ')}</h3>
                      <table className="w-full min-w-[550px] text-left text-sm">
                        <thead className="text-xs uppercase text-muted-foreground">
                          <tr><th className="py-2">Name</th><th>Price</th><th>Stock</th><th>Store</th><th className="text-right">Actions</th></tr>
                        </thead>
                        <tbody>
                          {catProducts.map(p=>(
                            <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                              <td className="py-3 flex items-center gap-3">
                                <img src={p.image_url || imageFor(p.image_position)} alt={p.name} className="w-10 h-10 object-cover rounded bg-secondary" />
                                <div className="font-semibold flex items-center gap-2">
                                  {p.name}
                                  {p.featured && <Star size={14} className="fill-primary text-primary" title="Featured Product" />}
                                  {p.new_arrival && <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full uppercase tracking-wider">New</span>}
                                </div>
                              </td>
                              <td>{money(Number(p.price))}</td>
                              <td className={`font-semibold text-xs`}>
                                <div>{p.stock} Total</div>
                                <div className="text-muted-foreground font-normal">
                                  {p.stock_accra !== undefined ? p.stock_accra : 0} Accra
                                </div>
                                <div className="text-muted-foreground font-normal">
                                  {p.stock_bolga !== undefined ? p.stock_bolga : 0} Bolga
                                </div>
                              </td>
                              <td>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${p.store_location === 'Both' ? 'bg-primary/20 text-primary' : p.store_location === 'Accra' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                  {p.store_location}
                                </span>
                              </td>
                              <td className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => {
                                  setEditingProduct(p);
                                  setProductForm({ name: p.name, category: p.category, price: String(p.price), stock_accra: String(p.stock_accra || 0), stock_bolga: String(p.stock_bolga || 0), description: p.description, featured: p.featured, new_arrival: p.new_arrival, store_location: p.store_location || 'Both', image_url: p.image_url || '' });
                                }}>
                                  <Edit size={14} className="mr-2"/> Edit
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
                {!products.length && <p className="py-8 text-center text-sm text-muted-foreground">No products found.</p>}
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-widest text-accent-foreground">Store overview</p>
              <h1 className="mt-2 text-3xl font-bold">Dashboard</h1>
              <p className="mt-2 text-sm text-muted-foreground">Store performance and insights.</p>
              
              <div className="mt-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
                {[{label:'Total sales',value:money(revenue),icon:TrendingUp},{label:'All Orders',value:String(orders.length),icon:ShoppingBag},{label:'Products',value:String(products.length),icon:Boxes},{label:'Low stock',value:String(low.length),icon:AlertTriangle}].map(({label,value,icon:Icon})=><div key={label} className="border border-border bg-background p-5"><Icon size={20} className="text-accent-foreground"/><p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}
              </div>
              
              <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <div className="border border-border bg-background p-5">
                  <h2 className="font-bold">Sales trend</h2>
                  <div className="mt-6 h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={days}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                        <XAxis dataKey="day" fontSize={11}/>
                        <YAxis fontSize={11}/>
                        <Tooltip/>
                        <Area type="monotone" dataKey="sales" stroke="var(--primary)" fill="var(--accent)" fillOpacity={0.25}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="border border-border bg-background p-5">
                  <h2 className="font-bold mb-4">Featured Carousel</h2>
                  <div className="space-y-3">
                    {products.filter(p => p.featured).map(p => (
                      <div key={p.id} className="flex items-center justify-between border-b border-border pb-3">
                        <div className="flex items-center gap-3">
                          <img src={p.image_url || imageFor(p.image_position)} alt={p.name} className="w-10 h-10 object-cover rounded bg-secondary" />
                          <div>
                            <p className="font-semibold text-sm flex items-center gap-1">
                              {p.name} <Star size={12} className="fill-primary text-primary" />
                            </p>
                            <p className="text-xs text-muted-foreground">{p.category} · {money(Number(p.price))}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
                           editProductFn({ data: { id: p.id, name: p.name, category: p.category, price: Number(p.price), stock: Number(p.stock), description: p.description, featured: false, new_arrival: p.new_arrival, image_url: p.image_url || undefined } }).then(() => refetch());
                        }}>
                          Remove
                        </Button>
                      </div>
                    ))}
                    {products.filter(p => p.featured).length === 0 && (
                      <p className="text-sm text-muted-foreground italic">No products are currently featured on the homepage.</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <div className="border border-border bg-background p-5 xl:col-start-2">
                  <h2 className="font-bold mb-4">New Arrivals Carousel</h2>
                  <div className="space-y-3">
                    {products.filter(p => p.new_arrival).map(p => (
                      <div key={p.id} className="flex items-center justify-between border-b border-border pb-3">
                        <div className="flex items-center gap-3">
                          <img src={p.image_url || imageFor(p.image_position)} alt={p.name} className="w-10 h-10 object-cover rounded bg-secondary" />
                          <div>
                            <p className="font-semibold text-sm flex items-center gap-1">
                              {p.name} <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full uppercase tracking-wider">New</span>
                            </p>
                            <p className="text-xs text-muted-foreground">{p.category} · {money(Number(p.price))}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
                           editProductFn({ data: { id: p.id, name: p.name, category: p.category, price: Number(p.price), stock: Number(p.stock), description: p.description, featured: p.featured, new_arrival: false, image_url: p.image_url || undefined } }).then(() => refetch());
                        }}>
                          Remove
                        </Button>
                      </div>
                    ))}
                    {products.filter(p => p.new_arrival).length === 0 && (
                      <p className="text-sm text-muted-foreground italic">No products are currently marked as New Arrivals.</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-5 border border-border bg-background p-5">
                <h2 className="font-bold">All Recent Orders (Detailed)</h2>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[550px] text-left text-sm">
                    <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                      <tr><th className="py-3">Order ID</th><th>Customer</th><th>Email</th><th>Address</th><th>Date</th><th>Status</th><th className="text-right">Total</th></tr>
                    </thead>
                    <tbody>
                      {orders.map(o=>(
                        <tr key={o.id} className="border-b border-border">
                          <td className="py-4 font-semibold">#{o.id.slice(0,8).toUpperCase()}</td>
                          <td>{o.customer_name}</td>
                          <td className="text-muted-foreground">{o.email}</td>
                          <td className="text-muted-foreground max-w-[150px] truncate" title={o.address}>{o.address}</td>
                          <td>{new Date(o.created_at).toLocaleDateString()}</td>
                          <td className="capitalize">{o.status}</td>
                          <td className="text-right font-semibold">{money(Number(o.total))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!orders.length&&<p className="py-8 text-center text-sm text-muted-foreground">No orders yet.</p>}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
