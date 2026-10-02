CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL UNIQUE, role public.app_role NOT NULL DEFAULT 'user', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.user_roles TO authenticated; GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
CREATE POLICY roles_self ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE TABLE public.products (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE, name text NOT NULL, category text NOT NULL, price numeric(10,2) NOT NULL, original_price numeric(10,2), rating numeric(2,1) NOT NULL DEFAULT 5, description text NOT NULL, features text[] NOT NULL DEFAULT '{}', image_position text NOT NULL DEFAULT 'top left', stock integer NOT NULL DEFAULT 0, featured boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.products TO anon, authenticated; GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated; GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY products_public_read ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY products_admin_write ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TABLE public.orders (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), customer_name text NOT NULL, email text NOT NULL, phone text NOT NULL, address text NOT NULL, total numeric(10,2) NOT NULL, status text NOT NULL DEFAULT 'new', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, UPDATE ON public.orders TO authenticated; GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY orders_admin_read ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY orders_admin_update ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TABLE public.order_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE, product_id uuid NOT NULL REFERENCES public.products(id), quantity integer NOT NULL, unit_price numeric(10,2) NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.order_items TO authenticated; GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_items_admin_read ON public.order_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER touch_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_roles BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_order_items BEFORE UPDATE ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
INSERT INTO public.products (slug,name,category,price,original_price,rating,description,features,image_position,stock,featured) VALUES
('studio-wireless-headphones','Studio Wireless Headphones','Audio',189,229,4.9,'Immerse yourself in rich, balanced sound with all-day comfort and seamless wireless listening.',ARRAY['Active noise cancellation','Up to 40 hours battery life','Ultra-soft memory foam cushions','Fast USB-C charging'],'top left',18,true),
('compact-mirrorless-camera','Compact Mirrorless Camera','Cameras',749,899,4.8,'Capture every detail with a compact camera designed for everyday creativity.',ARRAY['24MP high-resolution sensor','4K video recording','Fast autofocus','Lightweight travel-ready design'],'top right',7,true),
('everyday-smartwatch','Everyday Smartwatch','Wearables',249,299,4.7,'Stay connected and on track with a refined smartwatch built for daily life.',ARRAY['Heart rate and activity tracking','Bright always-on display','Water resistant design','Up to 7 days battery life'],'bottom left',24,true),
('portable-bluetooth-speaker','Portable Bluetooth Speaker','Audio',99,129,4.8,'Big, clear sound in a compact speaker that goes wherever you do.',ARRAY['Room-filling 360° sound','Bluetooth 5.3 connectivity','Up to 16 hours playtime','Compact and portable'],'bottom right',12,true),
('travel-noise-cancelling-headphones','Travel Noise-Cancelling Headphones','Audio',219,269,4.6,'Your favorite soundtrack, uninterrupted, wherever your day takes you.',ARRAY['Adaptive noise cancellation','Fold-flat travel design','Clear voice calls','Up to 36 hours battery'],'top left',9,false),
('creator-camera-kit','Creator Camera Kit','Cameras',899,1049,4.9,'A versatile compact camera kit made for sharp photos and smooth video.',ARRAY['24MP sensor','4K video','Quick subject tracking','Travel-friendly build'],'top right',5,false),
('active-smartwatch','Active Smartwatch','Wearables',279,329,4.5,'Keep your goals in sight with smart tracking and everyday comfort.',ARRAY['Activity tracking','Sleep insights','Water resistant','Long-lasting battery'],'bottom left',14,false),
('mini-home-speaker','Mini Home Speaker','Smart Home',119,149,4.7,'A compact speaker with beautifully clear audio for every room.',ARRAY['Wireless streaming','Compact footprint','Rich balanced sound','Easy pairing'],'bottom right',3,false);