-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles (Extends Supabase Auth)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  role text default 'customer' check (role in ('admin', 'customer', 'staff')),
  avatar_url text,
  loyalty_points integer default 0,
  referral_code text unique,
  referred_by_user_id uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Categories
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  parent_id uuid references categories(id) on delete set null,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Products
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text,
  sku text unique,
  base_price numeric(10, 2) not null,
  discount_price numeric(10, 2),
  stock integer default 0,
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  category_id uuid references categories(id) on delete set null,
  tags text[],
  thumbnail_url text,
  gallery_urls text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Product Variants
create table product_variants (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  name text not null, -- e.g., "Size", "Color"
  value text not null, -- e.g., "M", "Red"
  price_adjustment numeric(10, 2) default 0,
  stock integer default 0,
  sku text,
  created_at timestamptz default now()
);

-- 5. Carts
create table carts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade, -- Nullable for guest carts if needed
  session_id text, -- For guest carts
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. Cart Items
create table cart_items (
  id uuid default gen_random_uuid() primary key,
  cart_id uuid references carts(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  variant_id uuid references product_variants(id),
  quantity integer default 1 check (quantity > 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. Shipping Addresses
create table shipping_addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text,
  postal_code text not null,
  country text not null default 'Bangladesh',
  phone text,
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. Coupons
create table coupons (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  type text default 'percentage' check (type in ('percentage', 'fixed_amount')),
  value numeric(10, 2) not null,
  min_order_amount numeric(10, 2) default 0,
  start_date timestamptz default now(),
  end_date timestamptz,
  usage_limit integer,
  per_user_limit integer default 1,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 9. Orders
create table orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete set null,
  shipping_address_id uuid references shipping_addresses(id),
  status text default 'pending' check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  total_amount numeric(10, 2) not null,
  discount_amount numeric(10, 2) default 0,
  shipping_cost numeric(10, 2) default 0,
  final_amount numeric(10, 2) not null,
  payment_method text, -- e.g., 'bkash', 'cod', 'stripe'
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  coupon_code text,
  tracking_number text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10. Order Items
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id),
  product_name text not null, -- Snapshot
  quantity integer not null,
  price numeric(10, 2) not null, -- Snapshot of price at purchase
  created_at timestamptz default now()
);

-- 11. Payments
create table payments (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  transaction_id text,
  provider text, -- e.g., 'stripe', 'sslcommerz'
  amount numeric(10, 2) not null,
  currency text default 'BDT',
  status text default 'pending',
  created_at timestamptz default now()
);

-- 12. Wishlists
create table wishlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- 13. Reviews
create table reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  is_approved boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 14. Banners
create table banners (
  id uuid default gen_random_uuid() primary key,
  title text,
  image_url text not null,
  link_url text,
  position integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 15. Site Settings
create table site_settings (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  value jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 16. Admin Logs
create table admin_logs (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid references profiles(id) on delete set null,
  action text not null,
  details jsonb,
  ip_address text,
  created_at timestamptz default now()
);

-- RLS Policies

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table shipping_addresses enable row level security;
alter table wishlists enable row level security;
alter table reviews enable row level security;
alter table products enable row level security;

-- Profiles: Users can view/edit their own, Admins can view/edit all
create policy "Public profiles are viewable by everyone" 
  on profiles for select using (true);

create policy "Users can insert their own profile" 
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile" 
  on profiles for update using (auth.uid() = id);

-- Products: Viewable by everyone (if published), Full access for Admins
create policy "Published products are viewable by everyone"
  on products for select using (status = 'published');

create policy "Admins can maintain products"
  on products for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Carts: Users can see only their own
create policy "Users can view own cart"
  on carts for select using (user_id = auth.uid());
  
create policy "Users can insert own cart"
  on carts for insert with check (user_id = auth.uid());

create policy "Users can update own cart"
  on carts for update using (user_id = auth.uid());

-- Orders: Users can see own, Admins can see all
create policy "Users can view own orders"
  on orders for select using (user_id = auth.uid());

create policy "Admins can view all orders"
  on orders for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Triggers for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on profiles for each row execute function update_updated_at_column();
create trigger update_products_updated_at before update on products for each row execute function update_updated_at_column();
create trigger update_orders_updated_at before update on orders for each row execute function update_updated_at_column();
 
 - -   1 7 .   L o y a l t y   T r a n s a c t i o n s  
 c r e a t e   t a b l e   l o y a l t y _ t r a n s a c t i o n s   (  
     i d   u u i d   d e f a u l t   g e n _ r a n d o m _ u u i d ( )   p r i m a r y   k e y ,  
     u s e r _ i d   u u i d   r e f e r e n c e s   p r o f i l e s ( i d )   o n   d e l e t e   c a s c a d e   n o t   n u l l ,  
     t y p e   t e x t   n o t   n u l l ,   - -   ' E A R N _ P U R C H A S E ' ,   ' E A R N _ R E F E R R A L ' ,   ' W I T H D R A W _ R E Q U E S T ' ,   ' W I T H D R A W _ R E J E C T E D _ R E F U N D '  
     p o i n t s   i n t e g e r   n o t   n u l l ,  
     t k _ a m o u n t   n u m e r i c ( 1 0 ,   2 )   d e f a u l t   0 ,  
     o r d e r _ i d   t e x t ,   - -   C a n   b e   i n t e r n a l   I D   o r   s t r i n g   I D  
     m e t a _ j s o n   j s o n b ,  
     c r e a t e d _ a t   t i m e s t a m p t z   d e f a u l t   n o w ( )  
 ) ;  
  
 - -   1 8 .   W i t h d r a w   R e q u e s t s  
 c r e a t e   t a b l e   w i t h d r a w _ r e q u e s t s   (  
     i d   u u i d   d e f a u l t   g e n _ r a n d o m _ u u i d ( )   p r i m a r y   k e y ,  
     u s e r _ i d   u u i d   r e f e r e n c e s   p r o f i l e s ( i d )   o n   d e l e t e   c a s c a d e   n o t   n u l l ,  
     p o i n t s _ a m o u n t   i n t e g e r   n o t   n u l l ,  
     w i t h d r a w _ t k   n u m e r i c ( 1 0 ,   2 )   n o t   n u l l ,  
     m e t h o d   t e x t   n o t   n u l l ,   - -   ' B K A S H ' ,   ' N A G A D '  
     n u m b e r   t e x t   n o t   n u l l ,  
     s t a t u s   t e x t   d e f a u l t   ' P R O C E S S I N G '   c h e c k   ( s t a t u s   i n   ( ' P R O C E S S I N G ' ,   ' C O M P L E T E D ' ,   ' R E J E C T E D ' ) ) ,  
     c r e a t e d _ a t   t i m e s t a m p t z   d e f a u l t   n o w ( ) ,  
     u p d a t e d _ a t   t i m e s t a m p t z   d e f a u l t   n o w ( )  
 ) ;  
  
 - -   E n a b l e   R L S  
 a l t e r   t a b l e   l o y a l t y _ t r a n s a c t i o n s   e n a b l e   r o w   l e v e l   s e c u r i t y ;  
 a l t e r   t a b l e   w i t h d r a w _ r e q u e s t s   e n a b l e   r o w   l e v e l   s e c u r i t y ;  
  
 - -   P o l i c i e s   f o r   L o y a l t y   T r a n s a c t i o n s  
 c r e a t e   p o l i c y   " U s e r s   c a n   v i e w   o w n   t r a n s a c t i o n s "  
     o n   l o y a l t y _ t r a n s a c t i o n s   f o r   s e l e c t   u s i n g   ( u s e r _ i d   =   a u t h . u i d ( ) ) ;  
  
 c r e a t e   p o l i c y   " A d m i n s   c a n   v i e w   a l l   t r a n s a c t i o n s "  
     o n   l o y a l t y _ t r a n s a c t i o n s   f o r   s e l e c t   u s i n g   (  
         e x i s t s   ( s e l e c t   1   f r o m   p r o f i l e s   w h e r e   i d   =   a u t h . u i d ( )   a n d   r o l e   =   ' a d m i n ' )  
     ) ;  
  
 - -   P o l i c i e s   f o r   W i t h d r a w   R e q u e s t s  
 c r e a t e   p o l i c y   " U s e r s   c a n   v i e w   o w n   w i t h d r a w   r e q u e s t s "  
     o n   w i t h d r a w _ r e q u e s t s   f o r   s e l e c t   u s i n g   ( u s e r _ i d   =   a u t h . u i d ( ) ) ;  
  
 c r e a t e   p o l i c y   " U s e r s   c a n   i n s e r t   o w n   w i t h d r a w   r e q u e s t s "  
     o n   w i t h d r a w _ r e q u e s t s   f o r   i n s e r t   w i t h   c h e c k   ( u s e r _ i d   =   a u t h . u i d ( ) ) ;  
  
 c r e a t e   p o l i c y   " A d m i n s   c a n   m a i n t a i n   w i t h d r a w   r e q u e s t s "  
     o n   w i t h d r a w _ r e q u e s t s   f o r   a l l   u s i n g   (  
         e x i s t s   ( s e l e c t   1   f r o m   p r o f i l e s   w h e r e   i d   =   a u t h . u i d ( )   a n d   r o l e   =   ' a d m i n ' )  
     ) ;  
 